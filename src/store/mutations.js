import { cloneDeep } from 'lodash'
import Vue from 'vue'

import { createBlankTemplate } from '../components/Miscellaneous.js'

// -----------------------------------------------------------------------------
// Mutations should be written in SNAKE_CASE by convention.  This would normally
// be to build a library of constants.  But since I discourage the use of
// mutations outside the store, I use snake case to help delineate them from
// actions when looking at the store.
// Vuex refers to the execution of Mutations as "commits"
// -----------------------------------------------------------------------------

export default {
  CLEAR_ACTIVE_PALETTE_COLOR (state) {
    state.activePaletteColor.left = 0
    state.activePaletteColor.right = 0
  },
  CLEAR_BEAM_OFFSET_INDEX (state) { state.beamOffset.index = undefined },
  CLEAR_EDITOR_FLIP (state) { state.editorFlip = { h: false, v: false } },
  CLEAR_ERROR (state) {
    state.error.type = ''
    state.error.title = ''
    state.error.message = []
  },
  CLEAR_SELECTED_TILE (state) {
    state.selectedTile = {
      empty: true,
      tile: { data: createBlankTemplate() }
    }
  },
  CLEAR_SELECTED_TILES (state) {
    state.selectedTiles = undefined
  },
  CLEAR_PALETTES_UPDATE_FLAG (state, { index }) {
    Vue.delete(state.palettes[index], '_updated')
  },
  CLEAR_SPRITE_UPDATE_FLAG (state, { half, index }) {
    Vue.delete(
      state
        .tileMaps[half]
        .tileMap
        .sprites[index],
      '_updated')
  },
  CLEAR_UNDO_REDO_CACHES (state) {
    state.undoCache = []
    state.redoCache = []
    state.undoRedoInterim = []
  },
  CLEAR_UPDATE_SPRITE (state) {
    state.updateSprite = false
  },
  CLEAR_UPDATE_PALETTE (state) {
    state.updatePalette = false
  },
  CLEAR_UPDATE_VRAM (state) {
    state.updateVram = false
  },
  CLEAR_VRAM_UPDATE_FLAG (state, { half, index, part }) {
    Vue.delete(
      state
        .vram[half]
        .parts[part]
        .tiles[index],
      '_updated')
  },
  DECREMENT_FRAME_TOGGLE (state) {
    state.decrementFrame = !state.decrementFrame
  },
  INCREMENT_FRAME_TOGGLE (state) {
    state.incrementFrame = !state.incrementFrame
  },
  // pull newest item from the undo array history
  POP_FROM_UNDO_CACHE (state) {
    state.redoCache.unshift(
      state.undoRedoInterim.length
        ? state.undoRedoInterim.pop()
        : cloneDeep(
          state.edit16x16
            ? state.selectedTiles
            : state.selectedTile))
    state.undoRedoInterim.unshift(state.undoCache.pop())
  },
  // [...] <= insert into end of undo array
  PUSH_TO_UNDO_CACHE (state, o) {
    state.redoCache = []
    state.undoCache.push(o)
    if (state.undoCache.length > 16) state.undoCache.shift()
  },
  // pull newest item from the redo array history
  SHIFT_FROM_REDO_CACHE (state) {
    if (state.undoRedoInterim.length) {
      state.undoCache.push(state.undoRedoInterim.shift())
    }
    state.undoRedoInterim.push(state.redoCache.shift())
  },
  // insert at start of redo array => [...]
  UNSHIFT_TO_REDO_CACHE (state, o) {
    if (state.undoRedoInterim.length) {
      state.redoCache.unshift(state.undoRedoInterim.pop())
      if (state.redoCache.length > 16) state.redoCache.pop()
    }
  },
  SET_ACTIVE_PALETTE_INDEX (state, o) {
    state.activePaletteIndex = o || 0
    state.refreshPalette = !state.refreshPalette
  },
  SET_ACTIVE_PALETTE_COLOR (state, { colorIndex, leftRight = 0 }) {
    state.activePaletteColor[leftRight] = colorIndex
  },
  SET_ACTIVE_PALETTE (state, p) {
    const palettes = state.palettes[state.activePaletteIndex]
    palettes.palette = p
    palettes._updated = new Date().getTime()
    state.updatePalette = true
    state.refreshPalette = !state.refreshPalette
  },
  SET_ACTIVE_SPRITE (state, o) {
    state.activeSprite = o
  },
  SET_BEAM_OFFSET_ACTION (state, a) { state.beamOffset.action = a },
  SET_BEAM_OFFSET_DATA (state, d) { state.beamOffset.data = d },
  SET_BEAM_OFFSET_DIRECTION (state, d) { state.beamOffset.direction = d },
  SET_BEAM_OFFSET_INDEX (state, i) { state.beamOffset.index = i },
  SET_ACTIVE_BEAM_UPDATE (state, xY) {
    if (typeof state.beamOffset.index !== 'undefined' && state.beamOffset.action) {
      Object.keys(xY).forEach(function (k) {
        state
          .beamOffset
          .data[state.beamOffset.action][k.toUpperCase()]
          ._updates.splice(state.beamOffset.index, 1, xY[k])
      })
    }
  },
  SET_CONFIRMED (state, { message, callback }) {
    state.confirmed.message = message
    state.confirmed.callback = callback
    state.confirmed.show = true
  },
  SET_COPIED_TILE_DATA (state) {
    if (state.selectedTile && !state.selectedTile.hasOwnProperty('empty')) {
      state.copiedTileData = cloneDeep(state.selectedTile.tile.data)
    }
  },
  SET_CURRENT_FRAME_INDEX (state, o) { state.currentFrameIndex = o },
  SET_CURRENT_PALETTE (state, o) { state.currentPalette = o },
  SET_CURRENT_POSE (state, o) { state.currentPose = o },
  SET_EDIT_16X16 (state, o) { state.edit16x16 = o },
  SET_EDITOR_ACTIVE (state, o) { state.editorActive = o },
  SET_EDITOR_RATIO (state, o) { state.editorRatio = o },
  SET_ERROR (state, { title, type, message }) {
    state.loading = false
    state.error.type = type
    state.error.title = title
    state.error.message = message
  },
  SET_EVENT_OBSERVER (state, o) { state.eventObserver = o },
  SET_FILEPATH (state, o) { state.filePath = o },
  SET_FRAMES (state, o) { state.frames = o },
  SET_LOADING (state, o) { state.loading = o },
  SET_PALETTE_COLOR_CHUNK (
    state, { activeColorIndex, color, isInitialising = false }) {
    const palettes = state
      .palettes[state.activePaletteIndex]
    palettes.palette[activeColorIndex] = color
    if (!isInitialising) {
      palettes._updated = new Date().getTime()
      state.updatePalette = true
    }
    state.refreshPalette = !state.refreshPalette
  },
  SET_PALETTE_CLIPBOARD (state, o) { state.paletteClipboard = o },
  SET_PALETTES (state, o) {
    state.palettes = o
    state.updatePalette = false
  },
  SET_SELECTED_TILE (state, o) { state.selectedTile = o },
  SET_SELECTED_TILES (state, o) { state.selectedTiles = o },
  SET_SETTINGS (state, o) { state.settings = o },
  SET_SPRITE_DEFAULT (state, o) { state.spriteDefault = o },
  SET_SPRITE_MASK_COLOR (state, c) { state.spriteMaskColor = c },
  SET_SPRITE_PROPERTY (state, { half, index, property, value }) {
    const sprite = state
      .tileMaps[half]
      .tileMap.sprites[index]
    sprite[property] = value
    sprite._updated = new Date().getTime()
    state.updateSprite = true
  },
  SET_SPRITE_RATIO (state, o) { state.spriteRatio = o },
  SET_SPRITE_REFRESH (state) { state.spriteRefresh = !state.spriteRefresh },
  SET_TAB (state, o) { state.tab = o },
  SET_TILEMAPS (state, o) { state.tileMaps = o },
  SET_USER_IS_DRAWING (state, o) { state.userIsDrawing = o },
  SET_VRAM (state, o) {
    state.vram = o
    state.updateVram = false
    state.updateSprite = false
  },
  SET_VRAM_RATIO (state, o) { state.vramRatio = o },
  SET_VRAM_PIXEL (state, { half, part, index, x, y, colorIndex }) {
    const vTile = state.vram[half].parts[part].tiles[index]
    if (vTile &&
      vTile.hasOwnProperty('data') &&
      vTile.data[y] &&
      typeof vTile.data[y][x] === 'number') {
      vTile.data[y][x] = colorIndex
      vTile._updated = new Date().getTime()
      state.updateVram = true
    }
  },
  SET_VRAM_TILE (state, { half, part, index, tile }) {
    if (tile && !tile.hasOwnProperty('empty')) {
      const vTile = state
        .vram[half]
        .parts[part]
        .tiles[index]
      vTile.data = tile.data
      vTile._updated = new Date().getTime()
      state.updateVram = true
    }
  },
  SHORTCUT_TRIGGER_FULL_SAVE_TOGGLE (state) {
    state.shortcutTriggerFullSave = !state.shortcutTriggerFullSave
  },
  TOGGLE_CONFIRM (state) {
    state.confirmed.show = !state.confirmed.show
  },
  TOGGLE_EDITOR_FLIP (state, flip) {
    state.editorFlip[flip] = !state.editorFlip[flip]
  },
  TOGGLE_LAYOUT_DRAWER_OPEN (state) {
    if (state.showHelp) state.layoutDrawerOpen = false
    else state.layoutDrawerOpen = !state.layoutDrawerOpen
  },
  TOGGLE_SAVE_EVENT_LISTENER (state) {
    state.saveEventListener = !state.saveEventListener
  },
  TOGGLE_SAVE_KEY_EVENT (state) {
    state.saveKeyEvent = !state.saveKeyEvent
  },
  TOGGLE_SHOW_HELP (state) {
    state.showHelp = !state.showHelp
  },
  TOGGLE_SPRITE (state) { state.showSprite = !state.showSprite },
  TOGGLE_VRAM (state) { state.showVram = !state.showVram },
  UPDATE_EDITOR (state) { state.editorUpdate = !state.editorUpdate },
  ZERO_BEAM_UPDATES (state) {
    Object.keys(state.beamOffset.data).forEach(
      actionKey =>
        Object.keys(state.beamOffset.data[actionKey]).forEach(
          XYKey => {
            for (let i in state.beamOffset.data[actionKey][XYKey]._updates) {
              state.beamOffset.data[actionKey][XYKey]._updates.splice(i, 1, 0)
            }
          }
        )
    )
  }
}
