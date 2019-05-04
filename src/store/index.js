import Vue from 'vue'
import Vuex from 'vuex'

import actions from './actions'
import apiGetters from './getters'
import mutations from './mutations'

Vue.use(Vuex)

// Message from Munch:----------------------------------------------------------
// Hullo, this bit might seem extra confusing and repetitive if you're new to Vue
// & Vuex.  It actually let's different components of the build talk to each other
// and, unfortunately, there's no "nice" way to express it (I could modularise
// it I guess, but I felt like this build was plenty engineered without the need
// for more annoying fiddly details to explain). Aaaaaaaanyway, think of vuex as
// like a database ORM map and MVC model roled into one.  Anywhere you see
// "mapGetter"/"mapAction" in one of my Vue Components, I'm loading methods from
// this vuex "store"...
//
// the store is divided as follows:
// - "state": contains the actual variables being stored.
// - "mutations": perform state changes and should only in-my-opinion be called
//   by the store's "actions" (see below).
// - "actions": stuff outside the store should only change store variables with
//   actions. One of the big advantages actions have over mutations is that
//   they can be fired asynchronously.  Not really that relevant to this build
//   at-the-time-of-writing but could well come in handy at a later stage.
//   Eitherway, mutations are less reliable when used by vue components (in my
//   experience) and less futureproof.  a subroutine that isn't async right now
//   could well require async jobs in the future.
// - stuff outside the store should use "getters" to view store variables. This
//   isn't technically mandatory and might seem excessive, but it's how vuex
//   prefers clients to read stored data and, as with actions, tends to make the
//   build more futureproof.
// -----------------------------------------------------------------------------
const store = {
  state: {
    activePaletteIndex: 0,
    activePaletteColor: { left: 0, right: 0 },
    activeSprite: undefined,
    currentFrameIndex: 0,
    currentPalette: 0,
    currentPose: 0,
    copiedTileData: undefined,
    editorActive: false,
    editorRatio: 1.1, // Size = Ratio * 32 for Editor.
    editorUpdate: false,
    editorFlip: { h: false, v: false },
    error: { type: '', message: [] },
    filePath: '',
    loading: false,
    frames: [],
    palettes: [],
    redoCache: [],
    refreshPalette: true, // value is irrelevant, simply forces a refresh when color changed
    selectedTile: undefined,
    settings: {
      PALETTES: {},
      POSES: []
    },
    showSprite: true,
    showVram: true,
    spriteDefault: undefined,
    spriteRatio: 6,
    spriteRefresh: false,
    spriteDefaulted: false,
    tileMaps: {},
    undoCache: [],
    undoRedoInterim: [],
    updatePalette: false,
    updateSprite: false,
    updateVram: false,
    userIsDrawing: undefined, // 'left' | 'right' | undefined
    vram: [],
    vramRatio: 6
  }
}

// -----------------------------------------------------------------------------
// add the mutations and actions
// -----------------------------------------------------------------------------
store.mutations = mutations
store.actions = actions

// -----------------------------------------------------------------------------
// loop the basic getters and bolt them onto the API getters!
// -----------------------------------------------------------------------------
store.getters =
  Object.keys(store.state).reduce((obj, key) => {
    // default getter format: `state => state.someStoreVariable`
    if (!obj.hasOwnProperty(key)) obj[key] = state => state[key]
    return obj
  }, apiGetters)

// -----------------------------------------------------------------------------
// ignore this property, it's just an admin thing.
// -----------------------------------------------------------------------------
store.strict = process.env.NODE_ENV !== 'production'

// -----------------------------------------------------------------------------
// We're done! Export the finished store.
// -----------------------------------------------------------------------------
export default new Vuex.Store(store)
