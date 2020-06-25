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
    beamOffset: {
      action: 'STATIONARY',
      type: 'DEFAULT',
      direction: 'FACING_LEFT',
      index: undefined,
      data: undefined,
      cursorImage: (function () {
        const img = new Image()
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5AUDFTQbsPaIKgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAADVklEQVRIx72WP2hbVxTGf0fVs5WnPwZbUakooRY2DVh2lkezxClIxZkLtumouYPBUyZ1qKdMhg6dNQY70Dmh0hBnKQhKYxvSRkgZikpkKeDoT54tVbfDu+9F/+I0Q3wW6d777vfd7zvn3fOE90TWsrz/O8WiGpiXgfkLMeR94KYIC34/1w2D5cePVS+Vwl8ocHj7tjzrdin1enSUupBM3gUeEeFOIMByaAoSwBLI93mlnqSRW3nUz2nhGCjDYeuch7bN63eQySSCFcNgPWLCKqhUH7vTpN1scPXbiirnQiQyLU5+mZdgeI6AGUYKPjiAB687PO12x4j8owS3pqdZiwdgC9pvXlH76/lEC5qnJzRPTwCIfbVI8OtZ1n8yiVRtnpydkbUsj8g3uHHFMFiLB1Dbinq9Qmjtd/5P1KrPqdcrqG3FWjzAimEMrftcFRERx6ItaLx8QfO05j2UyLRUItNSAPNf3hybc5TVaLx8AVuwHjGJiHjueEruBAKw6lg0SlDOhdgYOf0GoPOjEpmWR9R+8wpWNZ6rJGtZmCIsh6ZQqT616lAOvETvHaWdIrnhLOwdpSWRaVHOhQDUoHUq1Wc5NIWp1fgAFvx+SIDdaY4p0KcUSeYZ1K7HHtGgdXanCQmN6265bhiwBO1mY8iSu5kWylXgxvSvQ0N1lJa72i432s0GLGlc/Z4oPiCUUojIh2xxSHqpFJ/8KFRKv3kLbhVxQ+sdUQDA2TfQB/5whpU/B/Yv3OTfHxT+QuFylPizliWbpknyO4P6Z2XvLU5kWmpDVxELWnYg7x1I2TpXJdhM5tW+U9ICEJ65SvSfBEf3u+x1Ok7in3W7cAzB8NzQCe7lQkgyr6iNWOTVK0gyr+45ZexFMDwHxxrXra5SrwdlCJhh78FyLuSVp1zLK0p6oa9/SyDX8l6ZuypA45Q1LuDbKRbpKMVh6xwp+IjFFycSbSa1VTrJm8nJBLH4IlLwcdg6p6MUO8Xi22vloW3DAQSvzBKeiY0R7Y8kc9/J2xBBeCZG8MosHGi80X6StSynj3xuorbV2CU5egsMgrsEc59+gewKD/52+srEq/5pt8ujqo3sCtHo/JB1F0Usvkg0Oo/sCo+qtte4LrUzXn6Pv7SvlY/x3fUfJy/SqWuzBE0AAAAASUVORK5CYII='
        return img
      })()
    },
    confirmed: {
      callback () {},
      message: '',
      show: false
    },
    currentFrameIndex: 0,
    currentPalette: 0,
    currentPose: 0,
    copiedTileData: undefined,
    decrementFrame: false,
    edit16x16: false,
    editorActive: false,
    editorRatio: 1.1, // Size = Ratio * 32 for Editor.
    editorRatioMax: 1.5,
    editorRatioMin: 0.7,
    editorUpdate: false,
    editorFlip: { h: false, v: false },
    error: { type: '', message: [] },
    eventObserver: '',
    filePath: '',
    incrementFrame: false,
    layoutDrawerOpen: true,
    loading: false,
    frames: [],
    palettes: [],
    paletteClipboard: [],
    pointerClipboard: {
      dma: {
        top: {
          table: undefined,
          entry: undefined
        },
        bottom: {
          table: undefined,
          entry: undefined
        }
      },
      frame: {
        top: undefined,
        bottom: undefined
      }
    },
    redoCache: [],
    refreshPalette: true, // value is irrelevant, simply forces a refresh when color changed
    refreshFrame: false,
    saveKeyEvent: false,
    saveEventListener: false,
    selectedTile: undefined,
    selectedTiles: undefined,
    settings: {
      PALETTES: {},
      POSES: []
    },
    shortcutTriggerFullSave: false,
    showHelp: false,
    showSprite: true,
    showVram: true,
    spriteDefault: undefined,
    spriteMaskColor: 'blue',
    spriteRatio: 6,
    spriteRefresh: false,
    spriteDefaulted: false,
    tab: 'basic',
    tileMaps: {},
    undoCache: [],
    undoRedoInterim: [],
    updatePalette: false,
    updateSprite: false,
    updateVram: false,
    userIsDrawing: undefined, // 'left' | 'right' | undefined
    vram: {},
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
