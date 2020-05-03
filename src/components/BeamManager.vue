<template>
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
</template>

<script>
import { mapActions } from 'vuex'
import BeamOffsetButtons from './BeamOffsetButtons'

export default {
  components: {
    BeamOffsetButtons
  },
  data () {
    return {
      action: 'STATIONARY',
      direction: 'FACING_LEFT'
    }
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
    ...mapActions(['setBeamOffsetAction', 'setBeamOffsetDirection'])
  }
}
</script>

<style scoped>
.beam-manager {
  display: flex;

}
</style>
