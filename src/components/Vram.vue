<template>
  <div :class="`vram-outer-wrapper${showVram ? '--show' : '--hide'}`">
    <canvas
      ref="vram"
      @mousemove="getMousePos"
      @mouseout="clearActiveMouse"
      @click="actionClick"
      @contextmenu="actionClick">
    </canvas>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import VramRedraw from './helpers/VramRedraw.js'

export default {
  name: 'vram',
  components: {
  },
  computed: {
    ...mapGetters([
      'activePaletteIndex',
      'activeSprite',
      'currentFrame',
      'currentFrameIndex',
      'editorUpdate',
      'getSpriteByProps',
      'getSpritesByHalf',
      'getVramByProps',
      'hasSelectedTile',
      'palettes',
      'refreshPalette',
      'selectedTile',
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
  data () {
    return {
      context: undefined,
      x: 0,
      y: 0
    }
  },
  methods: {
    ...mapActions([
      'clearSelectedTile',
      'setActiveSprite',
      'setLoading',
      'setSelectedTile',
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
            ...this.activeSprite, ...this.getSpriteByProps(this.activeSprite) })
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
    }
  },
  watch: {
    activePaletteIndex () { this.redraw() },
    activeSprite () { this.redraw() },
    currentFrameIndex () {
      this.clearSelectedTile()
      this.redraw()
    },
    editorUpdate () { this.redraw() },
    palettes () { this.redraw() },
    refreshPalette () { this.redraw() },
    selectedTile () { this.redraw() },
    spriteRefresh () { this.redraw() },
    showVram (newVal) { this.redraw() },
    vram () {
      this.clearSelectedTile()
      this.redraw()
    },
    vramX () { this.redraw() },
    vramY () { this.redraw() }
  },
  mounted () {
    this.context = this.$refs['vram'].getContext('2d')
    this.$refs['vram'].width = 128 * this.vramRatio
    this.$refs['vram'].height = 16 * this.vramRatio
  }
}
</script>

<style>
.vram-outer-wrapper--show {
  padding-top: 83px;
  transition: margin-top .7s;
  padding-bottom: 0;
  width: 100%;
  height: 97px;
  background: black;
  margin-bottom: 16px;
}
.vram-outer-wrapper--hide {
  width: 100%;
  padding-top: 83px;
  margin-top: -97px;
  margin-bottom: 16px;
  background: black;
  height: 96px;
  transition: margin-top .7s;
}
.vram-outer-wrapper--show canvas,
.vram-outer-wrapper--hide canvas {
  position: relative;
  height: 96px;
  margin-top: -96px;
}
</style>
