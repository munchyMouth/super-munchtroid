<!-- Note: the actual drawing command is defined in index.vue. -->
<template>
  <div class="editor">
    <div class="editor__canvas">
      <div>
        <div class="editor__canvas__top-tools">
          <button
            class="no-style"
            @click="shrinkEditor()"
            title="shrink editor"
          >
            <icon name="search-minus" />
          </button>
          <button
            class="no-style"
            @click="enlargeEditor()"
            title="enlarge editor"
          >
            <icon name="search-plus" />
          </button>
          <button
            :class="`no-style editor__canvas__tools__grid${showGrid ? '--hide' : ''}`"
            @click="toggleGrid()"
            title="show grid"
          >
            <icon name="th-large" />
          </button>
          <template v-if="!noSelectedTile">
            <button
              class="no-style editor__canvas__tools__16x16"
              :disabled="editor16x16TileIsValid(selectedTile) ? false : 'disabled'"
              title="set 16x16 mode"
              @click="toggle16x16(!edit16x16)"
            >
              <div>
                <span :class="edit16x16 ? '--active' : ''">16²</span>
              </div>
            </button>
            <button
              :class="`no-style editor__canvas__tools__save${updated ? '--active' : ''}`"
              @click="saveVramTile()"
              title="save current tile [ctrl^s]"
            >
              <icon name="save" />
            </button>
            <strong class="editor__canvas__tools__address">
              <button
                class="no-style editor__canvas__tools__button"
                @click="pxFlipEnabled = !pxFlipEnabled"
                title="switch between pixel-flipping/H&amp;V-flip"
              >
              <span style="font-size: 8px; justify-self: centre">px-Flip&nbsp;</span>
              <icon :name="pxFlipEnabled ? 'toggle-on' : 'toggle-off'" />
            </button>
              {{ this.selectedTile.tile._address }}
            </strong>
          </template>
        </div>
        <canvas
          :class="!noSelectedTile ? '--active' : ''"
          ref="editor"
          @mousemove="getMousePos"
          @mouseout="clearActiveMouse"
        ></canvas>
      </div>
      <div :class="editorRatio < 1.1 ? 'editor__canvas__tools--small' : 'editor__canvas__tools'">
        <template v-if="!noSelectedTile">
          <button
            :class="`no-style editor__canvas__tools__flip${editorVFlip ? '--flip' : ''}`"
            @click="toggleVFlip()"
            title="Does not flip the raw VRAM image"
            v-if="!pxFlipEnabled"
          >
            <icon
              style="width: 16px;"
              name="arrows-alt-v"
            />&nbsp;
            <label v-show="editorRatio > 1">(V-flip)</label>
          </button>
          <button
            :class="`no-style editor__canvas__tools__flip${editorVFlip ? '--flip' : ''}`"
            @click="pixelFlipV()"
            title="V-flip the raw image"
            v-else
          >
            <icon
              style="height: 10px; margin-right: 8px"
              name="arrows-alt-v"
            /><span style="font-size: 8px">Px</span>&nbsp;
            <label v-show="editorRatio > 1">(V-px)</label>
          </button>
          <button
            :class="`no-style editor__canvas__tools__flip${editorHFlip ? '--flip' : ''}`"
            @click="toggleHFlip()"
            title="Does not flip the raw VRAM image"
            v-if="!pxFlipEnabled"
          >
            <icon name="arrows-alt-h" />&nbsp;
            <label v-show="editorRatio > 1">(H-flip)</label>
          </button>
          <button
            :class="`no-style editor__canvas__tools__flip${editorVFlip ? '--flip' : ''}`"
            @click="pixelFlipH()"
            title="H-flip the raw image"
            v-else
          >
            <icon
              style="width: 10px; margin-right: 8px"
              name="arrows-alt-h"
            /><span style="font-size: 8px">Px</span>&nbsp;
            <label v-show="editorRatio > 1">(H-px)</label>
          </button>
          <button
            class="no-style editor__canvas__tools__copy"
            @click="setCopiedTileData()"
            :disabled="!edit16x16 ? false : 'disabled'"
            :title="!edit16x16 ? 'copy [ctrl^c]' : 'you can only copy/paste a single tile!'"
          >
            <icon name="copy" />&nbsp;
            <label v-show="editorRatio > 1">(copy)</label>
          </button>
          <button
            class="no-style editor__canvas__tools__paste"
            @click="pastecopiedTile()"
            :disabled="!edit16x16 ? false : 'disabled'"
            :title="!edit16x16 ? 'paste [ctrl^v]' : 'you can only copy/paste a single tile!'"
          >
            <icon name="paste" />&nbsp;
            <label v-show="editorRatio > 1">(paste)</label>
          </button>
          <button
            class="no-style editor__canvas__tools__undo"
            @click="popFromUndoCache()"
            title="undo [ctrl^z]"
          >
            <icon name="undo" />&nbsp;
            <label v-show="editorRatio > 1">(undo)</label>
          </button>
          <button
            class="no-style editor__canvas__tools__redo"
            @click="shiftFromRedoCache()"
            title="redo [ctrl^y]"
          >
            <icon name="redo" />&nbsp;
            <label v-show="editorRatio > 1">(redo)</label>
          </button>
          <div class="editor__canvas__tools__shifters">
            <div>
              <button class="no-style editor__canvas__tools__shifters__button"
                      :title="editorVFlip || editorHFlip ? 'disabled while hflip/vflip are switched on' : 'pixel shift left'"
                      :disabled="editorVFlip || editorHFlip ? 'disabled' : false"
                      @click="horizontalShift('left')">
                <icon name="arrow-left" />
              </button>
              <button class="no-style editor__canvas__tools__shifters__button"
                      :title="editorVFlip || editorHFlip ? 'disabled while hflip/vflip are switched on' : 'pixel shift up'"
                      :disabled="editorVFlip || editorHFlip ? 'disabled' : false"
                      @click="verticalShift('up')">
                <icon name="arrow-up" />
              </button>
            </div>
            <div>
              <button class="no-style editor__canvas__tools__shifters__button"
                      :title="editorVFlip || editorHFlip ? 'disabled while hflip/vflip are switched on' : 'pixel shift right'"
                      :disabled="editorVFlip || editorHFlip ? 'disabled' : false"
                      @click="horizontalShift('right')">
                <icon name="arrow-right" />
              </button>
              <button class="no-style editor__canvas__tools__shifters__button"
                      :title="editorVFlip || editorHFlip ? 'disabled while hflip/vflip are switched on' : 'pixel shift down'"
                      :disabled="editorVFlip || editorHFlip ? 'disabled' : false"
                      @click="verticalShift('down')">
                <icon name="arrow-down" />
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="editor__palette">
      <palette />
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapActions, mapGetters } from 'vuex'
import EditorRedraw from './helpers/EditorRedraw.js'

import 'vue-awesome/icons/search-plus'
import 'vue-awesome/icons/search-minus'
import 'vue-awesome/icons/arrows-alt-v'
import 'vue-awesome/icons/arrows-alt-h'
import 'vue-awesome/icons/copy'
import 'vue-awesome/icons/paste'
import 'vue-awesome/icons/undo'
import 'vue-awesome/icons/redo'
import 'vue-awesome/icons/save'
import 'vue-awesome/icons/th-large'
import 'vue-awesome/icons/toggle-on'
import 'vue-awesome/icons/toggle-off'
import 'vue-awesome/icons/arrow-left'
import 'vue-awesome/icons/arrow-right'
import 'vue-awesome/icons/arrow-down'
import 'vue-awesome/icons/arrow-up'
import Icon from 'vue-awesome/components/Icon'

import Palette from './Palette'

export default {
  name: 'editor',
  components: {
    Icon,
    Palette
  },
  computed: {
    ...mapGetters([
      'activePaletteColor',
      'activePaletteIndex',
      'copiedTileData',
      'edit16x16',
      'editor16x16TileIsValid',
      'editorHFlip',
      'editorVFlip',
      'editorRatio',
      'editorRatioMax',
      'editorRatioMin',
      'filePath',
      'getVramTileByProps',
      'noSelectedTile',
      'palettes',
      'redoCache',
      'refreshPalette',
      'saveEventListener',
      'saveKeyEvent',
      'selectedTile',
      'selectedTiles',
      'userIsDrawing',
      'undoRedoInterim',
      'updateVram'
    ]),
    currentTileIndex () {
      if (this.edit16x16) {
        switch (true) {
          case this.pixelX >= 8 && this.pixelY < 8: return this.incorporateFlipOn16x16(1)
          case this.pixelX < 8 && this.pixelY >= 8: return this.incorporateFlipOn16x16(2)
          case this.pixelX >= 8 && this.pixelY >= 8: return this.incorporateFlipOn16x16(3)
          default: return this.incorporateFlipOn16x16(0)
        }
      } else return -1
    },
    editorSize () {
      return this.tileSize * 8
    },
    pixelX () {
      return Math.floor(this.x / this.variableTileSize)
    },
    pixelY () {
      return Math.floor(this.y / this.variableTileSize)
    },
    pixelX16x16Context () {
      return this.pixelX > 7 ? this.pixelX - 8 : this.pixelX
    },
    pixelY16x16Context () {
      return this.pixelY > 7 ? this.pixelY - 8 : this.pixelY
    },
    tileSize () {
      return this.editorRatio * 32
    },
    variableTileSize () {
      return this.edit16x16 ? this.tileSize / 2 : this.tileSize
    }
  },
  data () {
    return {
      canvas: undefined,
      context: undefined,
      pxFlipEnabled: false,
      showGrid: false,
      updated: false,
      x: -1,
      y: -1
    }
  },
  methods: {
    ...mapActions([
      'setCopiedTileData',
      'pastecopiedTile',
      'popFromUndoCache',
      'pushToUndoCache',
      'setEdit16x16',
      'setEditorActive',
      'setEditorRatio',
      'setSelectedTile',
      'setSelectedTilePersistUndo',
      'setSelectedTilesPersistUndo',
      'setUserIsDrawing',
      'setVramPixel',
      'setVramTile',
      'setLoading',
      'shiftFromRedoCache',
      'toggleHFlip',
      'toggleVFlip'
    ]),
    ...EditorRedraw,
    clearActiveMouse () {
      this.x = -1
      this.y = -1
      this.setEditorActive(false)
      this.redraw()
    },
    enlargeEditor () {
      if (this.editorRatio < this.editorRatioMax) {
        this.setEditorRatio(this.editorRatio + 0.1)
      }
    },
    getMousePos (evt) {
      if (!this.noSelectedTile) {
        this.$refs['editor'].focus()
        var rect = evt.currentTarget.getBoundingClientRect()
        this.setEditorActive(true)
        this.x = evt.clientX - rect.left
        this.y = evt.clientY - rect.top
        this.redraw()
      }
    },
    incorporateFlipOn16x16 (index) {
      switch (index) {
        case 0:
          switch (true) {
            case !this.editorHFlip && !this.editorVFlip: return 0
            case this.editorHFlip && !this.editorVFlip: return 1
            case !this.editorHFlip && this.editorVFlip: return 2
            case this.editorHFlip && this.editorVFlip: return 3
          }
          break
        case 1:
          switch (true) {
            case !this.editorHFlip && !this.editorVFlip: return 1
            case this.editorHFlip && !this.editorVFlip: return 0
            case !this.editorHFlip && this.editorVFlip: return 3
            case this.editorHFlip && this.editorVFlip: return 2
          }
          break
        case 2:
          switch (true) {
            case !this.editorHFlip && !this.editorVFlip: return 2
            case this.editorHFlip && !this.editorVFlip: return 3
            case !this.editorHFlip && this.editorVFlip: return 0
            case this.editorHFlip && this.editorVFlip: return 1
          }
          break
        case 3:
          switch (true) {
            case !this.editorHFlip && !this.editorVFlip: return 3
            case this.editorHFlip && !this.editorVFlip: return 2
            case !this.editorHFlip && this.editorVFlip: return 1
            case this.editorHFlip && this.editorVFlip: return 0
          }
      }
    },
    saveVramTile () {
      if (this.updated) {
        this.setLoading(true)
        if (!this.edit16x16) {
          ipcRenderer.send('Save VRAM Tile', {
            filePath: this.filePath,
            tile: this.getVramTileByProps(this.selectedTile)
          })
        } else {
          ipcRenderer.send('Save VRAM Tiles', {
            filePath: this.filePath,
            tiles: this.selectedTiles.reduce((arr, it) => {
              arr.push(this.getVramTileByProps(it))
              return arr
            }, []),
            save16x16: true
          })
        }
      }
    },
    shrinkEditor () {
      if (this.editorRatio > this.editorRatioMin) {
        this.setEditorRatio(this.editorRatio - 0.1)
      }
    },
    testTileUpdated () {
      if (!this.edit16x16) {
        this.updated =
          this.selectedTile &&
          !this.selectedTile.hasOwnProperty('empty') &&
          this.getVramTileByProps(this.selectedTile)._updated
      } else {
        for (let i = 0; i < 4; i++) {
          if (this.getVramTileByProps(this.selectedTiles[i])._updated) {
            this.updated = true
            return
          }
        }
        this.updated = false
      }
    },
    toggle16x16 (value) {
      if (!value) this.setSelectedTile(this.selectedTiles[0])
      this.setEdit16x16(value)
    },
    toggleGrid () { this.showGrid = !this.showGrid }
  },
  mounted () {
    this.canvas = this.$refs['editor']
    this.context = this.$refs['editor'].getContext('2d')
    this.$refs['editor'].width = this.editorSize
    this.$refs['editor'].height = this.editorSize
    this.redraw()
  },
  watch: {
    activePaletteIndex () { this.redraw() },
    edit16x16 (newVal) { this.redraw() },
    editorHFlip () { this.redraw() },
    editorVFlip () { this.redraw() },
    editorRatio () {
      this.$refs['editor'].width = this.editorSize
      this.$refs['editor'].height = this.editorSize
      this.redraw()
    },
    palettes () { this.redraw() },
    pixelX (newVal) {
      this.colorPixel(newVal)
      this.testTileUpdated()
    },
    pixelY (newVal) {
      this.colorPixel(newVal)
      this.testTileUpdated()
    },
    refreshPalette () { this.redraw() },
    selectedTile (newVal) {
      this.setEdit16x16(false)
      this.testTileUpdated()
      this.redraw()
    },
    selectedTiles (newVal) {
      this.testTileUpdated()
      this.redraw()
    },
    showGrid () { this.redraw() },
    saveEventListener () { this.testTileUpdated() },
    saveKeyEvent () { this.saveVramTile() },
    updateVram () { this.testTileUpdated() },
    userIsDrawing (newVal) {
      if (newVal) {
        this.colorPixel()
        this.redraw()
      }
    }
  }
}
</script>

<style>
@import "../css/editor.css";
</style>
