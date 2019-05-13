<template>
  <q-layout class="munch-layout"
            view="lHh Lpr lFf">
    <q-layout-header v-if="filePath">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
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
      v-model="leftDrawerOpen"
      :content-class="$q.theme === 'mat' ? 'bg-grey-2' : null"
    >
      <template v-if="!hasError && romLoaded">
        <q-tabs color="secondary" align="justify">
            <q-tab default name="basic" slot="title" label="Basic" />
            <q-tab name="special" slot="title" label="Special" />
            <q-tab-pane name="basic">
              <settings />
            </q-tab-pane>
            <q-tab-pane name="special">
              TO DO
            </q-tab-pane>
        </q-tabs>
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
import { openURL } from 'quasar'
import { mapActions, mapGetters } from 'vuex'

import 'vue-awesome/icons/eye-slash'
import 'vue-awesome/icons/eye'
import Icon from 'vue-awesome/components/Icon'

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
      'hasError',
      'filePath',
      'romLoaded',
      'showVram'])
  },
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop
    }
  },
  methods: {
    ...mapActions(['toggleVram']),
    openURL
  }
}
</script>

<style>
.munch-layout, .q-layout-page-container {
  height: 100%;
}
</style>
