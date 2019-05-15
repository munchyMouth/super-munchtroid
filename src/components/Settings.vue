<template>
  <div class="settings">
    <template v-if="tab === 'basic'">
      <div class="settings__show-unused">
        <div>Show unused poses:</div>
        <div>
          <button class="no-style"
                  @click="setshowUnused()">
            <icon :name="showUnused ? 'regular/check-circle' : 'regular/circle'" />
          </button>
        </div>
      </div>
      <hr />
    </template>
    <div class="settings__dropdown-label">
      <strong>{{ this.tab === 'special' ? 'Special ' : '' }}Pose: </strong>
    </div>
    <select class="settings__dropdown" @change="choosePose()">
      <option v-for="({ name, index, unused }, i) in poses"
              :key="i"
              :value="index"
              :class="unused ? '--unused' : ''"
              :selected="i === currentPose ? 'selected' : false">
        {{ name }}
      </option>
    </select>
    <div class="settings__dropdown-label">
      <strong>Palette: </strong>
    </div>
    <select @change="choosePalette()">
      <option v-for="({ name, id, length }, i) in settings.PALETTES"
              :key="i"
              :value="id"
              :selected="i === currentPalette ? 'selected' : false">
        {{ name }} (cycles: {{ length / 32 }})
      </option>
    </select>
    <plus-minus-field
      title="Frame No:"
      :value="`${currentFrameIndex + 1} of ${frames.length}`"
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
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapGetters, mapActions, mapMutations } from 'vuex'

import 'vue-awesome/icons/arrow-up'
import 'vue-awesome/icons/minus'
import 'vue-awesome/icons/plus'
import 'vue-awesome/icons/save'
import 'vue-awesome/icons/regular/check-circle'
import 'vue-awesome/icons/regular/circle'
import Icon from 'vue-awesome/components/Icon'

import { getUpdatedVramTiles } from './Miscellaneous'
import { poseWarning, paletteWarning } from '../libs/messages.json'

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
      'filePath',
      'frames',
      'settings',
      'spriteRatio',
      'updateSprite',
      'tab',
      'tileMapFrame',
      'tileMaps',
      'updateVram',
      'updatePalette',
      'updateSprite',
      'vram'
    ]),
    poses () {
      return this.tab === 'special'
        ? this.settings.SPECIAL_POSES
        : this.settings.POSES
          .map(function (it, i) {
            return (!this.showUnused && it.unused)
              ? undefined
              : { ...it, index: i }
          }.bind(this))
          .filter((it) => it)
    },
    frameDMAOffset () {
      return this.tab === 'special'
        ? this.settings.SPECIAL_POSES[this.currentPose].dmaOffset : 0
    }
  },
  data () {
    return {
      activeHalf: undefined,
      previousPaletteIndex: 0,
      previousPoseIndex: 0,
      showUnused: false
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
        confirm(paletteWarning))) {
        this.previousPaletteIndex = event.currentTarget.selectedIndex
        ipcRenderer.send('Load Palettes', {
          filePath: this.filePath,
          index: this.previousPaletteIndex
        })
      } else event.currentTarget.selectedIndex = this.previousPaletteIndex
    },
    choosePose (zero = false) {
      if (zero || this.validatePose()) {
        this.clearActiveSprite()
        this.setLoading(true)
        this.previousPoseIndex = zero ? 0 : event.currentTarget.selectedIndex
        switch (this.tab) {
          case 'basic':
            ipcRenderer.send('Load Pose', {
              filePath: this.filePath,
              index: zero ? 0 : parseInt(event.currentTarget.value)
            })
            break
          case 'special':
            const pose = this.settings.SPECIAL_POSES[this.previousPoseIndex || 0]
            ipcRenderer.send('Load Pose', {
              ...pose,
              filePath: this.filePath,
              specialPoseFrameOverride: this.frameDMAOffset / 4
            })
            break
        }
        return true
      } else event.currentTarget.selectedIndex = zero ? 0 : this.previousPoseIndex
      return false
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
      const oldFrame = this.currentFrameIndex
      const newFrame = this.currentFrameIndex - 1 > -1
        ? this.currentFrameIndex - 1
        : this.frames.length - 1
      if (oldFrame !== newFrame && this.validatePose()) {
        this.clearActiveSprite()
        this.setCurrentFrameIndex(newFrame)
        this.frameLoad()
      }
    },
    frameInc () {
      const oldFrame = this.currentFrameIndex
      const newFrame = this.frames.length > this.currentFrameIndex + 1
        ? this.currentFrameIndex + 1
        : 0
      if (oldFrame !== newFrame && this.validatePose()) {
        this.clearActiveSprite()
        this.setCurrentFrameIndex(newFrame)
        this.frameLoad()
      }
    },
    frameLoad (oldFrame) {
      if (this.currentFrameIndex !== oldFrame) {
        ipcRenderer.send('Load Pose', {
          index: this.currentPose || 0,
          dmaOffset: (this.currentFrameIndex * 4) + this.frameDMAOffset,
          frameCount: this.frames.length,
          filePath: this.filePath,
          specialPoseFrameOverride: this.frameDMAOffset / 4
        })
      }
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
              }.bind(this), []),
            isFirstPose: !this.currentPose
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
    setshowUnused () {
      if ((!this.updateVram && !this.updateSprite) ||
        ((this.updateSprite || this.updateVram) &&
        confirm(poseWarning))) {
        this.showUnused = !this.showUnused
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
    },
    validatePose () {
      return (!this.updateVram && !this.updateSprite) ||
        ((this.updateSprite || this.updateVram) &&
        confirm(poseWarning))
    }
  },
  watch: {
    showUnused (newValue, oldValue) {
      this.choosePose(true)
    }
  }
}
</script>

<style>@import '../css/settings.css';</style>
