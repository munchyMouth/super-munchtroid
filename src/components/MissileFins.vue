<template>
  <div>
    <select
      ref="missileFins"
      v-model="selected"
      class="settings__dropdown"
    >
      <option
        v-for="(pose, i) in filteredPoses"
        :key="i"
        :value="pose"
        :class="pose.unused ? '--unused' : ''"
      >
        {{ pose.name }}
      </option>
    </select>
    <button @click="loadPose">
      Load pose with fins
    </button>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'
import { mapGetters } from 'vuex'

export default {
  props: ['poses'],
  data () {
    return {
      selected: {},
      filteredPoses: []
    }
  },
  computed: {
    ...mapGetters(['currentPose', 'settings'])
  },
  mounted () {
    this.filteredPoses = this.poses.filter((it) => it.hasOwnProperty('missileFins'))
  },
  methods: {
    loadPose () {
      console.log('EMIT', this.selected)
    }
  },
  watch: {
    selected (newVal) {
      if (newVal) this.$emit('request', { entry: cloneDeep(this.selected) })
    }
  }
}
</script>

<style scoped>
</style>
