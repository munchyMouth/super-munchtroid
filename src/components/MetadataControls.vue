<template>
  <div class="controls">
    <div class="controls__title">
      Copy/Paste
    </div>
    <div class="controls__body">
      <div class="pointers --top">
        <div class="pointers__title">
          Top pointers:
        </div>
        <button
          class="no-style"
          style="color: black"
          title="copy top pointers"
          @click="copy('top')"
        >
          <icon name="copy" />
        </button>
        &nbsp;
        <button
          class="no-style"
          style="color: black"
          title="paste top pointers"
          :disabled="pointerClipboardHasTop ? false : 'disabled'"
          @click="paste('top')"
        >
          <icon name="paste" />
        </button>
      </div>
      <div class="pointers --bottom">
        <div class="pointers__title">
          Bot pointers:
        </div>
        <button
          class="no-style"
          style="color: black"
          title="copy bottom pointers"
          @click="copy('bottom')"
        >
          <icon name="copy" />
        </button>
        &nbsp;
        <button
          class="no-style"
          style="color: black"
          title="paste bottom pointers"
          :disabled="pointerClipboardHasBottom ? false : 'disabled'"
          @click="paste('bottom')"
        >
          <icon name="paste" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import 'vue-awesome/icons/copy'
import 'vue-awesome/icons/paste'
import Icon from 'vue-awesome/components/Icon'

export default {
  components: {
    Icon
  },
  props: ['dma', 'frame'],
  computed: {
    ...mapGetters(['pointerClipboard', 'pointerClipboardHasBottom', 'pointerClipboardHasTop'])
  },
  methods: {
    ...mapActions(['setPointerClipboardByHalf']),
    copy (topBottom) {
      this.setPointerClipboardByHalf({
        dma: this.dma,
        frame: this.frame,
        half: topBottom
      })
      this.$q.notify({
        message: `${topBottom} pointers copied!`,
        position: 'bottom',
        color: 'positive',
        timeout: 1000
      })
    },
    paste (topBottom) {
      this.$emit('paste', { half: topBottom, ...this.pointerClipboard })
      this.$q.notify({
        message: `${topBottom} pointers pasted!`,
        position: 'bottom',
        color: 'positive',
        timeout: 1000
      })
    }
  }
}
</script>

<style scoped>
.controls {
  font-size: 12px;
  border: 1px solid #cccc;
  background: #eeee;
  padding: 5px;
  margin-bottom: 10px;
}
.controls__title,
.pointers__title {
  margin-bottom: 5px;
}
.controls__body {
  font-size: 10px;
  display: flex;
  justify-content: space-between;
}
.controls__body .pointers {
  text-align: center;
  width: 50%;
}
.controls__body .pointers.--bottom {
  border-left: 1px solid #cccc;
}
</style>
