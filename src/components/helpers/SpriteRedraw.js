import { handleIrregularHalfLogic } from '../Miscellaneous'

const handleHorizontalFlip = ({ hFlip, _index, xOffset }) =>
  (!hFlip) ? xOffset + (8 * _index) : 8 + (xOffset - (8 * _index))

const handleVerticalFlip = ({ isPart1, vFlip, yOffset }) =>
  (vFlip && isPart1) || (!vFlip && !isPart1) ? yOffset + 8 : yOffset

// public object SpriteRedraw implements IRedraw extends Sprite
export default {
  prepare16x16Sprite (obj) { // --------- 16x16 means we need the adjacent tile to the indexed tile in part1 AND ...
    let { tiles, half, vramIndex } = obj // - the 2 tiles below the tiles in part 1. Ergo, the algorithm runs as follows:
    for (let i = 1; i >= 0; i--) { // <-- which part are we looking at? part1/part2?
      for (let j = 0; j < 2; j++) { // <- which tile should we load within the respective part?
        let _tiles = (i === 0)
          ? this.getVramByProps({ half, part: 'part2' }).tiles
          : tiles
        if (_tiles[vramIndex + j] && _tiles[vramIndex + j].data) {
          this.redrawSprite({
            ...obj,
            data: _tiles[vramIndex + j].data,
            xOffset: handleHorizontalFlip({ _index: j, ...obj }),
            yOffset: handleVerticalFlip({ isPart1: !!i, ...obj })
          })
        }
      }
    }
  },
  prepareAndRedrawSprite (obj) {
    const { vramIndex, load16x16, part } = obj
    const half = handleIrregularHalfLogic(obj)
    const _index = (vramIndex >= 8) ? vramIndex - 8 : vramIndex
    const { tiles } = this.getVramByProps({ half, part })
    if (part === 'part1' && load16x16) {
      this.prepare16x16Sprite({
        ...obj, tiles, vramIndex: _index, half
      })
    } else if (tiles[_index] && tiles[_index].hasOwnProperty('data')) {
      this.redrawSprite({
        ...obj, data: tiles[_index].data, index: _index, half
      })
    }
  },
  redrawAxes (R) {
    this.context.beginPath()
    this.context.lineWidth = 0.5
    this.context.moveTo(this.spriteZeroY, 0)
    this.context.lineTo(this.spriteZeroY, this.spriteEndY)
    this.context.moveTo(0, this.spriteZeroX)
    this.context.lineTo(this.spriteEndX, this.spriteZeroX)
    this.context.stroke()
  },
  redrawBeamCursor (R) {
    if (this.hasActiveBeamOffsetIndex) {
      this.context.drawImage(
        this.getBeamCursor,
        ((this.spriteRatio * (this.getActiveBeamOffsetX + this.getActiveBeamUpdateX)) + this.spriteZeroX) - (this.beamCursorWidth / 2),
        ((this.spriteRatio * (this.getActiveBeamOffsetY + this.getActiveBeamUpdateY)) + this.spriteZeroY) - (this.beamCursorHeight / 2),
        R / 3 * this.getBeamCursor.width,
        R / 3 * this.getBeamCursor.height
      )
    }
  },
  redrawSprite ({ _address, data, hFlip, R, vFlip, xOffset, yOffset }) {
    (vFlip ? data.slice().reverse() : data).forEach(function (line, y) {
      (hFlip ? line.slice().reverse() : line).forEach(function (pixel, x) {
        if (pixel) {
          const _palette = this.getActivePaletteInPalettes.palette[pixel]
          this.context.fillStyle = !this.activeSpriteAddress ||
            this.activeSpriteAddress === _address
            ? _palette
            : `#${this.setSpriteBoxMaskColor(_palette)}`
          this.context.fillRect(
            x * R + (this.spriteZeroY + (xOffset * R)),
            y * R + (this.spriteZeroX + (yOffset * R)),
            R, R)
        }
      }.bind(this))
    }.bind(this))
  },
  redraw () {
    const R = this.spriteRatio
    this.context.clearRect(0, 0, this.spriteMaxEndX, this.spriteMaxEndY)
    this.redrawAxes(R)
    const half = ['bottom', 'top']
    half.forEach(function (half) {
      this.getSpritesByHalf({ half }).forEach(function (sprite, i) {
        this.prepareAndRedrawSprite({ half, R, ...sprite, edgeCaseIndex: i })
      }.bind(this))
    }.bind(this))
    this.redrawBeamCursor(R)
  },
  setSpriteBoxMaskColor (palette) {
    const p = palette.replace('#', '')
    switch (this.spriteMaskColor) {
      case 'blue': return p.replace(/[a-f0-9]{2}$/gi, 'FF')
      case 'red': return p.replace(/^[a-f0-9]{2}/gi, 'FF')
      case 'yellow': return p.replace(/^[a-f0-9]{4}/gi, 'DDDD')
      case 'purple': return p.replace(/^[a-f0-9]{2}/gi, 'FF').replace(/[a-f0-9]{2}$/gi, 'FF')
      case 'green':
        return p
          .match(/.{1,2}/g)
          .map((it, i) => i === 1 ? 'FF' : it)
          .toString()
          .replace(/,/gi, '')
      default: return p
    }
  }
}
