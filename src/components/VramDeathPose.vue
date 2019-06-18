<template>
  <div :class="`vram-death-outer-wrapper${showVram ? '--show' : '--hide'}`">
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
  name: 'vram-death-pose',
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
      'vramRatio'
    ]),
    activeTileMetaData () {
      return {
        half: 'n/a',
        index: this.activeTileIndex,
        isDeathPose: true,
        no: 'n/a',
        part: 'n/a',
        tile: this.currentTile,
        x: this.activeTileXOffset,
        y: this.activeTileYOffset
      }
    },
    activeTileIndex () {
      const test = Math.floor((this.x / this.vramRatio) / 8) +
        (Math.floor(this.y / (this.vramRatio * 8)) * 16)
      return test > -1 ? test : -1
    },
    activeTileXOffset () {
      return Math.floor(this.x / (this.vramRatio * 8)) * (8 * this.vramRatio)
    },
    activeTileYOffset () {
      return Math.floor(this.y / (this.vramRatio * 8)) * (8 * this.vramRatio)
    },
    currentTile () {
      return this.vram.tiles[this.activeTileIndex]
    },
    isVramSelectionInEditorMode () {
      return this.vramX > -1 &&
        this.vramY > -1 &&
        !this.activeSprite
    },
    isVramSelectionInSpriteMode () {
      return this.vramX > -1 &&
        this.vramY > -1 &&
        !!this.activeSprite
    },
    spriteModeDataObject () {
      return {
        'load16x16': false,
        'vramIndex': this.activeTileIndex
      }
    },
    viableTile () { return true },
    vramX () {
      return (this.x > -1 && this.x < this.vramRatio * 128) ? this.x : -1
    },
    vramY () {
      return (this.y > -1 && this.y < this.vramRatio * 80) ? this.y : -1
    }
  },
  data () {
    return {
      context: undefined,
      x: -1,
      y: -1
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
        case this.isVramSelectionInEditorMode || (evt.button > 0):
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
      this.redrawDeathPose()
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
      'activeTileXOffset',
      'activeTileYOffset',
      'editorUpdate',
      'palettes',
      'refreshPalette',
      'selectedTile',
      'selectedTiles',
      'showVram',
      'spriteRefresh'
    ].reduce((obj, it) => {
      obj[it] = function () { this.redrawDeathPose() }
      return obj
    }, {}),
    currentFrameIndex () {
      this.clearSelectedTile()
      this.clearSelectedTiles()
      this.redrawDeathPose()
    },
    edit16x16 (newVal) {
      if (newVal) this.setSelectedTiles(this.computedSelectedTiles)
      this.redrawDeathPose()
    },
    vram () {
      this.clearSelectedTile()
      this.clearSelectedTiles()
      this.redrawDeathPose()
    }
  },
  mounted () {
    this.context = this.$refs['vram'].getContext('2d')
    this.$refs['vram'].width = 128 * this.vramRatio
    this.$refs['vram'].height = 80 * this.vramRatio
  }
}
</script>

<style scoped>
@import '../css/vram.css';
</style>
