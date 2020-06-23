<template>
  <div :class="`vram-outer-wrapper${showVram ? '--show' : '--hide'}`">
    <canvas
      ref="vram"
      tabindex="1"
      @mousemove="getMousePos"
      @mouseout="clearActiveMouse"
      @click="actionClick"
      @contextmenu="actionClick"
    />
    <!-- {{ selectedTile }} -->
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import VramRedraw from './helpers/VramRedraw.js'

export default {
  name: 'vram',
  components: {
  },
  data () {
    return {
      context: undefined,
      x: 0,
      y: 0
    }
  },
  computed: {
    ...mapGetters([
      'activePaletteIndex',
      'activeSprite',
      'computedSelectedTiles',
      'currentFrame',
      'currentFrameIndex',
      'edit16x16',
      'editorUpdate',
      'getSpriteByProps',
      'getSpritesByHalf',
      'getVramByProps',
      'hasSelectedTile',
      'palettes',
      'refreshPalette',
      'selectedTile',
      'selectedTiles',
      'showVram',
      'spriteRatio',
      'spriteRefresh',
      'tileMaps',
      'vram',
      'vramRatio']),
    activePart () {
      return (this.y / this.vramRatio >= 8) ? 'part2' : 'part1'
    },
    activeTileMetaData () {
      return {
        half: this.activeHalf,
        index: this.activeTileIndex,
        no: this.activeTileNo,
        part: this.activePart,
        tile: this.currentTile
      }
    },
    activeTileNo () {
      return Math.floor((this.x / this.vramRatio) / 8)
    },
    activeTileIndex () {
      return this.activeTileNo < 8 ? this.activeTileNo : this.activeTileNo - 8
    },
    activeHalf () {
      return this.activeTileNo < 8 ? 'top' : 'bottom'
    },
    currentPart () {
      return this.currentFrame
        ? this.currentFrame[this.activeHalf].parts[this.activePart]
        : undefined
    },
    currentTile () {
      return this.currentPart
        ? this.currentPart.tiles[this.activeTileIndex]
        : undefined
    },
    isVramSelectionInEditorMode () {
      return this.viableTile &&
        this.vramX > -1 &&
        this.vramY > -1 &&
        !this.activeSprite
    },
    isVramSelectionInSpriteMode () {
      return this.viableTile &&
        this.vramX > -1 &&
        this.vramY > -1 &&
        !!this.activeSprite
    },
    spriteModeDataObject () {
      return {
        'load16x16': false,
        'part': this.activePart,
        'vramIndex': this.activeTileNo
      }
    },
    viableTile () {
      return this.currentPart
        ? this.activeTileIndex < this.currentPart.tiles.length
        : false
    },
    vramX () {
      return (this.viableTile && this.x > -1 && this.x < this.vramRatio * 128)
        ? this.x
        : -1
    },
    vramY () {
      return (this.viableTile && this.y > -1 && this.y < this.vramRatio * 16)
        ? this.y
        : -1
    }
  },
  watch: {
    activePaletteIndex () { this.redraw() },
    activeSprite () { this.redraw() },
    currentFrameIndex () {
      this.clearSelectedTile()
      this.clearSelectedTiles()
      this.redraw()
    },
    edit16x16 (newVal) {
      if (newVal) this.setSelectedTiles(this.computedSelectedTiles)
      this.redraw()
    },
    editorUpdate () { this.redraw() },
    palettes () { this.redraw() },
    refreshPalette () { this.redraw() },
    selectedTile () { this.redraw() },
    selectedTiles () { this.redraw() },
    spriteRefresh () { this.redraw() },
    showVram (newVal) { this.redraw() },
    vram () {
      this.clearSelectedTile()
      this.clearSelectedTiles()
      this.redraw()
    },
    vramX () { this.redraw() },
    vramY () { this.redraw() }
  },
  mounted () {
    this.context = this.$refs['vram'].getContext('2d')
    this.$refs['vram'].width = 128 * this.vramRatio
    this.$refs['vram'].height = 16 * this.vramRatio
    this.$refs['vram'].addEventListener('keydown', this.hilightSquareOnKeyup)
  },
  methods: {
    ...mapActions([
      'clearSelectedTile',
      'clearSelectedTiles',
      'setActiveSprite',
      'setLoading',
      'setSelectedTile',
      'setSelectedTiles',
      'setSpriteProperty']),
    ...VramRedraw,
    actionClick (evt) {
      switch (true) {
        case this.isVramSelectionInEditorMode ||
          (this.viableTile && evt.button > 0):
          this.setSelectedTile(this.activeTileMetaData)
          break

        case this.isVramSelectionInSpriteMode:
          Object.keys(this.spriteModeDataObject).forEach(function (key, i) {
            this.setSpriteProperty({
              ...this.activeSprite,
              property: key,
              value: this.spriteModeDataObject[key],
              redraw: i === 2
            })
          }.bind(this))
          this.setActiveSprite({
            ...this.activeSprite,
            ...this.getSpriteByProps(this.activeSprite)
          })
          break
      }
    },
    clearActiveMouse () {
      this.x = -1
      this.y = -1
      this.redraw()
    },
    getMousePos (evt) {
      this.$refs['vram'].focus()
      var rect = evt.currentTarget.getBoundingClientRect()
      this.x = evt.clientX - rect.left
      this.y = evt.clientY - rect.top
    },
    hilightSquareOnKeyup (evt) {
      if (!this.selectedTile.empty) {
        switch (evt.keyCode) {
          case 37: // left
            this.keyLeftRight(this.selectedTile, 'left')
            break
          case 38: // up
            this.keyUpDown(this.selectedTile)
            break
          case 39: // right
            this.keyLeftRight(this.selectedTile, 'right')
            break
          case 40: // down
            this.keyUpDown(this.selectedTile)
            break
        }
      }
    },
    keyUpDown ({ half, index, part, no }) {
      part = part === 'part1' ? 'part2' : 'part1'
      if (this.validateTile({ half, index, part })) {
        this.setSelectedTile(
          {
            half,
            index,
            no,
            part,
            tile: this.currentFrame[half].parts[part].tiles[index]
          }
        )
      }
    },
    keyLeftRight ({ half, index, part, no }, leftRight) {
      let halt = false
      let override = 0
      while (!halt) {
        if (leftRight === 'left') {
          if (--index < 0) {
            index = 7
            half = half === 'top' ? 'bottom' : 'top'
          }
          if (--no < 0) no = 15
        } else {
          if (++index === 8) {
            index = 0
            half = half === 'top' ? 'bottom' : 'top'
          }
          if (++no === 16) no = 0
        }
        if (++override > 15) halt = true // emergency break
        if (this.validateTile({ half, index, part })) {
          this.keySetTile({ half, index, no, part })
          halt = true
        }
      }
    },
    keySetTile ({ half, index, no, part }) {
      this.setSelectedTile(
        {
          half,
          index,
          no,
          part,
          tile: this.currentFrame[half].parts[part].tiles[index]
        }
      )
    },
    validateTile ({ half, index, part }) {
      return this.currentFrame[half].parts[part]
        ? index < this.currentFrame[half].parts[part].tiles.length
        : false
    }
  }
}
</script>

<style>
@import "../css/vram.css";
</style>
