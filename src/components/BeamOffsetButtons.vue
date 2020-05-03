<template>
  <div class="beam-offsets">
    <div class="beam-offsets__top">
      <button
        :disabled="direction === 'FACING_RIGHT'"
        :class="activeClass('left-diag-up')"
        @click="setBeamOffsetIndex(8)"
      >
        &#8598;
      </button>
      <button
        :disabled="action === 'RUNNING'"
        :class="activeClass('up')"
        @click="setBeamOffsetIndex(direction === 'FACING_LEFT' ? 9 : 0)"
      >
        &uarr;
      </button>
      <button
        :disabled="direction === 'FACING_LEFT'"
        :class="activeClass('right-diag-up')"
        @click="setBeamOffsetIndex(1)"
      >
        &#8599;
      </button>
    </div>
    <div class="beam-offsets__middle">
      <button
        :disabled="direction === 'FACING_RIGHT'"
        :class="activeClass('left-dead-ahead')"
        @click="setBeamOffsetIndex(7)"
      >
        &larr;
      </button>
      <button disabled>
        &nbsp;
      </button>
      <button
        :disabled="direction === 'FACING_LEFT'"
        :class="activeClass('right-dead-ahead')"
        @click="setBeamOffsetIndex(2)"
      >
        &rarr;
      </button>
    </div>
    <div class="beam-offsets__bottom">
      <button
        :disabled="direction === 'FACING_RIGHT'"
        :class="activeClass('left-diag-down')"
        @click="setBeamOffsetIndex(6)"
      >
        &#8601;
      </button>
      <button
        :disabled="action === 'RUNNING'"
        :class="activeClass('down')"
        @click="setBeamOffsetIndex(direction === 'FACING_LEFT' ? 5 : 4)"
      >
        &darr;
      </button>
      <button
        :disabled="direction === 'FACING_LEFT'"
        :class="activeClass('right-diag-down')"
        @click="setBeamOffsetIndex(3)"
      >
        &#8600;
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  data () {
    return {
      active: undefined
    }
  },
  computed: {
    ...mapGetters(['beamOffset']),
    action () { return this.beamOffset.action },
    direction () { return this.beamOffset.direction },
    index () { return this.beamOffset.index },
    activeDirection () {
      switch (this.index) {
        case 0: return 'up'
        case 1: return 'right-diag-up'
        case 2: return 'right-dead-ahead'
        case 3: return 'right-diag-down'
        case 4: return 'down'
        case 5: return 'down'
        case 6: return 'left-diag-down'
        case 7: return 'left-dead-ahead'
        case 8: return 'left-diag-up'
        case 9: return 'up'
        default: return ''
      }
    }
  },
  watch: {
    action (newValue) {
      if (newValue === 'RUNNING' &&
          (this.index === 0 ||
            this.index === 4 ||
            this.index === 5 ||
            this.index === 9)) this.clearBeamOffsetIndex()
    },
    direction (newValue) {
      if (newValue === 'FACING_LEFT') {
        switch (this.index) {
          case 0: this.setBeamOffsetIndex(9); break
          case 4: this.setBeamOffsetIndex(5); break
          default: this.clearBeamOffsetIndex()
        }
      } else {
        switch (this.index) {
          case 9: this.setBeamOffsetIndex(0); break
          case 5: this.setBeamOffsetIndex(4); break
          default: this.clearBeamOffsetIndex()
        }
      }
    },
    index (newValue) {
      if (typeof newValue !== 'undefined') this.setActiveSprite()
    }
  },
  methods: {
    ...mapActions(['clearBeamOffsetIndex', 'setActiveSprite', 'setBeamOffsetIndex']),
    activeClass (dir) {
      return this.activeDirection === dir ? '--active' : ''
    }
  }
}
</script>

<style scoped>
.beam-offsets > div {
  display: flex;
  width: 100px;
  height: 30px;
  align-content: center;
}
.beam-offsets button {
  width: 30px;
  height: 30px;
}
.beam-offsets button[disabled] {
  cursor: default !important;
}
.beam-offsets button.--active {
  background: red;
}
</style>
