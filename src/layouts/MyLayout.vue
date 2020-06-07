<template>
  <q-layout
    class="munch-layout"
    view="lHh Lpr lFf"
  >
    <help-dialog v-show="showHelp" />
    <confirm-dialog />
    <q-layout-header v-if="filePath">
      <div
        v-show="showHelp"
        class="help-back"
        @click="toggleShowHelp"
      >
        &nbsp;
      </div>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          aria-label="Settings"
          @click="toggleLayoutDrawerOpen()"
        >
          <q-icon name="settings" />
        </q-btn>
        <q-toolbar-title>
          <strong>
            {{ activeSpriteAddress ? 'Sprite Mode' : 'Editor Mode' }}
          </strong>
          <div slot="subtitle">
            {{
              activeSpriteAddress
                ? 'Left-click on VRAM reassigns current sprite; right-click on VRAM opens a new tile in the editor'
                : 'Left-click on VRAM will open a new tile in the editor'
            }}
          </div>
        </q-toolbar-title>
        <button
          class="no-style show-vram"
          @click="toggleVram"
        >
          <strong>VRAM</strong>&nbsp;
          <icon :name="showVram ? 'eye' : 'eye-slash'" />
        </button>
      </q-toolbar>
    </q-layout-header>

    <q-layout-drawer
      v-model="layoutDrawerOpen"
      :content-class="$q.theme === 'mat' ? 'bg-grey-2' : null"
    >
      <template v-if="!hasError && romLoaded">
        <div class="settings__tab">
          <button
            :class="`no-style ${tab === 'basic' ? '' : '--inactive'}`"
            @click="changeTab('basic')"
          >
            Basic
          </button>
          <button
            :class="`no-style ${tab === 'special' ? '' : '--inactive'}`"
            @click="changeTab('special')"
          >
            Special
          </button>
        </div>
        <settings />
      </template>
      <template v-else-if="hasError">
        <strong class="settings__error-list">{{ error.type }}</strong>
        <ul class="settings__error-list">
          <li
            v-for="(message, i) in error.message"
            :key="i"
          >
            {{ message }}
          </li>
        </ul>
      </template>
      <template v-else>
        <div class="settings__init">
          <div>
            <icon name="arrow-up" />
          </div>
          <div>
            Please load a ROM using the File menu above.
          </div>
        </div>
      </template>
    </q-layout-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ipcRenderer } from 'electron'
import { openURL } from 'quasar'
import { mapActions, mapGetters } from 'vuex'

import 'vue-awesome/icons/eye-slash'
import 'vue-awesome/icons/eye'
import Icon from 'vue-awesome/components/Icon'

import { poseWarning } from '../libs/messages.json'
import Settings from '../components/Settings.vue'
import HelpDialog from '../components/HelpDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

export default {
  name: 'MyLayout',
  components: {
    ConfirmDialog,
    HelpDialog,
    Icon,
    Settings
  },
  computed: {
    ...mapGetters([
      'activeSpriteAddress',
      'error',
      'filePath',
      'hasError',
      'filePath',
      'layoutDrawerOpen',
      'romLoaded',
      'settings',
      'showHelp',
      'showVram',
      'tab',
      'updateSprite',
      'updateVram'])
  },
  methods: {
    ...mapActions([
      'confirm',
      'setActiveSprite',
      'setLoading',
      'setTab',
      'toggleLayoutDrawerOpen',
      'toggleShowHelp',
      'toggleVram']),
    openURL,
    actionTabChange (tab) {
      this.setTab(tab)
      this.setLoading(true)
      this.setActiveSprite()
      switch (tab) {
        case 'basic': return this.loadBasicSettings()
        case 'special': return this.loadSpecialSettings()
      }
    },
    changeTab (tab) {
      if (tab !== this.tab) {
        if (!this.updateVram && !this.updateSprite) this.actionTabChange(tab)
        else {
          this.confirm({
            message: poseWarning,
            callback: function (val) { if (val) this.actionTabChange(tab) }.bind(this)
          })
        }
      }
    },
    loadBasicSettings () {
      ipcRenderer.send('Load Pose', { filePath: this.filePath, index: 0 })
    },
    loadSpecialSettings () {
      const pose = this.settings.SPECIAL_POSES[0]
      ipcRenderer.send('Load Pose', {
        ...pose,
        filePath: this.filePath,
        specialPoseFrameOverride: pose.dmaOffset / 4
      })
    }
  }
}
</script>

<style>
.munch-layout,
.q-layout-page-container {
  height: 100%;
}
.settings__tab button {
  padding: 0.5rem !important;
  width: 50%;
  margin-bottom: 1rem;
  font-weight: bolder;
}
.settings__tab button.--inactive {
  background: lightslategray;
}
.help-back {
  width: 100%;
  height: 100%;
  position: absolute;
  background: #ccc;
  opacity: 0.5;
  z-index: 95;
}
</style>
