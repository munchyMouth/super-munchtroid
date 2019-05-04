<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { ipcRenderer } from 'electron'

import { getUpdatedVramTiles } from './components/Miscellaneous.js'

export default {
  name: 'App',
  computed: {
    ...mapGetters([
      'loading',
      'currentFrameIndex',
      'selectedTile',
      'vram'])
  },
  methods: {
    ...mapActions([
      'clearUpdatePalette',
      'clearUpdateSprite',
      'clearUpdateVram',
      'clearVramUpdateFlag',
      'setError',
      'setLoading',
      'setPalettes',
      'setSamus',
      'setSettings']),
    fail ({ type, title, message }, color = 'negative', timeout = 120000) {
      if (message) {
        this.$q.notify({
          color,
          message: title,
          position: 'middle',
          timeout,
          detail: message
        })
      }
    },
    success (message, color = 'positive') {
      if (message) {
        this.$q.notify({
          message,
          position: 'bottom',
          color,
          timeout: 1000
        })
      }
    }
  },
  beforeCreate () {
    ipcRenderer.send('attachMenuEvents')
  },
  updated () {
    ipcRenderer.on('ROM Loaded', async function (event, object) {
      try {
        this.setSettings({ PALETTES: object.PALETTES, POSES: object.POSES })
        await this.setSamus(object)
        this.setPalettes(object)
      } catch (e) {
        this.setError({
          type: 'RomRendererLoadException',
          title: 'Failed to load your ROM: Error in renderer',
          message: [
            'Check that the ROM is valid',
            'The ROM must be unheadered',
            'If you are using a modified ROM, check DMA and animation data'
          ]
        })
      }
    }.bind(this))
    ipcRenderer.on('ROM Error', function (event, error) {
      this.setLoading(false)
      this.setError(error)
    }.bind(this))

    ipcRenderer.on('Pose loaded', async function (event, object) {
      try {
        await this.setSamus(object)
      } catch (e) {
        this.setError({
          type: 'PoseRendererLoadException',
          title: 'Failed to load a pose: Error in renderer',
          message: [e.message]
        })
      }
    }.bind(this))
    ipcRenderer.on('Pose Error', function (event, object) {
      this.setLoading(false)
      this.setError(object)
    }.bind(this))

    ipcRenderer.on('Palettes Loaded', function (event, object) {
      try {
        this.setPalettes(object)
      } catch (e) {
        this.setError({
          type: 'PaletteRendererLoadException',
          title: 'Failed to load a palette: Error in renderer',
          message: [e.message]
        })
      }
    }.bind(this))
    ipcRenderer.on('Palettes Saved', function () {
      this.setLoading(false)
      this.clearUpdatePalette()
      this.success('Palette(s) Saved!')
    }.bind(this))
    ipcRenderer.on('Palettes Error', function (event, object) {
      this.setLoading(false)
      this.setError(object)
      this.fail(object)
    }.bind(this))

    ipcRenderer.on('Sprite Saved', function () {
      this.setLoading(false)
      this.clearUpdateSprite()
      this.success('Sprite Saved!')
    }.bind(this))
    ipcRenderer.on('Sprite Error', function (event, object) {
      this.setLoading(false)
      this.setError(object)
      this.fail(object)
    }.bind(this))
    ipcRenderer.on('Sprites Saved', function () {
      this.setLoading(false)
      this.clearUpdateSprite()
      this.success('All Sprites Saved!')
    }.bind(this))
    ipcRenderer.on('Sprites Error', function (event, object) {
      this.setLoading(false)
      this.setError(object)
      this.fail(object)
    }.bind(this))

    ipcRenderer.on('VRAM Tile Saved', function () {
      this.clearVramUpdateFlag({
        frameIndex: this.currentFrameIndex,
        ...this.selectedTile
      })
      if (!getUpdatedVramTiles(this.vram).length) this.clearUpdateVram()
      this.setLoading(false)
      this.success('Tile Saved!')
    }.bind(this))
    ipcRenderer.on('VRAM Tile Error', function (event, object) {
      this.setLoading(false)
      this.setError(object)
      this.fail(object)
    }.bind(this))
    ipcRenderer.on('VRAM Tiles Saved', function () {
      getUpdatedVramTiles(this.vram, function (obj) {
        this.clearVramUpdateFlag(obj)
      }.bind(this))
      this.clearUpdateVram()
      this.success('Tile(s) Saved!')
      this.setLoading(false)
    }.bind(this))
    ipcRenderer.on('VRAM Tiles Error', function (event, object) {
      this.setLoading(false)
      this.setError(object)
      this.fail(object)
    }.bind(this))
  },
  watch: {
    loading (val) {
      if (val) {
        this.$q.loading.show({
          message: 'Loading',
          messageColor: 'white',
          spinnerColor: 'white',
          spinnerSize: 250 // in pixels
        })
      } else this.$q.loading.hide()
    }
  }
}
</script>

<style>
#q-app {
  min-width: 1084px;
}
html, body, #q-app {
  height: 100%;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select:none;
  -o-user-select:none;
  user-select:none;
}
.q-layout,
.q-layout-page-container,
.q-layout-page {
  height: 100%;
}
button.no-style {
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
}
input.one-char {
  margin: 0 1rem 0 1rem;
  width: .66rem !important;
}
input.six-char {
  margin: 0 1rem 0 1rem;
  width: 4.2rem !important;
}
</style>
