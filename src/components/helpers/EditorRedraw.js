import { cloneDeep } from 'lodash'

// public object EditorRedraw implements IRedraw extends Sprite
export default {
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
  }
}
