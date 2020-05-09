<template>
  <div>
    <div class="beam-manager">
      <beam-offset-buttons />
      <div class="beam-manager__settings">
        <div class="beam-manager__settings__direction">
          <input
            id="facing-left"
            v-model="direction"
            type="radio"
            value="FACING_LEFT"
          >
          <label for="facing-left">Facing Left</label>
          <br>
          <input
            id="facing-right"
            v-model="direction"
            type="radio"
            value="FACING_RIGHT"
          >
          <label for="facing-right">Facing Right</label>
        </div>
        <hr>
        <div class="beam-manager__settings__action">
          <input
            id="stationary"
            v-model="action"
            type="radio"
            value="STATIONARY"
          >
          <label for="stationary">stationary/jumping</label>
          <br>
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
        undo all
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
        save all
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
    direction (newValue) {
      this.setBeamOffsetDirection(newValue)
    }
  },
  methods: {
    ...mapActions(['setBeamOffsetAction', 'setBeamOffsetDirection', 'setLoading', 'zeroBeamUpdates']),
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
</style>
