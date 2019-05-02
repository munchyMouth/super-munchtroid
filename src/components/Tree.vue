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

<style>
  .tree {
    height:auto;
    overflow: hidden;
  }
  .tree > div:first-child {
    display: flex;
    justify-content: flex-start;
    flex-direction: row;
    width: 100%;
  }
  .tree > div:first-child div:first-child {
    width: auto;
  }
  .tree > div:first-child div:last-child {
    padding-left: 1rem;
  }
  .tree__button:first-child > button {
    border: none;
    width: 1rem;
    height: 1rem;
  }
  .tree__chevron {
    background: transparent;
    transition: transform .5s;
  }
  .tree__chevron--open {
    transform: rotate(90deg);
    transition: transform .5s;
  }
  .tree__slot {
    opacity: 0;
    transform: scaleY(0);
    transform-origin: top;
    font-size: 0;
    height: 0;
    /* transition: opacity .2s ease-out, height .2s ease-out, transform .2s ease-out; */
  }
  .tree__slot button div, .tree__slot button > svg {
    transform: scale(0);
    transition: transform .2s ease-in 0s;
  }
  .tree__slot--open {
    transform-origin: top;
    transform: scaleY(1);
    height: 100%;
    transition: transform .2s ease-in 0s, font-size .2s ease-in;
  }
  .tree__title--open {
    font-weight: bold;
  }
</style>
