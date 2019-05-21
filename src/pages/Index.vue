<template>
  <q-page v-if="Object.keys(tileMaps).length">
    <div class="munch-index-wrapper"
         @mouseenter="setUserIsDrawing(undefined)"
         @mousedown="draw"
         @mouseup="setUserIsDrawing(undefined)">
      <vram />
      <div class="munch-index">
        <div class="munch-index__left">
          <sprite />
          <div class="munch-index__left__toggle">
            <div v-if="showSprite">
              <button class="no-style munch-index__left__toggle munch-index__left__toggle--show"
                  @click="toggleSprite()">
                <icon name="regular/times-circle" />
              </button>
            </div>
            <button class="no-style munch-index__left__toggle"
                @click="toggleSprite()"
                v-else>
              <img src="./mini.png" />
            </button>
          </div>
        </div>
        <div class="munch-index__right">
          <editor />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import 'vue-awesome/icons/regular/times-circle'
import 'vue-awesome/icons/regular/circle'
import 'vue-awesome/icons/undo'
import Icon from 'vue-awesome/components/Icon'

import Editor from '../components/Editor.vue'
import Sprite from '../components/Sprite.vue'
import Vram from '../components/Vram.vue'

export default {
  name: 'PageIndex',
  components: { Editor, Icon, Sprite, Vram },
  computed: {
    ...mapGetters([
      'activeSprite',
      'editorActive',
      'showVram',
      'showSprite',
      'spriteDefault',
      'spriteRatio',
      'tileMaps',
      'vram'
    ])
  },
  data () {
    return {
      error: '',
      undoCache: [],
      redoCache: [],
      domObj: undefined
    }
  },
  methods: {
    ...mapActions([
      'setActiveSprite',
      'setEditorActive',
      'setUserIsDrawing',
      'toggleSprite'
    ]),
    // assigning draw here prevents the user's drawing actions being lost by accident when their cursor leaves the editor window
    draw (evt) {
      if (!this.noSelectedTile && this.editorActive) {
        this.setUserIsDrawing(evt.button < 1 ? 'left' : 'right')
      }
    },
    setSpriteBoxSize (sprRatio) {
      const pane = document.querySelector('.munch-index__left')
      if (pane) {
        pane.setAttribute(
          'style',
          `width: ${80 * sprRatio + 20}px;
           min-width: ${80 * sprRatio + 20}px;`)
      }
    }
  },
  mounted () {
    this.setSpriteBoxSize(this.spriteRatio)
  },
  watch: {
    spriteRatio (newVal) {
      if (!this.showSprite) this.toggleSprite()
      this.setSpriteBoxSize(this.spriteRatio)
    },
    showSprite (newVal) {
      this.setSpriteBoxSize(newVal ? this.spriteRatio : 0.2)
    },
    vram () {
      this.setSpriteBoxSize(this.showSprite ? this.spriteRatio : 0.2)
    }
  }
}
</script>

<style>
  .munch-index {
    position: relative;
    display: flex;
    margin-left: 16px;
    height: 100%;
  }
  .munch-index-wrapper {
    display: flex;
    flex-direction: column;
    width: 100% !important;
    height: 100%;
    display: relative;
  }
  .munch-index__left {
    display:flex;
    align-content: center;
    flex-direction: row;
    align-items: flex-start;
    width: 500px;
    min-width: 500px;
  }
  .munch-index__left__toggle {
    width: 12px;
    z-index: 99;
  }
  .munch-index__left__toggle > div {
    display: flex;
    flex-direction: column;
    align-content: space-between
  }
  .munch-index__left__toggle--show:first-child {
    position: relative;
    align-self: flex-start;
    top: 0;
    margin-top: 5px;
    margin-left: -22px;
  }
  .munch-index__left__toggle--show:last-child {
    position: relative;
    margin-top: 5px;
    margin-left: -20px;
  }
  .munch-index__left__toggle--show:last-child > svg {
    width: 97%;
  }
  .munch-index__left__toggle button img {
    padding: 5px;
    border: 1px solid black
  }
  #rom-table {
    border-right: 3rem solid #ddd;
    overflow: auto;
  }
  .t-table {
    border-collapse: collapse;
    overflow: auto;
    margin-top: 48px;
  }
  .t-table > thead {
    position: fixed;
    background: white;
    margin-top: -48px;
    margin-bottom: 1px solid #aaa;
  }
  .t-table > thead > tr > td {
    min-width: 51px;
  }
  .t-table__row__th {
    padding: 0;
    height: 48px;
    text-align: center;
    border-left: 1px solid #ddd;
    border-right: 1px solid #ddd;
  }
  .t-table__row__th:last-child {
    min-width: 50px;
  }
  .t-table tr td, .t-table tr td canvas {
    margin-bottom: -4px !important;
    width: 48px;
  }
  .t-table__form__input {
    font-family: 'Courier New', Courier, monospace;
    font-weight: bold;
    text-transform: uppercase;
  }
  .t-table .t-table__row__cell {
    border: 1px solid #aaa;
  }
  .t-table .t-table__row__cell--side {
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select:none;
    -o-user-select:none;
    user-select:none;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  }
  .t-table__form__aside {
    font-size: .9rem;
  }
</style>
