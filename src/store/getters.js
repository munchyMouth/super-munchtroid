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
  getActiveBeamOffset: state => xY =>
    typeof state.beamOffset.index !== 'undefined' && state.beamOffset.action
      ? state
        .beamOffset
        .data[state.beamOffset.action][xY][state.beamOffset.type]
        .data[state.beamOffset.index]
      : undefined,
  getActiveBeamOffsetX: state =>
    typeof state.beamOffset.index !== 'undefined' && state.beamOffset.action
      ? state
        .beamOffset
        .data[state.beamOffset.action]
        .X[state.beamOffset.type]
        .data[state.beamOffset.index]
      : undefined,
  getActiveBeamOffsetY: state =>
    typeof state.beamOffset.index !== 'undefined' && state.beamOffset.action
      ? state
        .beamOffset
        .data[state.beamOffset.action]
        .Y[state.beamOffset.type]
        .data[state.beamOffset.index]
      : undefined,
  getActiveBeamUpdateX: state =>
    typeof state.beamOffset.index !== 'undefined' && state.beamOffset.action
      ? state
        .beamOffset
        .data[state.beamOffset.action]
        .X[state.beamOffset.type]
        ._updates[state.beamOffset.index]
      : undefined,
  getActiveBeamUpdateY: state =>
    typeof state.beamOffset.index !== 'undefined' && state.beamOffset.action
      ? state
        .beamOffset
        .data[state.beamOffset.action]
        .Y[state.beamOffset.type]
        ._updates[state.beamOffset.index]
      : undefined,
  beamHasUpdates: state => {
    if (state.beamOffset.action && state.beamOffset.data) {
      for (let i of
        ['DEFAULT', 'CHARGE_ORIGIN'].reduce((arr, key) =>
          arr.concat(
            state
              .beamOffset
              .data[state.beamOffset.action]
              .X[key]
              ._updates
              .concat(
                state
                  .beamOffset
                  .data[state.beamOffset.action]
                  .Y[key]
                  ._updates)), [])) {
        if (i !== 0) return true
      }
    }
    return false
  },
  beamIndexHasUpdates: state => {
    if (typeof state.beamOffset.index !== 'undefined' && state.beamOffset.action) {
      for (let i of
        [state
          .beamOffset
          .data[state.beamOffset.action]
          .X[state.beamOffset.type]
          ._updates[state.beamOffset.index],
        state
          .beamOffset
          .data[state.beamOffset.action]
          .Y[state.beamOffset.type]
          ._updates[state.beamOffset.index]]) {
        if (i !== 0) return true
      }
    }
    return false
  },
  getActiveColorFromPaletteInPalettes: state => leftOrRight => {
    return state.palettes.length &&
      typeof state.activePaletteColor[leftOrRight] === 'number' &&
      typeof state.activePaletteIndex === 'number'
      ? state
        .palettes[state.activePaletteIndex]
        .palette[state.activePaletteColor[leftOrRight]]
      : undefined
  },
  getActivePaletteChunked: state => paletteIndex =>
    state
      .palettes[state.activePaletteIndex]
      .palette[paletteIndex]
      .replace('#', '')
      .match(/[0-9A-F]{2}/gi)
      .map(it => parseInt(it, 16)),
  getActivePaletteInPalettes: state => state.palettes[state.activePaletteIndex || 0],
  getBeamCursor: state => state.beamOffset ? state.beamOffset.cursorImage : undefined,
  getBeamData: state => state.beamOffset.data,
  getBeamIndex: state => state.beamOffset.index,
  getBeamAction: state => state.beamOffset.action,
  getBeamPosition: state => state.beamOffset.position,
  getBeamType: state => state.beamOffset.type,
  getBeamHasUpdatesByIndex: state => i => {
    if (state.beamOffset.action && state.beamOffset.data) {
      for (let j of
        [state
          .beamOffset
          .data[state.beamOffset.action]
          .X[state.beamOffset.type]
          ._updates[i],
        state
          .beamOffset
          .data[state.beamOffset.action]
          .Y[state.beamOffset.type]
          ._updates[i]]) {
        if (j !== 0) return true
      }
    }
    return false
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
    state.vram[half].parts[part].tiles[index],
  hasActiveBeamOffsetIndex: state => typeof state.beamOffset.index !== 'undefined',
  hasError: state => state.error.type || state.error.message.length,
  hasSelectedTile: state =>
    state.selectedTile &&
    typeof state.selectedTile === 'object' &&
    !state.selectedTile.hasOwnProperty('empty'),
  hasUnsavedSprites: state =>
    Object.keys(state.tileMaps).reduce(function (result, key) {
      if (!result) {
        state.tileMaps[key].tileMap.sprites.forEach(({ _updated }) => {
          if (_updated) result = true
        })
      }
      return result
    }, false),
  missileFinsVisible: state => state.missileFins ? state.missileFins.show : false,
  noSelectedTile: state =>
    !state.selectedTile ||
    (state.selectedTile &&
      state.selectedTile.hasOwnProperty('empty')),
  pointerClipboardHasBottom: state =>
    state.pointerClipboard.dma.bottom.table &&
    state.pointerClipboard.dma.bottom.entry &&
    state.pointerClipboard.frame.bottom,
  pointerClipboardHasTop: state =>
    state.pointerClipboard.dma.top.table &&
    state.pointerClipboard.dma.top.entry &&
    state.pointerClipboard.frame.top,
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
