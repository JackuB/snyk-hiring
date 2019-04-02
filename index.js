const pacote = require('pacote');
const express = require('express');
const Bundler = require('parcel-bundler');

const app = express();

/*
  Opening to POST could allow us to accept more packages at the same time
  But caching large resulting objects wouldn't be as fast as smaller single-package ones
  Plus it keeps app tidy
*/
app.get('/p/:identifier(*)', async (req, res) => {
  // we allow for query parameter as well for noscript version of the frontend form
  const identifier = req.params.identifier || req.query.identifier;

  if (!identifier) { return res.status(404).json({ error: 'Missing package name' }); }
  if (!/^@?[\da-zA-Z\/@^=|_\-~.>< ]+$/.test(identifier)) { return res.status(400).json({ error: 'Invalid package name' }); }

  try {
    // pacote just wraps npm methods to request packages and version resolutions
    const { name, version, dependencies } = await pacote.manifest(identifier);

    // Resolve to exact version if found (allows for caching as well)
    const pkgId = `${name}@${version}`;
    if (pkgId !== identifier) {
      return res.redirect(302, `/p/${pkgId}`);
    }

    const normalisedDependencies = Object.keys(dependencies).map(d => ({
      name: d,
      version: dependencies[d],
      link: `/p/${d}@${dependencies[d]}`,
    }));

    res.set('Cache-Control', 'public, max-age=31557600');

    return res.json({
      name,
      version,
      link: `/p/${pkgId}`,
      dependencies: normalisedDependencies
    });
  } catch (err) {
    if (err.statusCode === 404) {
      // TODO: What does it mean? Unpublished package? Invalid package.json?
      return res.status(404).json({ error: 'Package not found' });
    }

    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Handle frontend build and serving
const bundler = new Bundler('public/index.html', {});
app.use(bundler.middleware());

app.listen(process.env.PORT || 8080);