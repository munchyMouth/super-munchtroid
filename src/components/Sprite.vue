<template>
  <div :class="`sprite-outer-wrapper sprite-outer-wrapper${showSprite ? '--show' : '--hide'}`">
    <canvas
      :class="`sprite-canvas${mouseInActiveSpriteArea ? '--active-sprite' : ''}`"
      ref="sprite"
      @mousemove="getMousePos"
      @mouseout="clearActiveMouse"
      @mousedown="drag = mouseInActiveSpriteArea"
      @mouseup="clearDrag">
    </canvas>
    <button class="no-style sprite-undo"
            @click="undoDrag"
            title="Reset to latest active sprite state."
            v-if="spriteDefault">
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
  computed: {
    ...mapGetters([
      'activeSpriteAddress',
      'activeSprite',
      'currentFrame',
      'currentFrameIndex',
      'editorUpdate',
      'getSpriteByProps',
      'getSpritesByHalf',
      'getVramByProps',
      'palettes',
      'refreshPalette',
      'getActivePaletteInPalettes',
      'selectedTile',
      'showSprite',
      'showVram',
      'spriteDefault',
      'spriteRatio',
      'spriteRefresh',
      'tileMaps',
      'vram']),
    mouseInActiveSpriteArea () {
      return this.activeSprite
        ? this.activeSprite.xOffset <= this.spriteX &&
          this.activeSprite.yOffset <= this.spriteY &&
          this.activeSprite.xOffset + (this.activeSprite.load16x16 ? 16 : 8) >= this.spriteX &&
          this.activeSprite.yOffset + (this.activeSprite.load16x16 ? 16 : 8) >= this.spriteY
        : false
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
    // I know I know, below is a bit of redundancy, this came about from when I
    // had the Sprite rendered in the same canvas as VRAM. I've kept it this way
    // in case it's required for offseting in the future.
    spriteEndX () { return 80 * this.spriteRatio },
    spriteEndY () { return 80 * this.spriteRatio },
    spriteMaxEndX () { return 80 * 6 },
    spriteMaxEndY () { return 80 * 6 },
    spriteZeroY () { return (80 * this.spriteRatio) / 2 },
    spriteZeroX () { return (80 * this.spriteRatio) / 2 }
  },
  data () {
    return {
      canvas: undefined,
      context: undefined,
      drag: false,
      dragX: undefined,
      dragY: undefined,
      wrapperHeight: '',
      x: 0,
      y: 0
    }
  },
  methods: {
    ...mapActions([
      'setLoading',
      'setSelectedTile',
      'setSpriteProperty'
    ]),
    ...SpriteRedraw,
    actionDrag () {
      if (this.spriteX > 63 || this.spriteX < -63 ||
        this.spriteY > 63 || this.spriteY < -63) this.clearDrag()
      else if (this.drag) {
        if (typeof this.dragX === 'undefined') {
          this.dragX = this.spriteX
          this.dragY = this.spriteY
        }
        if (this.permitDragX) this.setAxis('x')
        if (this.permitDragY) this.setAxis('y')
        this.dragX = this.spriteX
        this.dragY = this.spriteY
      }
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
      this.actionDrag()
    },
    setWrapperHeight () {
      this.wrapperHeight =
        document
          .querySelector('.sprite-outer-wrapper')
          .getBoundingClientRect()
          .height + 'px'
    }
  },
  watch: {
    activeSprite (newVal) {
      this.setWrapperHeight()
      this.redraw()
    },
    currentFrameIndex () {
      this.redraw()
    },
    editorUpdate () { this.redraw() },
    getActivePaletteInPalettes () { this.redraw() },
    palettes () { this.redraw() },
    refreshPalette () { this.redraw() },
    selectedTile () { this.redraw() },
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
  }
}
</script>

<style>
.sprite-outer-wrapper {
  display:flex;
  flex-direction: row;
  align-items:flex-start;
  justify-items:flex-start
}
.sprite-canvas--active-sprite {
  cursor: move;
}
.sprite-outer-wrapper--hide, .sprite-outer-wrapper--hide canvas {
  width: 0;
  transition: width 1s;
}
.sprite-outer-wrapper--show, .sprite-outer-wrapper--show canvas {
  border: 1px solid black;
  transition: width 1s;
}
.sprite-undo {
  margin-top: 5px;
  margin-left: 7px;
  position: absolute;
}
.sprite-undo > svg {
  width: 10px;
}
</style>
