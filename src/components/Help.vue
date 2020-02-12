<template>
  <div class="help-wrapper"
       @click="toggleShowHelp">
    <div class="help-wrapper__background"></div>
    <div class="help">
        <div class="__title">
          <h4>Shortcuts</h4>
            <icon name="times" />
        </div>
        <div>
        <table>
          <tr><th>Global Shortcuts</th><th></th></tr>
          <tr>
            <td>ctrl + \</td>
            <td>show/hide settings</td>
          </tr>
          <tr>
            <td>ctrl + shift + s</td>
            <td>save current frame's VRAM and Sprites</td>
          </tr>
          <tr>
            <td>ctrl + left</td>
            <td>load previous frame</td>
          </tr>
          <tr>
            <td>ctrl + right</td>
            <td>load next frame</td>
          </tr>
        </table>
        <br>
        <table>
          <tr><th>Editor Shortcuts</th><th></th></tr>
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
        </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import 'vue-awesome/icons/times'
import Icon from 'vue-awesome/components/Icon'

export default {
  components: {
    Icon
  },
  computed: {
    ...mapGetters(['showHelp'])
  },
  methods: {
    ...mapActions(['toggleShowHelp'])
  }
}
</script>

<style>
.help-wrapper {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 95;
  display: flex;
  align-items: center;
  justify-content: center;
}
.help-wrapper h4 {
  padding: 0;
  margin: 0;
}
.help-wrapper__background {
  position: absolute;
  background: #ccc;
  opacity: .5;
  width: 100%;
  height: 100%;
  z-index: 95;
}
.help {
  position: absolute;
  background: white;
  width: 80%;
  height: 80%;
  padding: 5px;
  z-index: 99;
  opacity: 1;
}
.help > .__title {
  width: 100%;
  display:flex;
  justify-content: space-between;
  padding: 10px;
}
.help > .__title > button {
  border: 0;
  background: none;
  align-self: flex-start
}
.help table > tr > td {
  padding-top: 10px;
}
.help table > tr > td:last-child::before {
  margin-left: 10px;
  content: "→ ";
}
</style>
