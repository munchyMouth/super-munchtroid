<template>
  <div class="palette">
    <div>
      <div class="palette__current-colors">
        <div class="no-style"
            :style="`background: ${getActiveColorFromPaletteInPalettes('left')}`">
        </div>
        <div class="no-style"
            :style="`background: ${getActiveColorFromPaletteInPalettes('right')}`"></div>
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
        <div class="palette__settings__colors" v-if="hasCurrentPalette">
          <button v-for="(color, i) in activePalette"
                  :class="`no-style ${i === activeColorIndex ? '--active' : ''}`"
                  :style="`background: ${color}`"
                  :key="i"
                  @click="setAnActivePaletteColor($event, i)"
                  @contextmenu="setAnActivePaletteColor($event, i)">
            &nbsp;
          </button>
          <div class="palette__settings__misc"
           title="Active Palette Index">
            <label>
              <i aria-hidden="true" class="q-icon material-icons">palette</i>
              {{ activePaletteIndex + 1 }} /
              {{ palettes ? palettes.length : 1 }}
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="palette__sliders">
      <div>
        <button class="no-style palette__sliders__save --active"
                title="Save ALL of the currently loaded palette(s)"
                @click="savePalettes()"
                v-if="updatePalette">
          <i aria-hidden="true"
              class="q-icon material-icons">save</i>
        </button>
        <!-- Show a functionally useless button for the user after save. It's a human thing! -->
        <button class="no-style palette__sliders__save"
                title="Save ALL of the currently loaded palette(s)"
                v-else>
          <i aria-hidden="true"
              class="q-icon material-icons">save</i>
        </button>
      </div>
      <div>
        <div>
          <label>R</label>
          <q-slider
            class="palette__sliders__slider"
            v-model="RR"
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
            class="palette__sliders__slider"
            v-model="GG"
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
            class="palette__sliders__slider"
            v-model="BB"
            color="blue"
            :min="0"
            :max="255"
            label
            :label-value="formattedHexColor(BB)"
          />
        </div>
      </div>
      <div>
        <button class="no-style palette__sliders__undo"
                style="color: red"
                @click="resetActiveColor()"
                title="reset to saved version of palette">
          <icon name="undo"/>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { cloneDeep } from 'lodash'
import { mapGetters, mapActions } from 'vuex'

import 'vue-awesome/icons/caret-down'
import 'vue-awesome/icons/caret-up'
import 'vue-awesome/icons/undo'
import Icon from 'vue-awesome/components/Icon'

export default {
  name: 'palette',
  components: {
    Icon
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
  data () {
    return {
      activeColorIndex: 0,
      activePalette: [],
      defaultPalette: undefined,
      initialisingPalette: true, // prevents updates being fired on palette defaults
      RR: 0,
      GG: 0,
      BB: 0
    }
  },
  methods: {
    ...mapActions([
      'clearPalettesUpdateFlag',
      'setLoading',
      'setCurrentPalette',
      'setActivePaletteColor',
      'setActivePaletteIndex',
      'setPaletteColorChunk'
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
        isInitialising: this.initialisingPalette })
      this.activePalette = this.getActivePaletteInPalettes.palette
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
    RR (newVal) { this.setCompleteHexColor('RR', newVal) },
    GG (newVal) { this.setCompleteHexColor('GG', newVal) },
    BB (newVal) { this.setCompleteHexColor('BB', newVal) }
  },
  updated () {
    this.initialisingPalette = false
  }
}
</script>

<style>@import '../css/palette.css';</style>
