<template>
  <div class="tree-li">
    <slot />
  </div>
</template>

<script>

export default {
  name: 'tree',
  components: {
  },
  data () {
    return {
    }
  },
  computed: {
  }
}
</script>

<style>
  .tree-li {
    padding-left: 10px;
    overflow: hidden;
  }
</style>
