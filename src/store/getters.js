import { handleIrregularHalfLogic } from '../components/Miscellaneous'

// -----------------------------------------------------------------------------
// Generally, getters just get a variable from the store. However, they're a
//  great way of throwing together timesaving API calls (e.g.
// `getSpritesByHalf()`). They can also be supplied arguments using the format:
// `state => ({ some, args }) => { ... }`
// I can write a loop to handle basic getters, so I only need to hard code what
// I call the "API" getters (ie. the calls that do more than just return a state
// variable exactly as it appears in the store.
// -----------------------------------------------------------------------------
export default {
  activeSpriteAddress: state => state.activeSprite
    ? state.activeSprite._address : undefined,
  computedSelectedTiles: state => {
    const { half, index, no, part } = state.selectedTile
    return (state.edit16x16)
      ? [
        state.selectedTile,
        {
          half,
          index: index + 1,
          no: no + 1,
          part,
          tile: state.vram[half].parts[part].tiles[index + 1]
        },
        {
          half,
          index,
          no,
          part: 'part2',
          tile: state.vram[half].parts['part2'].tiles[index]
        },
        {
          half,
          index: index + 1,
          no: no + 1,
          part: 'part2',
          tile: state.vram[half].parts['part2'].tiles[index + 1]
        }
      ]
      : undefined
  },
  currentFrame: state => (state.vram)
    ? state.vram : undefined,
  editorHFlip: state => state.editorFlip.h,
  editorVFlip: state => state.editorFlip.v,
  getActivePaletteChunked: state => paletteIndex =>
    state
      .palettes[state.activePaletteIndex]
      .palette[paletteIndex]
      .replace('#', '')
      .match(/[0-9A-F]{2}/gi)
      .map(it => parseInt(it, 16)),
  getActivePaletteInPalettes: state => state.palettes[state.activePaletteIndex || 0],
  getActiveColorFromPaletteInPalettes: state => leftOrRight => {
    return state.palettes.length &&
      typeof state.activePaletteColor[leftOrRight] === 'number' &&
      typeof state.activePaletteIndex === 'number'
      ? state
        .palettes[state.activePaletteIndex]
        .palette[state.activePaletteColor[leftOrRight]]
      : undefined
  },
  getSpritesByHalf: state => ({ half }) => {
    return state.tileMaps[half]
      .tileMap
      .sprites
      .slice()
      .reverse() // Samus' sprite rendering priority is dictated by reverse sprite order
    // NB. the sprite priority bits are always set to 2 for samus, I think it's to stop weird rendering when she
    // collides with enemies/BTS.  For that reason, I've excluded them from Super Munchtroid.  If you want to change
    // how Samus's tiles overlap with each other, you'll have to reorder her in reverse sprite order like the game.
  },
  getSpriteByProps: state => ({ half, index }) =>
    state.tileMaps[half].tileMap.sprites[index],
  getVramByProps: state => ({ half, part }) =>
    state.vram[half].parts[part],
  getVramTileByProps: state => ({ half, index, part }) =>
    state.tab !== 'death'
      ? state.vram[half].parts[part].tiles[index]
      : state.vram.tiles[index],
  hasError: state => state.error.type || state.error.message.length,
  hasSelectedTile: state => {
    return state.selectedTile &&
    typeof state.selectedTile === 'object' &&
    !state.selectedTile.hasOwnProperty('empty')
  },
  hasUnsavedSprites: state =>
    Object.keys(state.tileMaps).reduce(function (result, key) {
      if (!result) {
        state.tileMaps[key].tileMap.sprites.forEach(({ _updated }) => {
          if (_updated) result = true
        })
      }
      return result
    }, false),
  noSelectedTile: state =>
    !state.selectedTile ||
    (state.selectedTile &&
      state.selectedTile.hasOwnProperty('empty')),
  romLoaded: state => !!Object.keys(state.vram).length, // the `!!` syntax forces primitive boolean rather than truthy.
  vram16x16TileIsValid: state => ({ half, vramIndex, part }) => {
    if (part === 'part1' &&
      state.activeSprite &&
      state.activeSprite.xOffset < 24 &&
      state.activeSprite.yOffset < 24) {
      const _half = handleIrregularHalfLogic({ half, vramIndex })
      for (let i = 1; i < 3; i++) {
        const { tiles } =
          state.vram[_half].parts[`part${i}`]
        const modifier = _half === 'bottom' ? 8 : 0
        if (tiles.length + modifier < vramIndex + 2) return false
      }
      return true
    } else return false
  },
  editor16x16TileIsValid: state => ({ half, index, part }) => {
    if (part === 'part1') {
      for (let i = 1; i < 3; i++) {
        const { tiles } = state.vram[half].parts[`part${i}`]
        if (tiles.length < index + 2) return false
      }
      return true
    } else return false
  },
  tileMapFrame: state =>
    state.tileMaps && typeof state.currentFrameIndex === 'number'
      ? state.tileMaps : undefined
}
