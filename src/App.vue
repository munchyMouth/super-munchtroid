<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { ipcRenderer } from 'electron'
import { debounce } from 'lodash'

import { genericException } from './libs/messages.json'
import { getUpdatedVramTiles } from './components/Miscellaneous.js'

let debouncedKeyCommands

export default {
  name: 'App',
  components: {
  },
  computed: {
    ...mapGetters([
      'edit16x16',
      'noSelectedTile',
      'loading',
      'currentFrameIndex',
      'eventObserver',
      'hasUnsavedSprites',
      'layoutDrawerOpen',
      'selectedTile',
      'selectedTiles',
      'showHelp',
      'tileMaps',
      'vram'])
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
  },
  beforeCreate () {
    ipcRenderer.send('attachMenuEvents')
  },
  mounted () {
    debouncedKeyCommands = debounce(this.keyCommands, 150)
    window.addEventListener('keydown', debouncedKeyCommands)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', debouncedKeyCommands)
  },
  updated () {
    try {
      const events = ['Beams', 'Missile', 'Palettes', 'Pose', 'Repoint', 'ROM', 'Sprite', 'Sprites', 'VRAM Tile', 'VRAM Tiles']
      events.forEach(function (it) {
        ipcRenderer.on(`${it} Error`, function (event, error) {
          this.setError(error)
        }.bind(this))
      }.bind(this))
      this.renderEvent(
        'Beams Saved',
        async function (event, object) {
          try {
            this.setLoading(false)
            this.success('Beams Saved!')
            this.setBeamOffsetData(object.beam)
          } catch (e) {
            this.setError({
              type: 'BeamRendererSaveException',
              title: 'Failed to save your ROM: Error in renderer',
              message: [e.message]
            })
          }
        }.bind(this)
      )

      this.renderEvent(
        'Frame Repointed',
        async function (event, object) {
          this.setLoading(false)
          this.refreshFrame()
          this.success('Data Repointed!')
        }.bind(this))

      this.renderEvent(
        'Missile Fins Saved',
        async function (event, object) {
          this.setLoading(false)
          this.updateUndoMissileFins()
          this.success('Missile Fins Updated!')
        }.bind(this))

      this.renderEvent(
        'ROM Loaded',
        async function (event, object) {
          try {
            this.clearConfirmed()
            this.setSettings({
              PALETTES: object.PALETTES,
              POSES: object.POSES,
              SPECIAL_POSES: object.SPECIAL_POSES
            })
            await this.setSamus(object)
            this.setBeamOffsetData(object.beam)
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
          if (!this.hasUnsavedSprites) this.clearUpdateSprite()
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

      ipcRenderer.on('Shortcut Save', function () {
        this.shortcutTriggerFullSaveToggle()
      }.bind(this))
      ipcRenderer.on('Shortcut Help', function () {
        if (!this.showHelp) {
          this.toggleShowHelp()
        }
      }.bind(this))
    } catch (e) {
      this.setError({
        type: 'genericRendererException',
        title: 'Generic Renderer Exception',
        message: [genericException, this.eventObserver, e.message]
      })
    }
  },
  methods: {
    ...mapActions([
      'clearConfirmed',
      'clearUpdatePalette',
      'clearUpdateSprite',
      'clearUpdateVram',
      'clearVramUpdateFlag',
      'decrementFrameToggle',
      'incrementFrameToggle',
      'pastecopiedTile',
      'popFromUndoCache',
      'refreshFrame',
      'setBeamOffsetData',
      'setCopiedTileData',
      'setEventObserver',
      'setError',
      'setLoading',
      'setPalettes',
      'setSamus',
      'setSettings',
      'shiftFromRedoCache',
      'shortcutTriggerFullSaveToggle',
      'toggleLayoutDrawerOpen',
      'toggleSaveEventListener',
      'toggleSaveKeyEvent',
      'toggleShowHelp',
      'updateUndoMissileFins'
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
    handleEditorCommands (evt) {
      switch (true) {
        case evt.key.toLowerCase() === 'z' && evt.ctrlKey:
          this.popFromUndoCache()
          break
        case evt.key.toLowerCase() === 'y' && evt.ctrlKey:
          this.shiftFromRedoCache()
          break
        case evt.key.toLowerCase() === 'c' && evt.ctrlKey:
          if (!this.edit16x16) this.setCopiedTileData()
          else alert('you can only copy an 8x8 tile!')
          break
        case evt.key.toLowerCase() === 'v' && evt.ctrlKey:
          if (!this.edit16x16) this.pastecopiedTile()
          else alert('you can only paste onto an 8x8 tile!')
          break
        case evt.key.toLowerCase() === 's' && evt.ctrlKey:
          this.toggleSaveKeyEvent()
          break
      }
    },
    keyCommands (evt, elem) {
      switch (true) {
        case evt.keyCode === 27: // escape
          if (this.showHelp) this.toggleShowHelp()
          break
        case evt.keyCode === 220 && evt.ctrlKey: // ctrl+backslash
          this.toggleLayoutDrawerOpen()
          break
        case evt.keyCode === 38 && evt.ctrlKey: // ctrl+up
          elem = document.querySelector('.settings__dropdown')
          if (elem.selectedIndex > 0) {
            elem.selectedIndex -= 1
            elem.dispatchEvent(new Event('change'))
          }
          break
        case evt.keyCode === 40 && evt.ctrlKey: // ctrl+down
          elem = document.querySelector('.settings__dropdown')
          if (elem.selectedIndex < elem.childElementCount - 1) {
            elem.selectedIndex += 1
            elem.dispatchEvent(new Event('change'))
          }
          break
        case evt.keyCode === 39 && evt.ctrlKey: // ctrl+right
          this.incrementFrameToggle()
          break
        case evt.keyCode === 37 && evt.ctrlKey: // ctrl+left
          this.decrementFrameToggle()
          break
        case this.tileMaps && Object.keys(this.tileMaps).length && !this.noSelectedTile:
          this.handleEditorCommands(evt)
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
  }
}
</script>

<style>
#q-app {
  min-width: 1084px;
}
html,
body,
#q-app {
  height: 100%;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
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
  width: 0.66rem !important;
}
input.six-char {
  margin: 0 1rem 0 1rem;
  width: 4.2rem !important;
}
</style>
