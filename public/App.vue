<template>
<div>
  <hr />
  <h2 v-if="error">Error: {{error}}</h2>
  <h2 v-else><span v-if="loading">Loading </span>results for {{pkgName}}</h2>
  <p v-if="!loading && !dependencies.length">No dependencies</p>
  <ul>
    <PackageItem v-for="dependency in dependencies" :key="dependency.link" :dependency="dependency" />
  </ul>
</div>
</template>

<script>
import { resolvePackage, resolveChildren } from './resolvers';
import PackageItem from './PackageItem';
import cloneDeep from 'lodash/cloneDeep';

export default {
  name: 'app',
  components: {
    PackageItem,
  },
  data() {
    return {
      dependencies: [],
      pkgName: null,
      error: null,
      loading: false,
    };
  },
  props: ['pkg'],
  async mounted() {
    this.loading = true;
    this.pkgName = this.pkg;
    const root = await resolvePackage(this.$props.pkg); // seed the root
    if (root.error) {
      this.error = root.error;
      return;
    }
    this.pkgName = `${root.name}@${root.version}`; // update to the exact version we are resolving

    let calls = 0;
    const result = await resolveChildren(root, async () => {
      calls += 1;
      if (calls % 100 === 0) {
        this.$set(this, 'dependencies', cloneDeep(root.dependencies));
        this.$forceUpdate();
        await this.$nextTick();
      }
    });

    this.$set(this, 'dependencies', result);
    this.$forceUpdate();
    this.loading = false;
  }
};
</script>
