import { cloneDeep } from 'lodash'

// public object EditorRedraw implements IRedraw extends Sprite
export default {
  colorPixel (newVal = 0) {
    if (!this.edit16x16) {
      if (
        newVal > -1 &&
        newVal < 8 &&
        this.userIsDrawing &&
        this.selectedTile &&
        this.activePaletteColor
      ) {
        this.setVramPixel({
          ...this.selectedTile,
          x: this.editorHFlip ? 7 - this.pixelX : this.pixelX,
          y: this.editorVFlip ? 7 - this.pixelY : this.pixelY,
          colorIndex: this.activePaletteColor[this.userIsDrawing]
        })
      }
    } else this.colorPixel16x16Context(newVal)
  },
  colorPixel16x16Context (newVal = 0) {
    if (
      newVal > -1 &&
      newVal < 16 &&
      this.userIsDrawing &&
      this.selectedTiles &&
      this.activePaletteColor
    ) {
      this.setVramPixel({
        ...this.selectedTiles[this.currentTileIndex],
        x: this.editorHFlip ? 7 - this.pixelX16x16Context : this.pixelX16x16Context,
        y: this.editorVFlip ? 7 - this.pixelY16x16Context : this.pixelY16x16Context,
        colorIndex: this.activePaletteColor[this.userIsDrawing]
      })
    }
  },
  dispatchShift (selectedTileOrTiles) {
    if (!this.edit16x16) {
      this.setSelectedTilePersistUndo(selectedTileOrTiles)
      this.setVramTile(selectedTileOrTiles)
    } else {
      this.setSelectedTilesPersistUndo(selectedTileOrTiles)
      selectedTileOrTiles.forEach(function (it) {
        this.setVramTile(it)
      }.bind(this))
    }
    this.redraw()
  },
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
  },
  getHorizontalShiftedTile (tile, direction) {
    tile.tile.data.forEach(function (it, i) {
      tile.tile.data[i][direction === 'left' ? 'push' : 'unshift'](
        it[direction === 'left' ? 'shift' : 'pop']())
    })
    return tile
  },
  getHorizontalShiftedTiles (tiles, direction) {
    for (let i = 0; i < 2; i++) {
      tiles[i * 2].tile.data.forEach(function (it, j) {
        tiles[(i * 2) + 1]
          .tile.data[j][direction === 'left' ? 'push' : 'unshift'](
            it[direction === 'left' ? 'shift' : 'pop']())
        it[direction === 'left' ? 'push' : 'unshift'](
          tiles[(i * 2) + 1]
            .tile.data[j][direction === 'left' ? 'shift' : 'pop']())
      })
    }
    return tiles
  },
  getVerticalShiftedTile (tile, direction) {
    tile.tile.data[direction === 'down' ? 'unshift' : 'push'](
      tile.tile.data[direction === 'down' ? 'pop' : 'shift']())
    return tile
  },
  getVerticalShiftedTiles (tiles, direction) {
    for (let i = 0; i < 2; i++) {
      tiles[i + 2]
        .tile.data[direction === 'up' ? 'push' : 'unshift'](
          tiles[i].tile.data[direction === 'up' ? 'shift' : 'pop']())
      tiles[i]
        .tile.data[direction === 'up' ? 'push' : 'unshift'](
          tiles[i + 2].tile.data[direction === 'up' ? 'shift' : 'pop']())
    }
    return tiles
  },
  horizontalShift (direction) {
    if (!this.edit16x16) {
      this.dispatchShift(
        this.getHorizontalShiftedTile(
          cloneDeep(this.selectedTile), direction)
      )
    } else {
      this.dispatchShift(
        this.getHorizontalShiftedTiles(
          cloneDeep(this.selectedTiles), direction))
    }
  },
  verticalShift (direction) {
    if (!this.edit16x16) {
      this.dispatchShift(
        this.getVerticalShiftedTile(
          cloneDeep(this.selectedTile), direction))
    } else {
      this.dispatchShift(
        this.getVerticalShiftedTiles(
          cloneDeep(this.selectedTiles), direction))
    }
  }
}
