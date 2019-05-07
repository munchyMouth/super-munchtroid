<template>
  <div class="editor">
    <div class="editor__canvas">
      <div>
        <div class="editor__canvas__top-tools">
          <button class="no-style"
                  @click="shrinkEditor()"
                  title="shrink editor">
            <icon name="search-minus" />
          </button>
          <button class="no-style"
                @click="enlargeEditor()"
                title="enlarge editor">
            <icon name="search-plus" />
          </button>
          <button :class="`no-style editor__canvas__tools__grid${showGrid ? '--hide' : ''}`"
                @click="toggleGrid()"
                title="show grid">
            <icon name="th-large" />
          </button>
          <template v-if="!noSelectedTile">
            <button :class="`no-style editor__canvas__tools__save${updated ? '--active' : ''}`"
                  @click="saveVramTile()"
                  title="save current tile">
              <icon name="save" />
            </button>
          <strong class="editor__canvas__tools__address">
            {{ this.selectedTile.tile._address }}
          </strong>
          </template>
        </div>
        <canvas :class="!noSelectedTile ? '--active' : ''"
                ref="editor"
                @mousemove="getMousePos"
                @mouseout="clearActiveMouse"></canvas>
      </div>
      <div class="editor__canvas__tools">
        <template v-if="!noSelectedTile">
          <button :class="`no-style editor__canvas__tools__flip${editorVFlip ? '--flip' : ''}`"
                  @click="toggleVFlip()"
                  title="Does not flip the raw VRAM image">
            <icon style="width: 16px;" name="arrows-alt-v" />&nbsp;
            <label>(V-flip)</label>
          </button>
          <button :class="`no-style editor__canvas__tools__flip${editorHFlip ? '--flip' : ''}`"
                  @click="toggleHFlip()"
                  title="Does not flip the raw VRAM image">
            <icon name="arrows-alt-h" />&nbsp;
            <label>(H-flip)</label>
          </button>
          <button class="no-style editor__canvas__tools__copy"
                  @click="setCopiedTileData()"
                  title="copy">
            <icon name="copy" />&nbsp;
            <label>(copy)</label>
          </button>
          <button class="no-style editor__canvas__tools__paste"
                  @click="pastecopiedTile()"
                  title="paste">
            <icon name="paste" />&nbsp;
            <label>(paste)</label>
          </button>
          <button class="no-style editor__canvas__tools__undo"
                  @click="popFromUndoCache()"
                  title="undo">
            <icon name="undo" />&nbsp;
            <label>(undo)</label>
          </button>
          <button class="no-style editor__canvas__tools__redo"
                  @click="shiftFromRedoCache()"
                  title="redo">
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
      'editorHFlip',
      'editorVFlip',
      'editorRatio',
      'filePath',
      'getVramTileByProps',
      'noSelectedTile',
      'palettes',
      'refreshPalette',
      'selectedTile',
      'userIsDrawing',
      'undoRedoInterim',
      'undoCache',
      'updateVram',
      'redoCache'
    ]),
    editorSize () { return this.tileSize * 8 },
    pixelX () { return Math.floor(this.x / this.tileSize) },
    pixelY () { return Math.floor(this.y / this.tileSize) },
    tileSize () { return this.editorRatio * 32 }
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
      if (
        newVal > -1 && newVal < 8 &&
        this.userIsDrawing &&
        this.selectedTile &&
        this.activePaletteColor) {
        this.setVramPixel({
          ...this.selectedTile,
          x: this.editorHFlip ? 7 - this.pixelX : this.pixelX,
          y: this.editorVFlip ? 7 - this.pixelY : this.pixelY,
          colorIndex: this.activePaletteColor[this.userIsDrawing] })
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
      this.redrawPixels()
      if (this.showGrid) this.redrawGrid(R)
      if (this.x > -1 && this.y > -1) this.redrawHilight(R)
    },
    redrawGrid (R) {
      this.context.beginPath()
      this.context.lineWidth = 1
      this.context.strokeStyle = 'black'
      for (let i = 1; i < 8; i++) {
        this.context.moveTo(0, (i * this.tileSize))
        this.context.lineTo(this.editorSize, (i * this.tileSize))
        this.context.moveTo((i * this.tileSize), 0)
        this.context.lineTo((i * this.tileSize), this.editorSize)
      }
      this.context.stroke()
    },
    redrawHilight (R) {
      this.context.beginPath()
      this.context.moveTo(
        (this.pixelX * this.tileSize),
        (this.pixelY * this.tileSize))
      this.context.lineWidth = 2
      this.context.strokeStyle = 'white'
      this.context.lineTo(
        (this.pixelX * this.tileSize),
        (this.pixelY * this.tileSize) + this.tileSize)
      this.context.lineTo(
        (this.pixelX * this.tileSize) + this.tileSize,
        (this.pixelY * this.tileSize) + this.tileSize)
      this.context.lineTo(
        (this.pixelX * this.tileSize) + this.tileSize,
        (this.pixelY * this.tileSize))
      this.context.lineTo(
        (this.pixelX * this.tileSize),
        (this.pixelY * this.tileSize))
      this.context.stroke()
    },
    redrawPixels (R) {
      if (this.selectedTile && this.selectedTile.hasOwnProperty('tile')) {
        let lines = cloneDeep(this.selectedTile.tile.data)
        lines = (this.editorVFlip ? lines.reverse() : lines)
        lines.forEach(function (line, i) {
          let _line = (this.editorHFlip ? line.reverse() : line)
          _line.forEach(function (pixel, j) {
            this.context.fillStyle =
              pixel > -1 && this.palettes && this.palettes.length
                ? this.palettes[this.activePaletteIndex].palette[pixel]
                : (pixel === 0 ? '#000000' : '#FFFFFF')
            this.context.fillRect(
              j * this.tileSize,
              i * this.tileSize,
              this.tileSize + (!this.showGrid ? 1 : 0),
              this.tileSize + (!this.showGrid ? 1 : 0))
          }.bind(this))
        }.bind(this))
      }
    },
    saveVramTile () {
      if (this.updated) {
        this.setLoading(true)
        ipcRenderer.send('Save VRAM Tile', {
          filePath: this.filePath,
          tile: this.getVramTileByProps(this.selectedTile)
        })
      }
    },
    shrinkEditor () {
      if (this.editorRatio > 0.7) this.setEditorRatio(this.editorRatio - 0.1)
    },
    testTileUpdated () {
      this.updated = this.selectedTile &&
        !this.selectedTile.hasOwnProperty('empty') &&
        this.getVramTileByProps(this.selectedTile)._updated
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
    selectedTile () {
      this.redraw()
      this.testTileUpdated()
    },
    showGrid () { this.redraw() },
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

<style>@import '../css/editor.css';</style>
