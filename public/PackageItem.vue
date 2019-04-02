<template>
<li>
  <details open>
    <summary>
      <code>
        {{dependency.name}}@{{dependency.version}}
        <span v-if="dependency.loop" class="warn">Dependency loop detected</span>
        <span v-else>
          <span v-if="dependency.version !== dependency.resolved">
            <small v-if="dependency.resolved">Resolved to {{dependency.resolved}}</small>
            <small v-else>Loading…</small>
          </span>
        </span>
      </code>
    </summary>

    <ul v-if="dependency.dependencies && !dependency.loop">
      <packageItem v-for="dependency in dependency.dependencies" :key="dependency.link" :dependency="dependency"></packageItem>
    </ul>
  </details>
</li>
</template>

<script>
export default {
  name: 'PackageItem',
  props: ['dependency'],
};
</script>
