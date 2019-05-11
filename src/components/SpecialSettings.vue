<template>
  <div>
    <button @click="loadSpecial">
    Load DMA
    </button></div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'special-settings',
  data () {
    return {}
  },
  computed: {
    ...mapGetters([
      'filePath'
    ])
  },
  methods: {
    ...mapActions([
      'setLoading'
    ]),
    loadSpecial () {
      this.setLoading(true)
      ipcRenderer.send(
        'Load Special Pose', {
          filePath: this.filePath,
          top: 8,
          bottom: 8
        })
    }
  }
}
</script>

<style>
</style>
