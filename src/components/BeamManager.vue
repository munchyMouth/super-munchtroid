<template>
  <div>
    <div class="beam-type">
      <div :class="beamType === 'DEFAULT' ? '--active' : ''">
        <input
          id="default"
          v-model="beamType"
          type="radio"
          value="DEFAULT"
        >&nbsp;
        <label for="default">Beams</label>
      </div>
      <div :class="beamType === 'CHARGE_ORIGIN' ? '--active' : ''">
        <input
          id="charge-spark"
          v-model="beamType"
          type="radio"
          value="CHARGE_ORIGIN"
        >&nbsp;
        <label for="charge-spark">Beam Sparks</label>
      </div>
    </div>
    <div class="beam-manager">
      <beam-offset-buttons />
      <div class="beam-manager__settings">
        <div class="beam-manager__settings__direction">
          <div>
            <input
              id="facing-left"
              v-model="direction"
              type="radio"
              value="FACING_LEFT"
            >
            <label for="facing-left">Facing Left</label>
          </div>
          <div>
            <input
              id="facing-right"
              v-model="direction"
              type="radio"
              value="FACING_RIGHT"
            >
            <label for="facing-right">Facing Right</label>
          </div>
        </div>
        <hr>
        <div class="beam-manager__settings__action">
          <div>
            <input
              id="stationary"
              v-model="action"
              type="radio"
              value="STATIONARY"
            >
            <label for="stationary">stationary/jumping</label>
          </div>
          <div>
            <input
              id="running"
              v-model="action"
              type="radio"
              value="RUNNING"
            >
            <label for="running">running</label>
          </div>
        </div>
      </div>
    </div>
    <div class="beam-manager-globals">
      <button
        class="no-style"
        :disabled="!beamHasUpdates"
        @click="zeroBeamUpdates"
      >
        <icon
          scale="0.6"
          name="undo"
        />
        undo beams
      </button>
      <button
        :class="`no-style ${beamHasUpdates ? '--active' : ''}`"
        :disabled="!beamHasUpdates"
        @click="saveBeams"
      >
        <icon
          scale="0.75"
          name="save"
        />
        save beams
      </button>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapActions, mapGetters } from 'vuex'

import 'vue-awesome/icons/save'
import 'vue-awesome/icons/undo'
import Icon from 'vue-awesome/components/Icon'

import BeamOffsetButtons from './BeamOffsetButtons'

export default {
  components: {
    BeamOffsetButtons,
    Icon
  },
  data () {
    return {
      action: 'STATIONARY',
      beamType: 'DEFAULT',
      direction: 'FACING_LEFT'
    }
  },
  computed: {
    ...mapGetters(['beamHasUpdates', 'filePath', 'getBeamData'])
  },
  watch: {
    action (newValue) {
      this.setBeamOffsetAction(newValue)
    },
    beamType (newValue) {
      this.setBeamOffsetType(newValue)
    },
    direction (newValue) {
      this.setBeamOffsetDirection(newValue)
    }
  },
  methods: {
    ...mapActions(['setBeamOffsetAction', 'setBeamOffsetDirection', 'setBeamOffsetType', 'setLoading', 'zeroBeamUpdates']),
    saveBeams () {
      this.setLoading(true)
      ipcRenderer.send(
        'Save Beams',
        {
          filePath: this.filePath,
          beams: this.getBeamData
        })
    }
  }
}
</script>

<style scoped>
.beam-type {
  display: flex;
  border: 1px solid #ccc;
  padding: 5px;
  margin-bottom: 10px;
}
.beam-type > div {
  display: flex;
  padding: 0 5px;
}
.beam-type > div.--active {
  font-weight: bold;
}
.beam-manager {
  display: flex;
}
.beam-manager-globals {
  margin-top: 5px;
  display: flex;
  justify-content: space-between;
}
.beam-manager-globals button.--active {
  color: red;
}
.beam-manager__settings__direction {
  display: flex;
  flex-direction: column;
}
.beam-manager__settings__action div,
.beam-manager__settings__direction div {
  display: flex;
  overflow: hidden;
}
</style>
