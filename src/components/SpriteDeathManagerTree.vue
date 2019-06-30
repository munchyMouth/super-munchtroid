<template>
  <div v-if="tileMapFrame && tileMapFrame.tileMap">
    <tree v-for="(sprite, k) in tileMapFrame.tileMap.sprites"
          :key="sprite._id + k"
          :open-override="activeSpriteAddress &&
            activeSpriteAddress === sprite._address
              ? sprite._id + k
              : false"
          :label="sprite._address"
          @opened="setActiveSprite({ half: 'N/A', index: k, ...sprite })"
          @closed="clearActiveSprite()">
      <tree-li>
        <sprite-manager half="N/A"
                        :index="k"/>
      </tree-li>
    </tree>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import SpriteManager from './SpriteManager.vue'
import Tree from './Tree.vue'
import TreeLi from './TreeLi.vue'

export default {
  name: 'sprite-death-manager-tree',
  components: {
    SpriteManager,
    Tree,
    TreeLi
  },
  computed: {
    ...mapGetters([
      'activeSprite',
      'activeSpriteAddress',
      'tileMapFrame',
      'settings'
    ])
  },
  methods: {
    ...mapActions([
      'clearActiveSprite',
      'setActiveSprite'
    ]),
    todo () {
      console.log('STUFF')
    }
  }
}
</script>

<style>
</style>
