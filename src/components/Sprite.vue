<template>
  <div :class="`sprite-outer-wrapper sprite-outer-wrapper${showSprite ? '--show' : '--hide'}`">
    <!-- {{ spriteX - (beamCursorWidth / 16) }} |
    {{ spriteY - (beamCursorHeight / 16) }} -->
    <canvas
      ref="sprite"
      :class="`sprite-canvas${(mouseInActiveSpriteArea || mouseInActiveBeamCursorArea) ? '--active-sprite' : ''}`"
      @mousemove="getMousePos"
      @mouseout="clearActiveMouse"
      @mousedown="drag = mouseInActiveSpriteArea || mouseInActiveBeamCursorArea"
      @mouseup="clearDrag"
    />
    <button
      v-if="spriteDefault"
      class="no-style sprite-undo"
      title="Reset to latest active sprite state."
      @click="undoDrag"
    >
      <icon name="undo" />
    </button>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import 'vue-awesome/icons/undo'
import Icon from 'vue-awesome/components/Icon'

import SpriteRedraw from './helpers/SpriteRedraw.js'

export default {
  name: 'sprite',
  components: { Icon },
  data () {
    return {
      canvas: undefined,
      context: undefined,
      beamCursor: undefined,
      drag: false,
      dragX: undefined,
      dragY: undefined,
      wrapperHeight: '',
      x: 0,
      y: 0
    }
  },
  computed: {
    ...mapGetters([
      'activeSpriteAddress',
      'activeSprite',
      'currentFrame',
      'currentFrameIndex',
      'editorUpdate',
      'getActiveBeamOffset',
      'getActiveBeamOffsetX',
      'getActiveBeamOffsetY',
      'getActiveBeamUpdateX',
      'getActiveBeamUpdateY',
      'getActivePaletteInPalettes',
      'getBeamAction',
      'getBeamCursor',
      'getBeamIndex',
      'getBeamPosition',
      'getBeamType',
      'getSpriteByProps',
      'getSpritesByHalf',
      'getVramByProps',
      'hasActiveBeamOffsetIndex',
      'missileFinsResetToggle',
      'missileFinsVisible',
      'missileFins',
      'palettes',
      'refreshPalette',
      'selectedTile',
      'selectedTiles',
      'showSprite',
      'showVram',
      'spriteDefault',
      'spriteMaskColor',
      'spriteRatio',
      'spriteRefresh',
      'tileMaps',
      'vram']),
    beamCursorHeight () {
      return (this.spriteRatio / 3 * this.getBeamCursor.height)
    },
    beamCursorWidth () {
      return (this.spriteRatio / 3 * this.getBeamCursor.width)
    },
    beamCursorX () {
      return ((this.spriteRatio * this.getActiveBeamOffsetX) +
        this.spriteZeroX)
    },
    beamCursorY () {
      return ((this.spriteRatio * this.getActiveBeamOffsetY) +
        this.spriteZeroY)
    },
    mouseInActiveSpriteArea () {
      return this.activeSprite
        ? this.activeSprite.xOffset <= this.spriteX &&
        this.activeSprite.yOffset <= this.spriteY &&
        this.activeSprite.xOffset + (this.activeSprite.load16x16 ? 16 : 8) >= this.spriteX &&
        this.activeSprite.yOffset + (this.activeSprite.load16x16 ? 16 : 8) >= this.spriteY
        : false
    },
    mouseInActiveBeamCursorArea () {
      switch (true) {
        case typeof this.getBeamIndex !== 'undefined':
          return this.x >= ((this.spriteRatio * (this.getActiveBeamOffsetX + this.getActiveBeamUpdateX)) +
            this.spriteZeroX) - (this.beamCursorWidth / 2) &&
            this.y >= ((this.spriteRatio * (this.getActiveBeamOffsetY + this.getActiveBeamUpdateY)) +
              this.spriteZeroY) - (this.beamCursorHeight / 2) &&
            this.x <= ((this.spriteRatio * (this.getActiveBeamOffsetX + this.getActiveBeamUpdateX)) +
              this.spriteZeroX) + (this.beamCursorWidth / 2) &&
            this.y <= ((this.spriteRatio * (this.getActiveBeamOffsetY + this.getActiveBeamUpdateY)) +
              this.spriteZeroY) + (this.beamCursorHeight / 2)
        case this.missileFinsVisible:
          return this.x >= ((this.spriteRatio * (this.missileFins.data[0])) +
            this.spriteZeroX) - (this.beamCursorWidth / 8) &&
            this.y >= ((this.spriteRatio * (this.missileFins.data[1])) +
              this.spriteZeroY) - (this.beamCursorHeight / 8) &&
            this.x <= ((this.spriteRatio * (this.missileFins.data[0])) +
              this.spriteZeroX) + (this.beamCursorWidth) &&
            this.y <= ((this.spriteRatio * (this.missileFins.data[1])) +
              this.spriteZeroY) + (this.beamCursorHeight)
      }
      return undefined
    },
    permitDragX () {
      const x = this.activeSprite.xOffset + (this.spriteX - this.dragX)
      return (x < (this.activeSprite.load16x16 ? 24 : 32) && x > -40)
    },
    permitDragY () {
      const y = this.activeSprite.yOffset + (this.spriteY - this.dragY)
      return (y < (this.activeSprite.load16x16 ? 24 : 32) && y > -40)
    },
    spriteX () {
      return this.x > this.spriteZeroY
        ? Math.ceil((this.x - this.spriteZeroY) / this.spriteRatio)
        : Math.floor((this.x - this.spriteZeroY) / this.spriteRatio)
    },
    spriteY () {
      return this.y > this.spriteZeroX
        ? Math.ceil((this.y - this.spriteZeroX) / this.spriteRatio)
        : Math.floor((this.y - this.spriteZeroX) / this.spriteRatio)
    },
    // The below is a bit redundant, this came about from when I had the Sprite
    // rendered in the same canvas as VRAM. I've kept it this way in case it's
    // required for offseting in the future.
    spriteEndX () { return 80 * this.spriteRatio },
    spriteEndY () { return 80 * this.spriteRatio },
    spriteMaxEndX () { return 80 * 8 },
    spriteMaxEndY () { return 80 * 8 },
    spriteZeroY () { return (80 * this.spriteRatio) / 2 },
    spriteZeroX () { return (80 * this.spriteRatio) / 2 }
  },
  watch: {
    activeSprite (newVal) {
      this.setWrapperHeight()
      this.redraw()
    },
    currentFrameIndex () { this.redraw() },
    dragX () { this.redraw() },
    dragY () { this.redraw() },
    editorUpdate () { this.redraw() },
    getActivePaletteInPalettes () { this.redraw() },
    getBeamAction () { this.redraw() },
    getBeamPosition () { this.redraw() },
    getBeamIndex () { this.redraw() },
    getBeamType () { this.redraw() },
    missileFinsResetToggle () { this.redraw() },
    missileFinsVisible () { this.redraw() },
    palettes () { this.redraw() },
    refreshPalette () { this.redraw() },
    selectedTile () { this.redraw() },
    selectedTiles () { this.redraw() },
    spriteMaskColor () { this.redraw() },
    spriteRatio () {
      this.$refs['sprite'].width = this.spriteEndX
      this.$refs['sprite'].height = this.spriteEndY
      this.setWrapperHeight()
      this.redraw()
    },
    spriteRefresh () { this.redraw() },
    vram () { this.redraw() }
  },
  mounted () {
    this.canvas = this.$refs['sprite']
    this.context = this.$refs['sprite'].getContext('2d')
    this.$refs['sprite'].width = this.spriteEndX
    this.$refs['sprite'].height = this.spriteEndY
  },
  methods: {
    ...mapActions([
      'setActiveBeamUpdate',
      'setMissileFinsData',
      'setLoading',
      'setSelectedTile',
      'setSpriteProperty',
      'setSpriteUpdate'
    ]),
    ...SpriteRedraw,
    actionBeamCursorDrag () {
      switch (true) {
        case typeof this.getBeamIndex !== 'undefined':
          if (typeof this.dragX === 'undefined') {
            this.dragX = this.spriteX - this.getActiveBeamOffsetX
            this.dragY = this.spriteY - this.getActiveBeamOffsetY
          }
          this.setActiveBeamUpdate({
            x: this.spriteX - this.getActiveBeamOffsetX,
            y: this.spriteY - this.getActiveBeamOffsetY
          })
          this.dragX = this.spriteX - this.getActiveBeamOffsetX
          this.dragY = this.spriteY - this.getActiveBeamOffsetY
          break
        case this.missileFinsVisible:
          if (typeof this.dragX === 'undefined') {
            this.dragX = this.spriteX - (Math.floor(this.beamCursorWidth / 12)) // - this.missileFins.data[0],
            this.dragY = this.spriteY - (Math.floor(this.beamCursorHeight / 12)) // - this.missileFins.data[1]
          }
          this.setMissileFinsData([
            this.spriteX - (Math.floor(this.beamCursorWidth / 12)), // - this.missileFins.data[0],
            this.spriteY - (Math.floor(this.beamCursorHeight / 12)) // - this.missileFins.data[1]
          ])
          this.dragX = this.spriteX - (Math.floor(this.beamCursorWidth / 12)) // - this.missileFins.data[0],
          this.dragY = this.spriteY - (Math.floor(this.beamCursorHeight / 12)) // - this.missileFins.data[1]
      }
    },
    actionSpriteDrag () {
      if (typeof this.dragX === 'undefined') {
        this.dragX = this.spriteX
        this.dragY = this.spriteY
      }
      if (this.permitDragX) this.setAxis('x')
      if (this.permitDragY) this.setAxis('y')
      this.dragX = this.spriteX
      this.dragY = this.spriteY
    },
    undoDrag () {
      this.setAxis('x', 'undo')
      this.setAxis('y', 'undo')
    },
    setAxis (XoY, undo = false) {
      const sprite = undo ? this.spriteDefault : this.activeSprite
      const axis = XoY === 'x'
        ? (undo ? sprite.xOffset : sprite.xOffset + (this.spriteX - this.dragX))
        : (undo ? sprite.yOffset : sprite.yOffset + (this.spriteY - this.dragY))
      this.setSpriteProperty({
        ...sprite,
        property: `${XoY}Offset`,
        value: axis,
        redraw: XoY === 'y'
      })
      if (XoY === 'x') {
        this.setSpriteProperty({
          ...sprite,
          property: 'xAxisIsNegative',
          value: axis < 0,
          redraw: false
        })
      }
    },
    clearActiveMouse () {
      this.x = -1
      this.y = -1
      this.clearDrag()
      this.redraw()
    },
    clearDrag () {
      this.dragX = undefined
      this.dragY = undefined
      this.drag = false
    },
    getMousePos (evt) {
      this.$refs['sprite'].focus()
      var rect = evt.currentTarget.getBoundingClientRect()
      this.x = evt.clientX - rect.left
      this.y = evt.clientY - rect.top

      if (this.spriteX > 63 || this.spriteX < -63 ||
        this.spriteY > 63 || this.spriteY < -63) this.clearDrag()
      else if (this.drag) {
        switch (true) {
          case this.mouseInActiveSpriteArea:
            this.actionSpriteDrag()
            break
          case this.mouseInActiveBeamCursorArea:
            this.actionBeamCursorDrag()
        }
      }
    },
    setWrapperHeight () {
      this.wrapperHeight =
        document
          .querySelector('.sprite-outer-wrapper')
          .getBoundingClientRect()
          .height + 'px'
    }
  }
}
</script>

<style>
@import "../css/sprite.css";
</style>
