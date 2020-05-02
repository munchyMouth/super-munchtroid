<template>
  <div class="palette">
    <div>
      <div class="palette__current-colors">
        <div
          class="no-style"
          :style="`background: ${getActiveColorFromPaletteInPalettes('left')}`"
        >
          &nbsp;
        </div>
        <div
          class="no-style"
          :style="`background: ${getActiveColorFromPaletteInPalettes('right')}`"
        >
          &nbsp;
        </div>
      </div>
      <div class="palette__settings">
        <div class="palette__settings__16">
          <button @click="currentPaletteUp">
            <icon name="caret-up" />
          </button>
          <button @click="currentPaletteDown">
            <icon name="caret-down" />
          </button>
        </div>
        <div
          v-if="hasCurrentPalette"
          class="palette__settings__colors"
        >
          <button
            v-for="(color, i) in activePalette"
            :key="i"
            :class="`no-style ${i === activeColorIndex ? '--active' : ''}`"
            :style="`background: ${color}`"
            @click="setAnActivePaletteColor($event, i)"
            @contextmenu="setAnActivePaletteColor($event, i)"
          >
            &nbsp;
          </button>
          <div
            class="palette__settings__misc"
            title="Active Palette Index"
          >
            <label>
              <i
                aria-hidden="true"
                class="q-icon material-icons"
              >palette</i>
              {{ activePaletteIndex + 1 }} /
              {{ palettes ? palettes.length : 1 }}
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="palette__sliders">
      <div>
        <button
          v-if="updatePalette"
          class="no-style palette__sliders__save --active palette__sliders__buttons"
          title="Save ALL of the currently loaded palette(s)"
          @click="savePalettes()"
        >
          <i
            aria-hidden="true"
            class="q-icon material-icons"
          >save</i>
        </button>
        <!-- Show a functionally useless button for the user after save. It's a human thing! -->
        <button
          v-else
          class="no-style palette__sliders__save palette__sliders__buttons"
          title="Save ALL of the currently loaded palette(s)"
        >
          <i
            aria-hidden="true"
            class="q-icon material-icons"
          >save</i>
        </button>
      </div>
      <div>
        <div>
          <label>R</label>
          <q-slider
            v-model="RR"
            class="palette__sliders__slider"
            color="red"
            :min="0"
            :max="255"
            label
            :label-value="formattedHexColor(RR)"
          />
        </div>
        <div>
          <label>G</label>
          <q-slider
            v-model="GG"
            class="palette__sliders__slider"
            color="green"
            :min="0"
            :max="255"
            label
            :label-value="formattedHexColor(GG)"
          />
        </div>
        <div>
          <label>B</label>
          <q-slider
            v-model="BB"
            class="palette__sliders__slider"
            color="blue"
            :min="0"
            :max="255"
            label
            :label-value="formattedHexColor(BB)"
          />
        </div>
      </div>
      <div>
        <button
          class="no-style palette__sliders__undo palette__sliders__buttons"
          style="color: red"
          title="reset to saved version of palette"
          @click="resetActiveColor()"
        >
          <icon name="undo" />
        </button>
      </div>
      <div class="palette__sliders__buttons">
        <button
          class="no-style palette__sliders__copy-paste"
          style="color: black"
          title="copy current palette"
          @click="setPaletteClipboard(activePalette)"
        >
          <icon name="copy" />
        </button>
        <button
          class="no-style palette__sliders__copy-paste"
          style="color: black"
          title="paste to current palette"
          :disabled="paletteClipboard.length ? false : 'disabled'"
          @click="pasteClipboardPalette"
        >
          <icon name="paste" />
        </button>
      </div>
    </div>
    <div class="palette__sprite-mode">
      Sprite Mode Mask Color:
      <q-radio
        v-model="spriteMaskColor"
        keep-color
        val="blue"
        color="blue"
      />
      <q-radio
        v-model="spriteMaskColor"
        keep-color
        val="green"
        color="green"
      />
      <q-radio
        v-model="spriteMaskColor"
        keep-color
        val="red"
        color="red"
      />
      <q-radio
        v-model="spriteMaskColor"
        keep-color
        val="yellow"
        color="yellow"
      />
      <q-radio
        v-model="spriteMaskColor"
        keep-color
        val="purple"
        color="purple"
      />
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { clone, cloneDeep } from 'lodash'
import { mapGetters, mapActions } from 'vuex'

import 'vue-awesome/icons/caret-down'
import 'vue-awesome/icons/caret-up'
import 'vue-awesome/icons/copy'
import 'vue-awesome/icons/paste'
import 'vue-awesome/icons/undo'
import Icon from 'vue-awesome/components/Icon'

export default {
  name: 'palette',
  components: {
    Icon
  },
  data () {
    return {
      activeColorIndex: 0,
      activePalette: [],
      defaultPalette: undefined,
      initialisingPalette: true, // prevents updates being fired on palette defaults
      RR: 0,
      GG: 0,
      BB: 0,
      spriteMaskColor: 'blue'
    }
  },
  computed: {
    ...mapGetters([
      'activePaletteColor',
      'activePaletteIndex',
      'currentPalette',
      'filePath',
      'getActivePaletteChunked',
      'getActivePaletteInPalettes',
      'getActiveColorFromPaletteInPalettes',
      'paletteClipboard',
      'palettes',
      'refreshPalette',
      'updatePalette'
    ]),
    currentColor () {
      return (this.hasCurrentPalette)
        ? this.getActivePaletteChunked(this.activeColorIndex)
        : undefined
    },
    defaultActiveColor () {
      return this.defaultPalette[this.activeColorIndex]
    },
    hasCurrentPalette () {
      return this.getActivePaletteInPalettes &&
        this.getActivePaletteInPalettes.hasOwnProperty('palette')
    }
  },
  watch: {
    activePaletteIndex (newVal) {
      this.activePalette = this.getActivePaletteInPalettes.palette
      this.defaultPalette = cloneDeep(this.activePalette)
      this.initialisingPalette = true
    },
    currentColor (newVal) {
      this.initialisingPalette = true
      this.RR = newVal[0]
      this.GG = newVal[1]
      this.BB = newVal[2]
    },
    palettes (newVal) {
      this.activePalette = this.getActivePaletteInPalettes.palette
      this.defaultPalette = cloneDeep(this.activePalette)
      this.initialisingPalette = true
    },
    refreshPalette (newVal) {
      this.activePalette = this.getActivePaletteInPalettes.palette
      this.defaultPalette = cloneDeep(this.activePalette)
      this.initialisingPalette = true
    },
    RR (newVal) { this.setCompleteHexColor('RR', newVal) },
    GG (newVal) { this.setCompleteHexColor('GG', newVal) },
    BB (newVal) { this.setCompleteHexColor('BB', newVal) },
    spriteMaskColor (newVal) { this.setSpriteMaskColor(newVal) }
  },
  updated () {
    this.initialisingPalette = false
  },
  methods: {
    ...mapActions([
      'clearPalettesUpdateFlag',
      'setLoading',
      'setCurrentPalette',
      'setActivePalette',
      'setActivePaletteColor',
      'setActivePaletteIndex',
      'setPaletteClipboard',
      'setPaletteColorChunk',
      'setSpriteMaskColor'
    ]),
    currentPaletteDown () {
      this.setActivePaletteIndex(
        this.activePaletteIndex - 1 >= 0
          ? this.activePaletteIndex - 1
          : this.palettes.length - 1)
    },
    currentPaletteUp (evt) {
      this.setActivePaletteIndex(
        this.activePaletteIndex + 1 < this.palettes.length
          ? this.activePaletteIndex + 1
          : 0)
    },
    formattedHexColor (col) {
      const c = col.toString(16)
      return c.length < 2 ? `0${c}` : c
    },
    pasteClipboardPalette () {
      this.setActivePalette(clone(this.paletteClipboard))
      this.$nextTick(() => {
        this.$q.notify({
          message: 'palette pasted',
          position: 'bottom',
          color: 'positive',
          timeout: 1000
        })
      })
    },
    resetActiveColor () {
      const col =
        this.defaultActiveColor
          .replace('#', '')
          .match(/[0-9A-F]{2}/gi)
          .map(it => parseInt(it, 16))
      this.RR = col[0]
      this.GG = col[1]
      this.BB = col[2]
    },
    savePalettes () {
      this.setLoading(true)
      ipcRenderer.send('Save Palettes', {
        filePath: this.filePath,
        palettes: this.palettes.filter((it, index) => {
          if (it._updated) {
            this.clearPalettesUpdateFlag({ index })
            return true
          }
        })
      })
    },
    setAnActivePaletteColor (evt, i) {
      this.setActivePaletteColor({
        leftRight: evt.button < 1 ? 'left' : 'right',
        colorIndex: i
      })
      this.activeColorIndex = i
      evt.preventDefault()
    },
    setCompleteHexColor (key, newColor) {
      this.setPaletteColorChunk({
        activeColorIndex: this.activeColorIndex,
        color: ['RR', 'GG', 'BB'].reduce(function (str, it) {
          const color = (it === key ? newColor : this[it]).toString(16)
          return str + (color.length === 1 ? '0' + color : color)
        }.bind(this), '#'),
        isInitialising: this.initialisingPalette
      })
      this.activePalette = this.getActivePaletteInPalettes.palette
    }
  }
}
</script>

<style>
@import "../css/palette.css";
</style>
