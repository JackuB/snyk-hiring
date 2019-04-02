import Vue from 'vue'
import App from './App.vue';

let mountedApp = {};
function handleSearch(form) {
  if (mountedApp.$el) {
    mountedApp.$destroy();
    console.log(mountedApp);
  }
  mountedApp = new Vue({
    el: mountedApp.$el || '#app',
    render: h => h(App, { props: { pkg: form.identifier.value.toLowerCase() }}),
  });
  return false;
}

window.handleSearch = handleSearch;
