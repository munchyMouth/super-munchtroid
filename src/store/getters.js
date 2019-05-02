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
  currentFrame: state => (state.vram)
    ? state.vram[state.currentFrameIndex] : undefined,
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
    return state.tileMaps[state.currentFrameIndex][half]
      .tileMap
      .sprites
      .slice()
      .reverse() // Samus' sprite rendering priority is dictated by reverse sprite order
    // NB. the sprite priority bits are always set to 2 for samus, I think it's to stop weird rendering when she
    // collides with enemies/BTS.  For that reason, I've excluded them from Super Munchtroid.  If you want to change
    // how Samus's tiles overlap with each other, you'll have to reorder her in reverse sprite order like the game.
  },
  getSpriteByProps: state => ({ half, index }) =>
    state.tileMaps[state.currentFrameIndex][half].tileMap.sprites[index],
  getVramByProps: state => ({ half, part }) =>
    state.vram[state.currentFrameIndex][half].parts[part],
  getVramTileByProps: state => ({ half, index, part }) =>
    state.vram[state.currentFrameIndex][half].parts[part].tiles[index],
  hasError: state => state.error.type || state.error.message.length,
  hasSelectedTile: state =>
    state.selectedTile &&
    typeof state.selectedTile === 'object' &&
    !state.selectedTile.hasOwnProperty('empty'),
  noSelectedTile: state =>
    !state.selectedTile ||
    (state.selectedTile &&
      state.selectedTile.hasOwnProperty('empty')),
  romLoaded: state => !!state.vram.length, // the `!!` syntax forces primitive boolean rather than truthy.
  vram16x16TileIsValid: state => ({ half, vramIndex, part }) => {
    if (part === 'part1' &&
      state.activeSprite &&
      state.activeSprite.xOffset < 24 &&
      state.activeSprite.yOffset < 24) {
      const _half = handleIrregularHalfLogic({ half, vramIndex })
      for (let i = 1; i < 3; i++) {
        const { tiles } =
          state.vram[state.currentFrameIndex][_half].parts[`part${i}`]
        const modifier = _half === 'bottom' ? 8 : 0
        if (tiles.length + modifier < vramIndex + 2) return false
      }
      return true
    } else return false
  },
  tileMapFrame: state =>
    state.tileMaps && typeof state.currentFrameIndex === 'number'
      ? state.tileMaps[state.currentFrameIndex] : undefined
}
