<template>
  <div class="tree-li">
    <slot></slot>
  </div>
</template>

<script>

export default {
  name: 'tree',
  computed: {
  },
  components: {
  },
  data () {
    return {
    }
  }
}
</script>

<style>
  .tree-li {
    padding-left: 10px;
    overflow: hidden;
  }
</style>
