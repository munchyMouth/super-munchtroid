<template>
  <div class="settings">
    <template v-if="!hasError && romLoaded">
    <div class="settings__dropdown-label">
      <strong>Pose: </strong>
    </div>
    <select @change="choosePose()">
      <option v-for="({pose}, i) in settings.POSES"
              :key="i"
              :value="pose"
              :selected="i === currentPose ? 'selected' : false">
        {{ pose }}
      </option>
    </select>
    <div class="settings__dropdown-label">
      <strong>Palette: </strong>
    </div>
    <select @change="choosePalette()">
      <option v-for="(it, i) in settings.PALETTES"
              :key="i"
              :value="it.id"
              :selected="i === currentPalette ? 'selected' : false">
        {{ it.name }} (cycles: {{ it.length / 32 }})
      </option>
    </select>
    <plus-minus-field
      title="Frame No:"
      :value="`${currentFrameIndex + 1} of ${tileMaps.length}`"
      @decrement="frameDec()"
      @increment="frameInc()" />
    <plus-minus-field
      title="Sprite Zoom:"
      :value="`${spriteRatio} : 1px`"
      @decrement="spriteZoomOut()"
      @increment="spriteZoomIn()" />
    <hr />
    <div class="settings__frame-tree">
      <label>
        <strong>Sprite Manager: </strong>
      </label>
      <template v-if="tileMapFrame">
        <tree v-for="(half, j) in ['top', 'bottom']"
              :key="tileMapFrame[half]._id + j"
              :label="half"
              :open-override="activeHalf === tileMapFrame[half]._id + j
                ? activeHalf
                : false"
              @opened="clearActiveSprite(tileMapFrame[half]._id + j)"
              @closed="clearActiveSprite()">
          <template slot="default" slot-scope="spriteIs">
          <tree-li>
            <tree v-for="(sprite, k) in tileMapFrame[half].tileMap.sprites"
                  :key="sprite._id + k"
                  :open-override="activeSpriteAddress &&
                    activeSpriteAddress === sprite._address
                      ? sprite._id + k
                      : spriteIs.open"
                  :label="sprite._address"
                  @opened="actionSelectedSprite({ half, index: k, ...sprite })"
                  @closed="clearActiveSprite()">
              <tree-li>
                <sprite-manager :half="half"
                                :index="k"/>
              </tree-li>
            </tree>
          </tree-li>
          </template>
        </tree>
      </template>
      <div class="settings__frame-tree__save">
      <hr />
        <button :class="`no-style ${updateSprite ? '--active' : ''}`"
                @click="saveSprites">
          <icon name="save" /> Save All Sprite Changes
        </button>
      </div>
      <div class="settings__frame-tree__save">
      <hr />
        <button :class="`no-style ${updateVram ? '--active' : ''}`"
                @click="saveVram">
          <icon name="save" /> Save All VRAM Changes
        </button>
      </div>
    </div>
    </template>
    <template v-else-if="hasError">
      <strong class="settings__error-list">{{ error.type }}</strong>
      <ul class="settings__error-list">
        <li v-for="(message, i) in error.message"
            :key="i">
          {{ message }}
        </li>
      </ul>
    </template>
    <template v-else>
      <div class="settings__init">
        <div>
          <icon name="arrow-up" />
        </div>
        <div>
          Please load a ROM using the File menu above.
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapGetters, mapActions, mapMutations } from 'vuex'

import 'vue-awesome/icons/arrow-up'
import 'vue-awesome/icons/minus'
import 'vue-awesome/icons/plus'
import 'vue-awesome/icons/save'
import Icon from 'vue-awesome/components/Icon'

import { getUpdatedVramTiles } from './Miscellaneous'

import PlusMinusField from './PlusMinusField.vue'
import SpriteManager from './SpriteManager.vue'
import Tree from './Tree.vue'
import TreeLi from './TreeLi.vue'

export default {
  name: 'settings',
  components: {
    Icon,
    PlusMinusField,
    SpriteManager,
    Tree,
    TreeLi
  },
  computed: {
    ...mapGetters([
      'activeSpriteAddress',
      'currentFrame',
      'currentFrameIndex',
      'currentPalette',
      'currentPose',
      'error',
      'filePath',
      'hasError',
      'loading',
      'romLoaded',
      'settings',
      'spriteRatio',
      'updateSprite',
      'tileMapFrame',
      'tileMaps',
      'updateVram',
      'updatePalette',
      'updateSprite',
      'vram'
    ])
  },
  data () {
    return {
      activeHalf: undefined,
      previousPaletteIndex: 0,
      previousPoseIndex: 0
    }
  },
  methods: {
    ...mapActions([
      'clearSpriteUpdateFlag',
      'setActiveSprite',
      'setCurrentFrameIndex',
      'setError',
      'setSamus',
      'setSpriteRatio'
    ]),
    ...mapMutations({ setLoading: 'SET_LOADING' }),
    actionSelectedSprite (sprite) {
      this.setActiveSprite(sprite)
    },
    clearActiveSprite (activeHalf) {
      this.setActiveSprite()
      if (activeHalf) this.activeHalf = activeHalf
    },
    choosePalette () {
      if (!this.updatePalette ||
        (this.updatePalette &&
        confirm('WARNING: Your palette changes will be lost!'))) {
        this.previousPaletteIndex = event.currentTarget.selectedIndex
        ipcRenderer.send('Load Palettes', {
          filePath: this.filePath,
          index: this.previousPaletteIndex
        })
      } else event.currentTarget.selectedIndex = this.previousPaletteIndex
    },
    choosePose () {
      if ((!this.updateVram && !this.updateSprite) ||
      ((this.updateSprite || this.updateVram) &&
      confirm('WARNING: Your pose edits to VRAM and/or Sprites will be lost!'))) {
        this.previousPoseIndex = event.currentTarget.selectedIndex
        this.clearActiveSprite()
        this.setLoading(true)
        ipcRenderer.send('Load Pose', {
          filePath: this.filePath,
          pose: this.previousPoseIndex
        })
      } else event.currentTarget.selectedIndex = this.previousPoseIndex
    },
    filterSpritesToSave (half, tileMapFrame) {
      return tileMapFrame[half]
        .tileMap
        .sprites
        .filter((it, index) => {
          if (it._updated) {
            this.clearSpriteUpdateFlag({ half, index })
            return true
          }
        })
    },
    frameDec () {
      this.clearActiveSprite()
      this.setCurrentFrameIndex(
        this.currentFrameIndex - 1 > -1
          ? this.currentFrameIndex - 1
          : this.tileMaps.length - 1)
    },
    frameInc () {
      this.clearActiveSprite()
      this.setCurrentFrameIndex(
        this.tileMaps.length > this.currentFrameIndex + 1
          ? this.currentFrameIndex + 1
          : 0)
    },
    saveSprites () {
      if (this.updateSprite) {
        this.setLoading(true)
        ipcRenderer.send(
          'Save Sprites',
          {
            filePath: this.filePath,
            sprites: this.tileMaps.reduce(
              function (arr, it) {
                return arr
                  .concat(this.filterSpritesToSave('top', it))
                  .concat(this.filterSpritesToSave('bottom', it))
              }.bind(this), [])
          })
      }
    },
    saveVram () {
      if (this.updateVram) {
        this.setLoading(true)
        ipcRenderer.send(
          'Save VRAM Tiles',
          {
            filePath: this.filePath,
            tiles: getUpdatedVramTiles(this.vram)
          })
      }
    },
    spriteZoomIn () {
      if (this.spriteRatio < 6) {
        this.setSpriteRatio(this.spriteRatio + 1)
      }
    },
    spriteZoomOut () {
      if (this.spriteRatio > 1) {
        this.setSpriteRatio(this.spriteRatio - 1)
      }
    }
  }
}
</script>

<style>
  .settings > div {
    overflow-y: auto !important;
    height: 100%;
  }
  .settings input, .settings select {
    width: 100%;
    height: 30px;
    margin-bottom: 10px;
  }
  .settings__error-list {
    height: auto;
    color: red;
    width: auto !important;
  }
  .settings__init {
    display: flex;
    margin-top: 1rem;
  }
  .settings__init div:first-child {
    margin-right: 1rem;
  }
  .settings__frame-tree > label {
    display: block;
    padding-bottom: 8px;
  }
  .settings__frame-tree__save {
    margin-top: 8px;
    padding-left: 8px;
    font-weight: bold;
  }
  .settings__frame-tree__save > button.--active {
    color: red
  }
</style>
