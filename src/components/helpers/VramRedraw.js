import { createBlankTemplate } from '../Miscellaneous'

// public object VramRedraw implements IRedraw extends Vram
export default {
  insertTile (tile, offsetX = 0, offsetY = 0, R = 4) {
    tile.forEach(function (line, y) {
      line.forEach(function (pixel, x) {
        this.context.fillStyle = pixel > -1
          ? this.palettes[this.activePaletteIndex].palette[pixel]
          : (pixel === 0 ? '#000000' : '#FFFFFF')
        this.context.fillRect(
          (x * R) + (offsetX * (8 * R)), (y * R) + (offsetY * (8 * R)), R, R)
      }.bind(this))
    }.bind(this))
  },
  redrawHilightSquare (color, R, x, y, load16x16 = false, n = 1) {
    const mod = (load16x16 ? 16 : 8) * R
    this.context.beginPath()
    this.context.moveTo(x + n, y + n)
    this.context.lineWidth = 3
    this.context.strokeStyle = color
    this.context.lineTo(x + n, y + mod - n)
    this.context.lineTo(x + mod - n, y + mod - n)
    this.context.lineTo(x + mod - n, y + n)
    this.context.lineTo(x + n, y + n)
    this.context.stroke()
  },
  redraw () {
    if (this.showVram && this.palettes.length && this.currentFrame) {
      const { top, bottom } = this.currentFrame
      const R = this.vramRatio
      for (let i = 0; i < 8; i++) {
        this.renderTilesOrBlank(top.parts.part1, i, i, 0, R)
        this.renderTilesOrBlank(top.parts.part2, i, i, 1, R)
      }
      for (let i = 0; i < 8; i++) {
        this.renderTilesOrBlank(bottom.parts.part1, i, i + 8, 0, R)
        this.renderTilesOrBlank(bottom.parts.part2, i, i + 8, 1, R)
      }
      if (this.vramX > -1 && this.vramY > -1) this.renderHilightedTile(R)
      if (this.activeSprite) this.renderSpriteTile(R)
      this.renderSelectedTile(R)
    }
  },
  renderHilightedTile (R, fillstyle = 'rgba(200, 200, 200, .5)') {
    if (this.viableTile && this.vramX > -1 && this.vramY > -1) {
      const x = (this.activeTileNo * 8) * R
      const y = (this.activePart === 'part1' ? 0 : 8) * R
      this.context.fillStyle = fillstyle
      this.context.fillRect(x, y, (8 * R), (8 * R))
    }
  },
  renderSpriteTile (R, fillstyle = 'rgba(0, 200, 0, .3)') {
    const { vramIndex, part, load16x16 } = this.getSpriteByProps(this.activeSprite)
    const x = (vramIndex * 8) * R
    const y = (part === 'part1' ? 0 : 8) * R
    this.redrawHilightSquare('lawngreen', R, x, y, load16x16)
  },
  renderSelectedTile (R) {
    if (this.hasSelectedTile) {
      const { no, part } = this.selectedTile
      const x = (no * 8) * R
      const y = (part === 'part1' ? 0 : 8) * R
      this.redrawHilightSquare('magenta', R, x, y, false, this.activeSprite ? 3 : 1)
    }
  },
  renderTilesOrBlank ({ tiles }, i, x, y = 0, R) {
    if (i < tiles.length) this.insertTile(tiles[i].data, x, y, R)
    else this.insertTile(createBlankTemplate(), x, y, R)
  }
}
