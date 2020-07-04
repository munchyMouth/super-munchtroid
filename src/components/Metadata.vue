<template>
  <div class="metadata">
    <div class="disclaimer">
      <strong>Disclaimer:</strong>
      Messing with this section can seriously break your ROM. Make sure you backup before changing anything!
    </div>
    <controls
      :dma="dma"
      :frame="frame"
      @paste="paste($event)"
    />
    <div class="sub-heading">
      VRAM
    </div>
    <div class="metadata__head">
      <label>Frame Prog Table<span class="metadata__flag">(PC)</span></label>
      <strong>
        <input
          v-model="vram._address"
          type="text"
          disabled
        >
      </strong>
    </div>
    <div class="top-bottom">
      <div>
        <div>&nbsp;&nbsp;&nbsp;&#8601;</div>
        <label>Top DMA</label>
        <div>
          <div>
            table no.
            <strong>
              <input
                v-model="dma.top.table"
                class="dma"
                type="text"
                maxlength="2"
              >
            </strong>
          </div>
          <div>
            entry no.
            <strong>
              <input
                v-model="dma.top.entry"
                class="dma"
                type="text"
                maxlength="2"
              >
            </strong>
          </div>
          <div>&darr;</div>
        </div>
        <label>DMA<span class="metadata__flag">(PC)</span></label>
        <strong>
          <input
            v-model="vram.top._address"
            type="text"
            disabled
          >
        </strong>
        <div>
          <div>&darr;</div>
          <label>Value
            <span class="metadata__flag">
              <button
                style="color: blue"
                class="no-style"
                @click="loTop = !loTop"
              >
                ({{ loTop ? 'Lo' : 'PC' }})
              </button>
            </span>
          </label>
          <strong>
            <input
              v-model="vram.top.parts[loTop ? '_loAddress' : '_address']"
              class="--lo"
              type="text"
              disabled
            >
          </strong>
        </div>
        <div>&nbsp;&nbsp;&nbsp;&#8600;</div>
      </div>

      <div>
        <div>&#8600;&nbsp;&nbsp;&nbsp;</div>
        <label>Bot DMA</label>
        <div>
          <div>
            table no.
            <strong>
              <input
                v-model="dma.bottom.table"
                class="dma"
                type="text"
                maxlength="2"
              >
            </strong>
          </div>
          <div>
            entry no.
            <strong>
              <input
                v-model="dma.bottom.entry"
                class="dma"
                type="text"
                maxlength="2"
              >
            </strong>
          </div>
          <div>&darr;</div>
        </div>
        <label>DMA<span class="metadata__flag">(PC)</span></label>
        <strong>
          <input
            v-model="vram.bottom._address"
            type="text"
            disabled
          >
        </strong>
        <div>
          <div>&darr;</div>
          <label>Value
            <span class="metadata__flag">
              <button
                style="color: blue"
                class="no-style"
                @click="loBot = !loBot"
              >
                ({{ loBot ? 'Lo' : 'PC' }})
              </button>
            </span>
          </label>
          <strong>
            <input
              v-model="vram.bottom.parts[loBot ? '_loAddress' : '_address']"
              class="--lo"
              type="text"
              disabled
            >
          </strong>
        </div>
        <div>&#8601;&nbsp;&nbsp;&nbsp;</div>
      </div>
    </div>
    <br>
    <div>
      <div class="sub-heading">
        Tilemaps
      </div>
      <div class="top-bottom">
        <div>
          <div>&nbsp;&nbsp;&nbsp;&#8601;</div>
          <div>
            <label>Frame top<span class="metadata__flag">(PC)</span></label>
            <strong>
              <input
                v-model="tileMaps.top._address"
                type="text"
                disabled
              >
            </strong>
          </div>
          <div>&darr;</div>
          <div>
            <label>points to<span class="metadata__flag">(Lo)</span></label>
            <strong>
              $92:
              <input
                v-model="frame.top"
                type="text"
                class="tilemap-pointer-value"
                maxlength="4"
              >
            </strong>
          </div>
          <label style="margin-top:5px;"><span class="metadata__flag">(PC)</span></label>
          <input
            v-model="frame.topLong"
            disabled="disabled"
          >
          <div>&nbsp;&nbsp;&nbsp;&#8600;</div>
        </div>
        <div>
          <div>&#8600;&nbsp;&nbsp;&nbsp;</div>
          <div>
            <label>Frame bot<span class="metadata__flag">(PC)</span></label>
            <strong>
              <input
                v-model="tileMaps.bottom._address"
                type="text"
                disabled
              >
            </strong>
          </div>
          <div>&darr;</div>
          <div>
            <label>points to<span class="metadata__flag">(Lo)</span></label>
            <strong>
              $92:
              <input
                v-model="frame.bottom"
                type="text"
                class="tilemap-pointer-value"
                maxlength="4"
              >
            </strong>
          </div>
          <label style="margin-top:5px;"><span class="metadata__flag">(PC)</span></label>
          <input
            v-model="frame.bottomLong"
            disabled="disabled"
          >
          <div>&#8601;&nbsp;&nbsp;&nbsp;</div>
        </div>
      </div>
      <button @click="repoint">
        Repoint!
      </button>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { clone } from 'lodash'
import { mapActions, mapGetters } from 'vuex'
import Controls from './MetadataControls'

export default {
  name: 'metadata',
  components: {
    Controls
  },
  props: ['vram'],
  data () {
    return {
      dma: {
        top: {
          table: '',
          entry: ''
        },
        bottom: {
          table: '',
          entry: ''
        }
      },
      frame: {
        top: '',
        topLong: '',
        bottom: '',
        BottomLong: ''
      },
      loTop: true,
      loBot: true

    }
  },
  computed: {
    ...mapGetters(['calculateDMAFrameIndex', 'currentFrameIndex', 'filePath', 'tileMaps'])
  },
  watch: {
    vram (newValue) {
      this.injectROMMetaData()
    }
  },
  mounted () {
    this.injectROMMetaData()
  },
  methods: {
    ...mapActions(['confirm', 'setLoading']),
    injectROMMetaData () {
      this.dma.top = clone(this.vram._dma.top)
      this.dma.bottom = clone(this.vram._dma.bottom)
      this.frame.top = this.tileMaps.top.tileMap._addressShort
      this.frame.bottom = this.tileMaps.bottom.tileMap._addressShort
      this.frame.topLong = this.tileMaps.top.tileMap._address
      this.frame.bottomLong = this.tileMaps.bottom.tileMap._address
    },
    paste ({ half, dma, frame }) {
      this.dma[half] = clone(dma[half])
      this.frame[half] = frame[half]
    },
    repoint () {
      if (this.validateFields()) {
        this.confirm({
          message: 'All unsaved changes will be lost! Are you absolutely sure you wish to repoint?',
          callback: function (ok) {
            if (ok) {
              ipcRenderer.send(
                'Repoint Frame',
                {
                  filePath: this.filePath,
                  dma: {
                    index: this.calculateDMAFrameIndex,
                    _id: this.vram._id,
                    value: [this.dma.top.table, this.dma.top.entry, this.dma.bottom.table, this.dma.bottom.entry]
                  },
                  frame: {
                    top: {
                      _id: this.tileMaps.top._id,
                      value: [this.frame.top.substring(2), this.frame.top.substring(0, 2)]
                    },
                    bottom: {
                      _id: this.tileMaps.bottom._id,
                      value: [this.frame.bottom.substring(2), this.frame.bottom.substring(0, 2)]
                    }
                  }
                }
              )
            }
          }.bind(this)
        })
      } else {
        this.$q.notify({
          message: 'Repointing failed: Invalid value(s) detected. check your inputs!',
          position: 'bottom',
          color: 'negative',
          timeout: 1000
        })
      }
    },
    validateFields () {
      const dma = [
        this.dma.bottom.entry,
        this.dma.bottom.table,
        this.dma.top.entry,
        this.dma.top.table
      ]
      for (let item of dma) {
        if (!(/^[0-9A-F]{2}$/i.test(item))) return false
      }
      const frame = [
        this.frame.top,
        this.frame.bottom
      ]
      for (let item of frame) {
        if (!(/^[0-9A-F]{4}$/i.test(item))) return false
      }
      return true
    }
  }
}
</script>

<style>
/* CSS */
.metadata {
  text-align: center;
}
.sub-heading {
  font-weight: bold;
  font-size: 16px;
  padding-bottom: 15px;
}
.metadata input:disabled {
  display: inline;
  cursor: text !important;
  width: 60px;
}
.metadata input:disabled.--lo {
  width: 75px;
}
.metadata__head {
  display: flex;
  flex-direction: column;
}
label {
  display: flex;
  justify-content: center;
}
.metadata__flag {
  top: 0px;
  font-size: 8px;
  font-weight: bold;
  align-content: flex-start;
}
.top-bottom {
  display: flex;
  justify-content: space-evenly;
}
.parts {
  display: flex;
  justify-content: space-between;
}
.metadata input.tilemap-pointer-value {
  width: 45px;
}
input.dma {
  width: 25px !important;
}
.disclaimer {
  border: 1px solid Yellow;
  background: lightgoldenrodyellow;
  padding: 5px;
  font-size: 11px;
  margin-bottom: 10px;
}
</style>
