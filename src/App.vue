<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { ipcRenderer } from 'electron'

import { genericException } from './libs/messages.json'
import { getUpdatedVramTiles } from './components/Miscellaneous.js'

export default {
  name: 'App',
  computed: {
    ...mapGetters([
      'loading',
      'currentFrameIndex',
      'eventObserver',
      'selectedTile',
      'selectedTiles',
      'vram'])
  },
  methods: {
    ...mapActions([
      'clearUpdatePalette',
      'clearUpdateSprite',
      'clearUpdateVram',
      'clearVramUpdateFlag',
      'setEventObserver',
      'setError',
      'setLoading',
      'setPalettes',
      'setSamus',
      'setSettings',
      'toggleSaveEventListener'
    ]),
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
    renderEvent (title, callback) {
      ipcRenderer.on(title, callback)
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
    try {
      const events = ['Palettes', 'Pose', 'ROM', 'Sprite', 'Sprites', 'VRAM Tile', 'VRAM Tiles']
      events.forEach(function (it) {
        ipcRenderer.on(`${it} Error`, function (event, error) {
          this.setError(error)
        }.bind(this))
      }.bind(this))

      this.renderEvent(
        'ROM Loaded',
        async function (event, object) {
          try {
            this.setSettings({
              PALETTES: object.PALETTES,
              POSES: object.POSES,
              SPECIAL_POSES: object.SPECIAL_POSES
            })
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

      this.renderEvent(
        'Pose loaded',
        async function (event, object) {
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

      this.renderEvent(
        'Palettes Loaded',
        function (event, object) {
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

      this.renderEvent(
        'Palettes Saved',
        function () {
          this.setLoading(false)
          this.clearUpdatePalette()
          this.success('Palette(s) Saved!')
        }.bind(this))

      this.renderEvent(
        'Sprite Saved',
        function () {
          this.setLoading(false)
          this.clearUpdateSprite()
          this.success('Sprite Saved!')
        }.bind(this))

      this.renderEvent(
        'Sprites Saved',
        function () {
          this.setLoading(false)
          this.clearUpdateSprite()
          this.success('All Sprites Saved!')
        }.bind(this))

      this.renderEvent(
        'VRAM Tile Saved',
        function () {
          this.clearVramUpdateFlag({
            frameIndex: this.currentFrameIndex,
            ...this.selectedTile
          })
          if (!getUpdatedVramTiles(this.vram).length) this.clearUpdateVram()
          this.toggleSaveEventListener()
          this.setLoading(false)
          this.success('Tile Saved!')
        }.bind(this))
      this.renderEvent(
        'VRAM Tiles Saved',
        function (event, { save16x16 }) {
          if (!save16x16) {
            getUpdatedVramTiles(this.vram, function (obj) {
              this.clearVramUpdateFlag(obj)
            }.bind(this))
          } else {
            this.selectedTiles.forEach(function (it) {
              this.clearVramUpdateFlag({
                frameIndex: this.currentFrameIndex,
                ...it
              })
            }.bind(this))
            this.toggleSaveEventListener()
          }
          if (!getUpdatedVramTiles(this.vram).length) this.clearUpdateVram()
          this.success('Tile(s) Saved!')
          this.setLoading(false)
        }.bind(this))
    } catch (e) {
      this.setError({
        type: 'genericRendererException',
        title: 'Generic Renderer Exception',
        message: [genericException, this.eventObserver, e.message]
      })
    }
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
