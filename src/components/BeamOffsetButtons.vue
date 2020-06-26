<template>
  <div class="beam-offsets">
    <div class="beam-offsets__top">
      <button
        :disabled="direction === 'FACING_RIGHT'"
        :class="activeClass('left-diag-up', 8)"
        @click="setBeamOffsetIndex(8)"
      >
        &#8598;
      </button>
      <button
        :disabled="action === 'RUNNING'"
        :class="activeClass('up', direction === 'FACING_LEFT' ? 9 : 0)"
        @click="setBeamOffsetIndex(direction === 'FACING_LEFT' ? 9 : 0)"
      >
        &uarr;
      </button>
      <button
        :disabled="direction === 'FACING_LEFT'"
        :class="activeClass('right-diag-up', 1)"
        @click="setBeamOffsetIndex(1)"
      >
        &#8599;
      </button>
    </div>
    <div class="beam-offsets__middle">
      <button
        :disabled="direction === 'FACING_RIGHT'"
        :class="activeClass('left-dead-ahead', 7)"
        @click="setBeamOffsetIndex(7)"
      >
        &larr;
      </button>
      <button
        class="beam-offsets"
        :disabled="typeof beamOffset.index === 'undefined' || !beamIndexHasUpdates"
        :title="`undo ${activeDirection}`"
        @click="clearActiveBeamUpdate()"
      >
        <icon
          name="undo"
          scale="0.6"
        />
      </button>
      <button
        :disabled="direction === 'FACING_LEFT'"
        :class="activeClass('right-dead-ahead', 2)"
        @click="setBeamOffsetIndex(2)"
      >
        &rarr;
      </button>
    </div>
    <div class="beam-offsets__bottom">
      <button
        :disabled="direction === 'FACING_RIGHT'"
        :class="activeClass('left-diag-down', 6)"
        @click="setBeamOffsetIndex(6)"
      >
        &#8601;
      </button>
      <button
        :disabled="action === 'RUNNING'"
        :class="activeClass('down', direction === 'FACING_LEFT' ? 5 : 4)"
        @click="setBeamOffsetIndex(direction === 'FACING_LEFT' ? 5 : 4)"
      >
        &darr;
      </button>
      <button
        :disabled="direction === 'FACING_LEFT'"
        :class="activeClass('right-diag-down', 3)"
        @click="setBeamOffsetIndex(3)"
      >
        &#8600;
      </button>
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons/undo'
import Icon from 'vue-awesome/components/Icon'

import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    Icon
  },
  data () {
    return {
      active: undefined
    }
  },
  computed: {
    ...mapGetters(['beamIndexHasUpdates', 'missileFinsVisible', 'beamHasUpdates', 'beamOffset', 'getBeamHasUpdatesByIndex']),
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
    },
    missileFinsVisible (newValue) {
      if (newValue) this.clearBeamOffsetIndex()
    }
  },
  methods: {
    ...mapActions(['clearActiveBeamUpdate', 'clearBeamOffsetIndex', 'setActiveSprite', 'setBeamOffsetIndex']),
    activeClass (dir, i) {
      const active = (this.activeDirection === dir ? '--active' : '')
      const updated = (this.getBeamHasUpdatesByIndex(i) ? '--updated' : '')
      return active + (active && updated ? ' ' : '') + updated
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
.beam-offsets button.--updated {
  background: lightgoldenrodyellow;
}
.beam-offsets button.--active {
  background: red;
}
</style>
