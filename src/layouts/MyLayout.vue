<template>
  <q-layout class="munch-layout"
            view="lHh Lpr lFf">
    <q-layout-header v-if="filePath">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="toggleLayoutDrawerOpen()"
          aria-label="Settings">
          <q-icon name="settings" />
        </q-btn>
        <q-toolbar-title>
            <strong>
              {{ this.activeSpriteAddress ? 'Sprite Mode' : 'Editor Mode' }}
            </strong>
            <div slot="subtitle">
              {{ this.activeSpriteAddress
                  ? 'Left-click on VRAM reassigns current sprite; right-click on VRAM opens a new tile in the editor'
                  : 'Left-click on VRAM will open a new tile in the editor'
              }}
            </div>
          </q-toolbar-title>
          <button class="no-style show-vram"
                  @click="toggleVram">
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
          <button :class="`no-style ${tab === 'basic' ? '' : '--inactive'}`" @click="changeTab('basic')">Basic</button>
          <button :class="`no-style ${tab === 'special' ? '' : '--inactive'}`" @click="changeTab('special')">Special</button>
        </div>
        <settings/>
      </template>
      <template v-else-if="hasError">
        <strong class="settings__error-list">{{ error.type }}</strong>
        <ul class="settings__error-list">
          <li v-for="(message, i) in error.message"
              :key="i">
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

export default {
  name: 'MyLayout',
  components: {
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
      'setActiveSprite',
      'setLoading',
      'setTab',
      'toggleLayoutDrawerOpen',
      'toggleVram']),
    openURL,
    changeTab (tab) {
      if (tab !== this.tab &&
        ((!this.updateVram && !this.updateSprite) ||
        ((this.updateSprite || this.updateVram) &&
        confirm(poseWarning)))) {
        this.setTab(tab)
        this.setLoading(true)
        this.setActiveSprite()
        switch (tab) {
          case 'basic': return this.loadBasicSettings()
          case 'special': return this.loadSpecialSettings()
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
.munch-layout, .q-layout-page-container {
  height: 100%;
}
.settings__tab button {
  padding: .5rem !important;
  width: 50%;
  margin-bottom: 1rem;
  font-weight: bolder;
}
.settings__tab button.--inactive {
  background: lightslategray;
}
</style>
