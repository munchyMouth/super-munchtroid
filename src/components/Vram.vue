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
        isDeathPose: false,
        no: this.activeTileNo,
        part: this.activePart,
        tile: this.currentTile,
        x: undefined,
        y: undefined
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
    ...[
      'activePaletteIndex',
      'activeSprite',
      'editorUpdate',
      'palettes',
      'refreshPalette',
      'selectedTile',
      'selectedTiles',
      'spriteRefresh',
      'showVram',
      'vramX',
      'vramY'
    ].reduce((obj, it) => {
      obj[it] = function () { this.redraw() }
      return obj
    }, {}),
    currentFrameIndex () {
      this.clearSelectedTile()
      this.clearSelectedTiles()
      this.redraw()
    },
    edit16x16 (newVal) {
      if (newVal) this.setSelectedTiles(this.computedSelectedTiles)
      this.redraw()
    },
    vram () {
      this.clearSelectedTile()
      this.clearSelectedTiles()
      this.redraw()
    }
  },
  mounted () {
    this.context = this.$refs['vram'].getContext('2d')
    this.$refs['vram'].width = 128 * this.vramRatio
    this.$refs['vram'].height = 16 * this.vramRatio
  }
}
</script>

<style>@import '../css/vram.css';</style>
