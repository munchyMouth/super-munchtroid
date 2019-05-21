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
              @click="setEdit16x16(!edit16x16)"
            >
              <div>
                <span :class="edit16x16 ? '--active' : ''">16²</span>
              </div>
            </button>
            <button
              :class="`no-style editor__canvas__tools__save${updated ? '--active' : ''}`"
              @click="saveVramTile()"
              title="save current tile"
            >
              <icon name="save" />
            </button>
            <strong class="editor__canvas__tools__address">
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
      <div class="editor__canvas__tools">
        <template v-if="!noSelectedTile">
          <button
            :class="`no-style editor__canvas__tools__flip${editorVFlip ? '--flip' : ''}`"
            @click="toggleVFlip()"
            title="Does not flip the raw VRAM image"
          >
            <icon
              style="width: 16px;"
              name="arrows-alt-v"
            />&nbsp;
            <label>(V-flip)</label>
          </button>
          <button
            :class="`no-style editor__canvas__tools__flip${editorHFlip ? '--flip' : ''}`"
            @click="toggleHFlip()"
            title="Does not flip the raw VRAM image"
          >
            <icon name="arrows-alt-h" />&nbsp;
            <label>(H-flip)</label>
          </button>
          <button
            class="no-style editor__canvas__tools__copy"
            @click="setCopiedTileData()"
            :disabled="!edit16x16 ? false : 'disabled'"
            :title="!edit16x16 ? 'copy' : 'you can only copy/paste a single tile!'"
          >
            <icon name="copy" />&nbsp;
            <label>(copy)</label>
          </button>
          <button
            class="no-style editor__canvas__tools__paste"
            @click="pastecopiedTile()"
            :disabled="!edit16x16 ? false : 'disabled'"
            :title="!edit16x16 ? 'paste' : 'you can only copy/paste a single tile!'"
          >
            <icon name="paste" />&nbsp;
            <label>(paste)</label>
          </button>
          <button
            class="no-style editor__canvas__tools__undo"
            @click="popFromUndoCache()"
            title="undo"
          >
            <icon name="undo" />&nbsp;
            <label>(undo)</label>
          </button>
          <button
            class="no-style editor__canvas__tools__redo"
            @click="shiftFromRedoCache()"
            title="redo"
          >
            <icon name="redo" />&nbsp;
            <label>(redo)</label>
          </button>
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
import { cloneDeep } from 'lodash'

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
      'editorHFlip',
      'editorVFlip',
      'editor16x16TileIsValid',
      'editorRatio',
      'filePath',
      'getVramTileByProps',
      'noSelectedTile',
      'palettes',
      'redoCache',
      'refreshPalette',
      'saveEventListener',
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
      'setEdit16x16',
      'setEditorActive',
      'setEditorRatio',
      'setUserIsDrawing',
      'setVramPixel',
      'setLoading',
      'shiftFromRedoCache',
      'toggleHFlip',
      'toggleVFlip'
    ]),
    clearActiveMouse () {
      this.x = -1
      this.y = -1
      this.setEditorActive(false)
      this.redraw()
    },
    colorPixel (newVal = 0) {
      if (!this.edit16x16) {
        if (
          newVal > -1 &&
          newVal < 8 &&
          this.userIsDrawing &&
          this.selectedTile &&
          this.activePaletteColor
        ) {
          this.setVramPixel({
            ...this.selectedTile,
            x: this.editorHFlip ? 7 - this.pixelX : this.pixelX,
            y: this.editorVFlip ? 7 - this.pixelY : this.pixelY,
            colorIndex: this.activePaletteColor[this.userIsDrawing]
          })
        }
      } else this.colorPixel16x16Context(newVal)
    },
    colorPixel16x16Context (newVal = 0) {
      if (
        newVal > -1 &&
        newVal < 16 &&
        this.userIsDrawing &&
        this.selectedTiles &&
        this.activePaletteColor
      ) {
        this.setVramPixel({
          ...this.selectedTiles[this.currentTileIndex],
          x: this.editorHFlip ? 7 - this.pixelX16x16Context : this.pixelX16x16Context,
          y: this.editorVFlip ? 7 - this.pixelY16x16Context : this.pixelY16x16Context,
          colorIndex: this.activePaletteColor[this.userIsDrawing]
        })
      }
    },
    enlargeEditor () {
      if (this.editorRatio < 1.5) this.setEditorRatio(this.editorRatio + 0.1)
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
    redraw () {
      this.context.clearRect(0, 0, this.editorSize + 1, this.editorSize + 1)
      const R = this.editorRatio
      this.redrawTiles()
      if (this.showGrid) this.redrawGrid(R)
      if (this.x > -1 && this.y > -1) this.redrawHilight(R)
    },
    redrawGrid (R) {
      this.context.beginPath()
      this.context.lineWidth = 1
      this.context.strokeStyle = 'black'
      const count = this.edit16x16 ? 16 : 8
      for (let i = 1; i < count; i++) {
        this.context.moveTo(0, i * this.variableTileSize)
        this.context.lineTo(this.editorSize, i * this.variableTileSize)
        this.context.moveTo(i * this.variableTileSize, 0)
        this.context.lineTo(i * this.variableTileSize, this.editorSize)
      }
      this.context.stroke()
    },
    redrawHilight (R) {
      this.context.beginPath()
      this.context.moveTo(
        this.pixelX * this.variableTileSize, this.pixelY * this.variableTileSize)
      this.context.lineWidth = 2
      this.context.strokeStyle = 'white'
      this.context.lineTo(
        this.pixelX * this.variableTileSize,
        this.pixelY * this.variableTileSize + this.variableTileSize)
      this.context.lineTo(
        this.pixelX * this.variableTileSize + this.variableTileSize,
        this.pixelY * this.variableTileSize + this.variableTileSize)
      this.context.lineTo(
        this.pixelX * this.variableTileSize + this.variableTileSize,
        this.pixelY * this.variableTileSize)
      this.context.lineTo(
        this.pixelX * this.variableTileSize,
        this.pixelY * this.variableTileSize)
      this.context.stroke()
    },
    redrawPixels (lines, offsetX = 0, offsetY = 0) {
      lines = this.editorVFlip ? lines.reverse() : lines
      lines.forEach(
        function (line, i) {
          let _line = this.editorHFlip ? line.reverse() : line
          _line.forEach(
            function (pixel, j) {
              this.context.fillStyle =
                pixel > -1 && this.palettes && this.palettes.length
                  ? this.palettes[this.activePaletteIndex].palette[pixel]
                  : pixel === 0
                    ? '#000000'
                    : '#FFFFFF'
              this.context.fillRect(
                (j * this.variableTileSize) + offsetX,
                (i * this.variableTileSize) + offsetY,
                this.variableTileSize + (!this.showGrid ? 1 : 0),
                this.variableTileSize + (!this.showGrid ? 1 : 0)
              )
            }.bind(this)
          )
        }.bind(this)
      )
    },
    redrawTile (index = undefined, x = 0, y = 0) {
      if (typeof index !== 'undefined') {
        this.redrawPixels(
          cloneDeep(this.selectedTiles[index].tile.data), x, y)
      } else this.redrawPixels(cloneDeep(this.selectedTile.tile.data))
    },
    redrawTiles () {
      if (this.edit16x16) {
        this.redrawTile(this.incorporateFlipOn16x16(0))
        this.redrawTile(this.incorporateFlipOn16x16(1), this.variableTileSize * 8, 0)
        this.redrawTile(this.incorporateFlipOn16x16(2), 0, this.variableTileSize * 8)
        this.redrawTile(this.incorporateFlipOn16x16(3), this.variableTileSize * 8, this.variableTileSize * 8)
      } else if (this.selectedTile && this.selectedTile.hasOwnProperty('tile')) {
        this.redrawTile()
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
      if (this.editorRatio > 0.7) this.setEditorRatio(this.editorRatio - 0.1)
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
    toggleGrid () {
      this.showGrid = !this.showGrid
    }
  },
  mounted () {
    this.canvas = this.$refs['editor']
    this.context = this.$refs['editor'].getContext('2d')
    this.$refs['editor'].width = this.editorSize
    this.$refs['editor'].height = this.editorSize
    this.redraw()
  },
  watch: {
    activePaletteIndex () {
      this.redraw()
    },
    edit16x16 () {
      this.redraw()
    },
    editorHFlip () {
      this.redraw()
    },
    editorVFlip () {
      this.redraw()
    },
    editorRatio () {
      this.$refs['editor'].width = this.editorSize
      this.$refs['editor'].height = this.editorSize
      this.redraw()
    },
    palettes () {
      this.redraw()
    },
    pixelX (newVal) {
      this.colorPixel(newVal)
      this.testTileUpdated()
    },
    pixelY (newVal) {
      this.colorPixel(newVal)
      this.testTileUpdated()
    },
    refreshPalette () {
      this.redraw()
    },
    selectedTile (newVal) {
      this.setEdit16x16(false)
      this.testTileUpdated()
      this.redraw()
    },
    selectedTiles (newVal) {
      this.testTileUpdated()
      this.redraw()
    },
    showGrid () {
      this.redraw()
    },
    saveEventListener () {
      this.testTileUpdated()
    },
    updateVram () {
      this.testTileUpdated()
    },
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
