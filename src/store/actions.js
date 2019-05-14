import { cloneDeep } from 'lodash'

// -----------------------------------------------------------------------------
// Actions are written in camelCase by convention
// Vuex refers to the execution of Actions as "dispatches"
// -----------------------------------------------------------------------------
export default {
  clearSelectedTile ({ commit, state }) {
    if (!state.preventClearSelecteTile) commit('CLEAR_SELECTED_TILE')
  },
  clearPalettesUpdateFlag ({ commit }, o) {
    commit('CLEAR_PALETTES_UPDATE_FLAG', o)
  },
  clearSpriteUpdateFlag ({ commit }, o) {
    commit('CLEAR_SPRITE_UPDATE_FLAG', o)
  },
  clearVramUpdateFlag ({ commit }, o) {
    commit('CLEAR_VRAM_UPDATE_FLAG', o)
  },
  clearUpdatePalette ({ commit }) { commit('CLEAR_UPDATE_PALETTE') },
  clearUpdateSprite ({ commit }) { commit('CLEAR_UPDATE_SPRITE') },
  clearUpdateVram ({ commit }) { commit('CLEAR_UPDATE_VRAM') },
  setActivePaletteIndex ({ commit }, palette) {
    commit('CLEAR_ACTIVE_PALETTE_COLOR')
    commit('SET_ACTIVE_PALETTE_INDEX', palette)
  },
  pastecopiedTile ({ commit, state }) {
    if (state.copiedTileData &&
      state.selectedTile &&
      state.selectedTile.hasOwnProperty('tile')) {
      commit('PUSH_TO_UNDO_CACHE', cloneDeep(state.selectedTile))
      const data = {
        ...state.selectedTile,
        tile: {
          ...state.selectedTile.tile,
          data: cloneDeep(state.copiedTileData)
        }
      }
      commit('SET_VRAM_TILE', data)
      commit('SET_SELECTED_TILE', data)
      commit('UPDATE_EDITOR')
    }
  },
  pushToUndoCache ({ commit, state }) {
    if (state.selectedTile && !state.selectedTile.hasOwnProperty('empty')) {
      commit('PUSH_TO_UNDO_CACHE', cloneDeep(state.selectedTile))
    }
  },
  popFromUndoCache ({ commit, state }) {
    if (state.selectedTile &&
      !state.selectedTile.hasOwnProperty('empty') &&
      state.undoCache.length) {
      commit('POP_FROM_UNDO_CACHE')
      commit('SET_VRAM_TILE', state.undoRedoInterim[0])
      commit('SET_SELECTED_TILE', state.undoRedoInterim[0])
      commit('UPDATE_EDITOR')
    }
  },
  setActivePaletteColor ({ commit }, obj) { commit('SET_ACTIVE_PALETTE_COLOR', obj) },
  setActiveSprite ({ commit }, sprite, setSpriteDefault = true) {
    commit('SET_ACTIVE_SPRITE', sprite)
    commit('SET_SPRITE_DEFAULT', sprite ? cloneDeep(sprite) : undefined)
  },
  // the copy function below should only copy tile data, any more information would repoint the tile into which it is pasted!
  setCopiedTileData ({ commit }) { commit('SET_COPIED_TILE_DATA') },
  setCurrentFrameIndex ({ commit }, i) {
    commit('CLEAR_UNDO_REDO_CACHES')
    commit('CLEAR_EDITOR_FLIP')
    commit('CLEAR_SELECTED_TILE')
    commit('SET_CURRENT_FRAME_INDEX', i)
  },
  setCurrentPalette ({ commit }, i) { commit('SET_CURRENT_PALETTE', i) },
  setEditorActive ({ commit }, active) { commit('SET_EDITOR_ACTIVE', active) },
  setEditorRatio ({ commit }, ratio) { commit('SET_EDITOR_RATIO', ratio) },
  setError ({ commit }, error) { commit('SET_ERROR', error) },
  setLoading ({ commit }, loading) { commit('SET_LOADING', loading) },
  setPalettes ({ commit }, { palettes, i }) {
    try {
      commit('SET_LOADING', false)
      commit('SET_PALETTES', palettes)
      commit('SET_CURRENT_PALETTE', i)
      commit('SET_ACTIVE_PALETTE_INDEX', 0)
      commit('CLEAR_ACTIVE_PALETTE_COLOR')
    } catch (e) {
      commit('SET_ERROR', {
        title: 'Failed to Load Palette',
        type: 'PaletteRuntimeException',
        message: [e.message]
      })
    }
  },
  setPaletteColorChunk (
    { commit },
    { activeColorIndex, color, isInitialising = false }) {
    commit('SET_PALETTE_COLOR_CHUNK', {
      activeColorIndex,
      color,
      isInitialising
    })
  },
  // Because of the overhead of Samus' full pose load, the function is async as
  // this avoids a race condition in initial rendering behaviour.
  async setSamus ({ commit }, { filePath, frames, pose, resetFrame = true, tileMaps, vram }) {
    try {
      commit('CLEAR_ERROR')
      commit('SET_FILEPATH', filePath)
      if (resetFrame) {
        commit('SET_FRAMES', frames)
        commit('CLEAR_EDITOR_FLIP')
        commit('SET_CURRENT_FRAME_INDEX', 0)
        commit('CLEAR_UNDO_REDO_CACHES')
        commit('CLEAR_SELECTED_TILE')
        commit('SET_CURRENT_POSE', pose)
      } else commit('TOGGLE_PREVENT_CLEAR_SELECTED_TILE')
      commit('SET_TILEMAPS', tileMaps)
      commit('SET_VRAM', vram)
      commit('SET_LOADING', false)
    } catch (e) {
      // this is most likely to be hit if the main process has sent crap data to the renderer
      commit('SET_ERROR', {
        title: 'Failed to Load Samus',
        type: 'SamusRuntimeException',
        message: [e.message]
      })
    }
  },
  setSettings ({ commit }, o) {
    commit('SET_SETTINGS', o)
  },
  setSpriteProperty ({ commit, state }, o) {
    commit('SET_SPRITE_PROPERTY', { ...o })
    if (!o.hasOwnProperty('redraw') || o.redraw) {
      const { half, index } = o
      commit('SET_SPRITE_REFRESH')
      commit('SET_ACTIVE_SPRITE', { // disseminate change to active sprite
        half,
        index,
        ...state
          .tileMaps[state.currentFrameIndex][half]
          .tileMap
          .sprites[index]
      })
    }
  },
  setSpriteRatio ({ commit }, o) { commit('SET_SPRITE_RATIO', o) },
  setSpriteUpdate ({ commit }) { commit('SET_SPRITE_REFRESH') },
  setSelectedTile ({ commit }, o) {
    commit('CLEAR_EDITOR_FLIP')
    commit('CLEAR_UNDO_REDO_CACHES')
    commit('SET_SELECTED_TILE', o)
  },
  setTab ({ commit }, o) { commit('SET_TAB', o) },
  setUserIsDrawing ({ commit, state }, o) {
    if (o) commit('PUSH_TO_UNDO_CACHE', cloneDeep(state.selectedTile))
    commit('SET_USER_IS_DRAWING', o)
  },
  setVramPixel ({ commit }, o) {
    commit('SET_VRAM_PIXEL', o)
    commit('UPDATE_EDITOR')
  },
  setVramRatio ({ commit }, o) { commit('SET_VRAM_RATIO', o) },
  shiftFromRedoCache ({ commit, state }) {
    if (state.selectedTile &&
      !state.selectedTile.hasOwnProperty('empty') &&
      state.redoCache.length) {
      commit('SHIFT_FROM_REDO_CACHE')
      commit('SET_VRAM_TILE', state.undoRedoInterim[0])
      commit('SET_SELECTED_TILE', state.undoRedoInterim[0])
      commit('UPDATE_EDITOR')
    }
  },
  toggleHFlip ({ commit }) { commit('TOGGLE_EDITOR_FLIP', 'h') },
  toggleVFlip ({ commit }) { commit('TOGGLE_EDITOR_FLIP', 'v') },
  toggleSprite ({ commit }) { commit('TOGGLE_SPRITE') },
  toggleVram ({ commit }) { commit('TOGGLE_VRAM') }
}
