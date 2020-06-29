<template>
  <q-modal v-model="opened">
    <div class="help">
      <div class="__title">
        <h4>Shortcuts</h4>
        <button @click="toggleShowHelp">
          <icon name="times" />
        </button>
      </div>
      <div>
        <table>
          <tr>
            <th>Global Shortcuts</th>
            <th>&nbsp;</th>
          </tr>
          <tr>
            <td>ctrl + o</td>
            <td>open ROM</td>
          </tr>
          <tr>
            <td>ctrl + \</td>
            <td>show/hide settings</td>
          </tr>
          <tr>
            <td>ctrl + shift + s</td>
            <td>save current frame's VRAM and Sprites</td>
          </tr>
          <tr>
            <td>ctrl + up</td>
            <td>load previous pose</td>
          </tr>
          <tr>
            <td>ctrl + down</td>
            <td>load next pose</td>
          </tr>
          <tr>
            <td>ctrl + left</td>
            <td>load previous frame</td>
          </tr>
          <tr>
            <td>ctrl + right</td>
            <td>load next frame</td>
          </tr>
          <tr>
            <td>ctrl + m</td>
            <td>show/hide missile fins (where available)</td>
          </tr>
        </table>
        <br>
        <table>
          <tr>
            <th>Editor Shortcuts</th>
            <th>&nbsp;</th>
          </tr>
          <tr>
            <td>ctrl + s</td>
            <td>save current tile</td>
          </tr>
          <tr>
            <td>ctrl + c</td>
            <td>copy current 8x8 VRAM tile</td>
          </tr>
          <tr>
            <td>ctrl + v</td>
            <td>copy current 8x8 VRAM tile</td>
          </tr>
          <tr>
            <td>ctrl + z</td>
            <td>undo editor changes</td>
          </tr>
          <tr>
            <td>ctrl + y</td>
            <td>redo editor changes</td>
          </tr>
        </table>
        <br>
        <table>
          <tr>
            <th>VRAM Shortcuts (when focused)</th>
            <th>&nbsp;</th>
          </tr>
          <tr>
            <td>up | down | left | right</td>
            <td>select active VRAM tile for editing</td>
          </tr>
        </table>
      </div>
    </div>
  </q-modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import 'vue-awesome/icons/times'
import Icon from 'vue-awesome/components/Icon'

export default {
  components: {
    Icon
  },
  props: {},
  data () {
    return {
      opened: false
    }
  },
  computed: {
    ...mapGetters(['showHelp'])
  },
  watch: {
    showHelp (newValue) {
      this.opened = newValue
    },
    opened (newValue) {
      if (newValue !== this.showHelp) this.toggleShowHelp()
    }
  },
  methods: {
    ...mapActions(['toggleShowHelp'])
  }
}
</script>

<style scoped>
.help {
  background: white;
  padding: 5px;
  opacity: 1;
}
.help > .__title {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}
.help > .__title > h4 {
  line-height: 0;
}
.help > .__title > button {
  border: 0;
  background: none;
  align-self: flex-start;
}
.help table > tr > td {
  padding-top: 10px;
}
.help table > tr > td:last-child::before {
  margin-left: 10px;
  content: "→ ";
}
</style>
