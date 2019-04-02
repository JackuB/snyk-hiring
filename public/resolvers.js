// For a memoize function
let cache = {};

export async function resolvePackage(pkg) {
  if (!cache[pkg]) {
    // Save promise of the result to cache, this way simultaneous request can wait on that single call
    cache[pkg] = fetch(`/p/${pkg}`);
  }

  const response = await cache[pkg];
  // .clone() needs to be called, because it looks like you can have only a single simultaneous read from fetch response stream
  return await response.clone().json();
}

export async function resolveChildren(obj, progressCb, parents = []) {
  return await Promise.all(
    obj.dependencies.map(async (d, i) => {
      const { version, dependencies } = await resolvePackage(`${d.name}@${d.version}`);
      /*
        I'm mutating the parent object directly - I'd rather not to, but not sure if there is a nice way
        to keep these actions immutable, yet still have the partial object available for rendering
      */
      obj.dependencies[i] = {
        ...d,
        resolved: version,
        dependencies,
      };

      /*
        Somewhere at this point, we should deal with infinite recursion
        npm is dealing it by moving every package as close to the top as possible
        https://docs.npmjs.com/cli/install#algorithm
        without trying to keep the tree structure. Since we want to show the tree structure,
        we need to detect possible infinite loop (afaik)
      */
      const newParents = parents.concat(obj.link);
      if (newParents.length !== new Set(newParents).size) {
        // Check if the parents are repeating - if so, it's a recursion and stop it
        obj.loop = true;
        return {};
      }

      await resolveChildren(obj.dependencies[i], progressCb, newParents);
      await progressCb();
      return obj.dependencies[i];
    })
  );
}
