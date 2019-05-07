<template>
  <div class="tree">
    <div>
      <div class="tree__button">
      <button class="no-style"
        @click="openClose()">
        <icon :class="`tree__chevron${open ? '--open' : ''}`"
              name="chevron-right" />
      </button>
      </div>
      <div>
      <button @click="openClose()"
              class="no-style">
      <span :class="`tree__title${open ? '--open' : ''}`">{{ label }}</span>
      </button>
      </div>
    </div>
    <div :class="`tree__content tree__slot${open ? '--open' : ''}`">
      <slot :open="open"></slot>
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/chevron-right'
import Icon from 'vue-awesome/components/Icon'

export default {
  name: 'tree',
  props: ['label', 'openOverride'],
  computed: {
    treeSlots () {
      return new Array(this.size)
    }
  },
  components: {
    Icon
  },
  data () {
    return {
      open: false
    }
  },
  methods: {
    handleOpenOverride (value) {
      this.open = typeof value === 'number'
        ? value === this.$vnode.key
        : false
    },
    openClose () {
      this.open = !this.open
      if (this.open) this.$emit('opened', this.$vnode.key)
      else this.$emit('closed', this.$vnode.key)
    }
  },
  watch: {
    openOverride (newVal) {
      this.handleOpenOverride(newVal)
    }
  },
  created () {
    this.handleOpenOverride(this.openOverride)
  }
}
</script>

<style>@import '../css/tree.css';</style>
