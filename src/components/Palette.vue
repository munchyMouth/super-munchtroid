<template>
  <div class="palette__wrapper">
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
              <label :title="`palette no. ${ activePaletteIndex + 1 } of ${palettes ? palettes.length : 1 }`">
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
        <div class="palette__save">
          <button
            :class="`no-style ${updatePalette ? ' --active ' : ''}palette__sliders__buttons`"
            title="Save the currently loaded palette set"
            :disabled="updatePalette ? false : 'disabled'"
            @click="savePalettes()"
          >
            <i
              aria-hidden="true"
              class="q-icon material-icons"
            >save</i>
          </button>
        </div>
      </div>
      <div class="palette__sliders">
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
              @input="focused = 'red'"
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
              @input="focused = 'green'"
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
              @input="focused = 'blue'"
            />
          </div>
        </div>
        <div style="palette-globals">
          <button
            :class="`no-style palette__sliders__misc palette__sliders__buttons ${lock ? '--locked' : ''}`"
            :title="`lock sliders (${lock ? 'locked' : 'unlocked'})`"
            @click="lock = !lock"
          >
            <icon :name="lock ? 'lock' : 'lock-open'" />
          </button>
        </div>
        <div style="palette-globals">
          <button
            class="no-style palette__sliders__undo palette__sliders__buttons"
            style="color: red"
            title="undo palette change for current cycle"
            @click="resetActiveColor()"
          >
            <icon name="undo" />
          </button>
        </div>
        <div
          class="palette__sliders__buttons"
          style="border: 1px solid #ccc; padding-left: 20px; padding-right: 5px;"
        >
          <button
            class="no-style palette__sliders__copy-paste"
            style="color: black"
            title="copy current colour"
            @click="copyColor"
          >
            <icon name="copy" />
          </button>
          <button
            class="no-style palette__sliders__copy-paste"
            style="color: black"
            title="paste to current colour"
            :disabled="colorClipboard ? false : 'disabled'"
            @click="pasteColorClipboard"
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
        <q-radio
          v-model="spriteMaskColor"
          class="palette__radio--crossed"
          keep-color
          val="none"
          color="black"
        />
      </div>
    </div>

    <div class="globals">
      <div class="globals__title">
        PALETTE
      </div>
      <hr>
      <div class="globals__buttons --evenly">
        <button
          class="no-style"
          style="color: black"
          title="copy current palette"
          @click="copyPalette"
        >
          <icon name="copy" />
        </button>
        <button
          class="no-style"
          style="color: black"
          title="paste to current palette"
          :disabled="paletteClipboard.length ? false : 'disabled'"
          @click="pasteClipboardPalette"
        >
          <icon name="paste" />
        </button>
      </div>
      <hr>
      <div class="globals__buttons">
        <button
          @click="decPalette(0, 1)"
          @mousedown="decPaletteHold(0, 1)"
          @mouseup="clearPaletteHold()"
          @mouseleave="clearPaletteHold()"
        >
          -
        </button>
        <div>- R -</div>
        <button
          @click="incPalette(0, 1)"
          @mousedown="incPaletteHold(0, 1)"
          @mouseup="clearPaletteHold()"
          @mouseleave="clearPaletteHold()"
        >
          +
        </button>
      </div>
      <hr>
      <div class="globals__buttons">
        <button
          @click="decPalette(2, 3)"
          @mousedown="decPaletteHold(2, 3)"
          @mouseup="clearPaletteHold()"
          @mouseleave="clearPaletteHold()"
        >
          -
        </button>
        <div>- G -</div>
        <button
          @click="incPalette(2, 3)"
          @mousedown="incPaletteHold(2, 3)"
          @mouseup="clearPaletteHold()"
          @mouseleave="clearPaletteHold()"
        >
          +
        </button>
      </div>
      <hr>
      <div class="globals__buttons">
        <button
          @click="decPalette(4, 5)"
          @mousedown="decPaletteHold(4, 5)"
          @mouseup="clearPaletteHold()"
          @mouseleave="clearPaletteHold()"
        >
          -
        </button>
        <div>- B -</div>
        <button
          @click="incPalette(4, 5)"
          @mousedown="incPaletteHold(4, 5)"
          @mouseup="clearPaletteHold()"
          @mouseleave="clearPaletteHold()"
        >
          +
        </button>
      </div>
      <hr>
      <div class="globals__buttons">
        <button
          @click="decWholePalette()"
          @mousedown="decWholePaletteHold()"
          @mouseup="clearPaletteHold()"
          @mouseleave="clearPaletteHold()"
        >
          -
        </button>
        <div> RGB </div>
        <button
          @click="incWholePalette()"
          @mousedown="incWholePaletteHold()"
          @mouseup="clearPaletteHold()"
          @mouseleave="clearPaletteHold()"
        >
          +
        </button>
      </div>
      <hr>
      <button
        class="globals__title"
        @click="resetActiveCycle"
      >
        RESET
      </button>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { clone } from 'lodash'
import { mapGetters, mapActions } from 'vuex'

import 'vue-awesome/icons/caret-down'
import 'vue-awesome/icons/caret-up'
import 'vue-awesome/icons/copy'
import 'vue-awesome/icons/paste'
import 'vue-awesome/icons/undo'
import 'vue-awesome/icons/lock'
import 'vue-awesome/icons/lock-open'
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
      focused: undefined,
      initialisingPalette: true, // prevents updates being fired on palette defaults
      old: {
        RR: 0,
        GG: 0,
        BB: 0
      },
      RR: 0,
      GG: 0,
      BB: 0,
      spriteMaskColor: 'blue',
      lock: false,
      paletteHold: undefined
    }
  },
  computed: {
    ...mapGetters([
      'activePaletteColor',
      'activePaletteIndex',
      'currentPalette',
      'defaultActiveColor',
      'defaultActiveCycle',
      'filePath',
      'getActivePaletteChunked',
      'getActivePaletteInPalettes',
      'getActiveColorFromPaletteInPalettes',
      'paletteClipboard',
      'palettes',
      'palettesDefault',
      'refreshPalette',
      'colorClipboard',
      'updatePalette'
    ]),
    currentColor () {
      return (this.hasCurrentPalette)
        ? this.getActivePaletteChunked(this.activeColorIndex)
        : undefined
    },
    hasCurrentPalette () {
      return this.getActivePaletteInPalettes &&
        this.getActivePaletteInPalettes.hasOwnProperty('palette')
    }
  },
  watch: {
    activePaletteIndex (newVal) {
      this.activePalette = this.getActivePaletteInPalettes.palette
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
      this.initialisingPalette = true
    },
    refreshPalette (newVal) {
      this.activePalette = this.getActivePaletteInPalettes.palette
      this.initialisingPalette = true
    },
    RR (newVal, oldVal) {
      this.handleLockedColors('red', ['GG', 'BB'], oldVal, newVal)
      this.setCompleteHexColor('RR', newVal)
    },
    GG (newVal, oldVal) {
      this.handleLockedColors('green', ['RR', 'BB'], oldVal, newVal)
      this.setCompleteHexColor('GG', newVal)
    },
    BB (newVal, oldVal) {
      this.handleLockedColors('blue', ['RR', 'GG'], oldVal, newVal)
      this.setCompleteHexColor('BB', newVal)
    },
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
      'setColorClipboard',
      'setPaletteClipboard',
      'setPaletteColorChunk',
      'setSpriteMaskColor'
    ]),
    copyColor () {
      this.setColorClipboard(
        this.getActivePaletteInPalettes.palette[this.activeColorIndex || 0])
      this.$nextTick(() => {
        this.$q.notify({
          message: 'color copied',
          position: 'bottom',
          color: 'positive',
          timeout: 1000
        })
      })
    },
    copyPalette () {
      this.setPaletteClipboard(clone(this.activePalette))
      this.$nextTick(() => {
        this.$q.notify({
          message: 'palette copied',
          position: 'bottom',
          color: 'positive',
          timeout: 1000
        })
      })
    },
    currentPaletteDown () {
      if (this.palettes.length > 1) {
        this.setActivePaletteIndex(
          this.activePaletteIndex - 1 >= 0
            ? this.activePaletteIndex - 1
            : this.palettes.length - 1)
      }
    },
    currentPaletteUp (evt) {
      if (this.palettes.length > 1) {
        this.setActivePaletteIndex(
          this.activePaletteIndex + 1 < this.palettes.length
            ? this.activePaletteIndex + 1
            : 0)
      }
    },
    formattedHexColor (col) {
      const c = col.toString(16)
      return c.length < 2 ? `0${c}` : c
    },
    handleLockedColors (color, otherColors, oldVal, newVal, v) {
      if (this.lock && color === this.focused) {
        otherColors.forEach(function (c) {
          if (oldVal > newVal && this[c] > 0) {
            v = this[c] - (oldVal - newVal)
            if (v >= 0) this[c] = v
          } else if (oldVal < newVal && this[c] < 255) {
            v = this[c] + (newVal - oldVal)
            if (v <= 255) this[c] = v
          }
        }.bind(this))
      }
    },
    decPalette (hi, lo) {
      this.lock = false
      const p = clone(this.activePalette)
      this.setActivePalette(
        p.map((it, j) => {
          let col = it[hi + 1] + it[lo + 1]
          if (col !== '00') {
            col = (parseInt(col, 16) - 1).toString(16)
            col = col.length === 1 ? '0' + col : col
            return it
              .split('')
              .map((char, i) => (i === hi + 1 ? col[0] : (i === lo + 1 ? col[1] : char)))
              .toString()
              .replace(/,/g, '')
          } else return it
        }))
    },
    incPalette (hi, lo) {
      this.lock = false
      const p = clone(this.activePalette)
      this.setActivePalette(
        p.map((it, j) => {
          let col = it[hi + 1] + it[lo + 1]
          if (col !== 'ff') {
            col = (parseInt(col, 16) + 1).toString(16)
            col = col.length === 1 ? '0' + col : col
            return it
              .split('')
              .map((char, i) => (i === hi + 1 ? col[0] : (i === lo + 1 ? col[1] : char)))
              .toString()
              .replace(/,/g, '')
          } else return it
        }))
    },
    decWholePalette () {
      this.lock = false
      const p = clone(this.activePalette)
      this.setActivePalette(
        p.map((it, j) => {
          for (let j = 0; j < 5; j += 2) {
            let col = it[j + 1] + it[j + 2]
            if (col !== '00') {
              col = (parseInt(col, 16) - 1).toString(16)
              col = col.length === 1 ? '0' + col : col
              it = it
                .split('')
                .map((char, i) => (i === j + 1 ? col[0] : (i === j + 2 ? col[1] : char)))
                .toString()
                .replace(/,/g, '')
            }
          }
          return it
        }))
    },
    incWholePalette () {
      this.lock = false
      const p = clone(this.activePalette)
      this.setActivePalette(
        p.map((it) => {
          for (let j = 0; j < 5; j += 2) {
            let col = it[j + 1] + it[j + 2]
            if (col !== 'ff') {
              col = (parseInt(col, 16) + 1).toString(16)
              col = col.length === 1 ? '0' + col : col
              it = it
                .split('')
                .map((char, i) => (i === j + 1 ? col[0] : (i === j + 2 ? col[1] : char)))
                .toString()
                .replace(/,/g, '')
            }
          }
          return it
        }))
    },
    decPaletteHold (hi, lo) {
      this.paletteHold = setInterval(function () {
        this.decPalette(hi, lo)
      }.bind(this), 50)
    },
    decWholePaletteHold () {
      this.paletteHold = setInterval(function () {
        this.decWholePalette()
      }.bind(this), 50)
    },
    incWholePaletteHold () {
      this.paletteHold = setInterval(function () {
        this.incWholePalette()
      }.bind(this), 50)
    },
    incPaletteHold (hi, lo) {
      this.paletteHold = setInterval(function () {
        this.incPalette(hi, lo)
      }.bind(this), 50)
    },
    clearPaletteHold () {
      clearInterval(this.paletteHold)
    },
    pasteColorClipboard () {
      const p = clone(this.getActivePaletteInPalettes.palette)
      p[this.activeColorIndex || 0] = this.colorClipboard
      this.setActivePalette(p)
      this.$nextTick(() => {
        this.$q.notify({
          message: 'color pasted',
          position: 'bottom',
          color: 'positive',
          timeout: 1000
        })
      })
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
      this.lock = false
      const col =
        this.defaultActiveColor(this.activeColorIndex)
          .replace('#', '')
          .match(/[0-9A-F]{2}/gi)
          .map(it => parseInt(it, 16))
      this.RR = col[0]
      this.GG = col[1]
      this.BB = col[2]
    },
    resetActiveCycle () {
      this.setActivePalette(clone(this.defaultActiveCycle))
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
