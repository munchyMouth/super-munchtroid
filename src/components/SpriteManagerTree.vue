<template>
  <div v-if="tileMapFrame && (tileMapFrame.top || tileMapFrame.bottom)">
    <tree v-for="(half, j) in ['top', 'bottom']"
          :key="tileMapFrame[half]._id + j"
          :label="half"
          :open-override="activeHalf === tileMapFrame[half]._id + j
            ? activeHalf
            : false"
          @opened="clearActiveSprite(tileMapFrame[half]._id + j)"
          @closed="clearActiveSprite()">
      <template slot="default" slot-scope="spriteIs">
      <tree-li>
        <tree v-for="(sprite, k) in tileMapFrame[half].tileMap.sprites"
              :key="sprite._id + k"
              :open-override="activeSpriteAddress &&
                activeSpriteAddress === sprite._address
                  ? sprite._id + k
                  : spriteIs.open"
              :label="sprite._address"
              @opened="setActiveSprite({ half, index: k, ...sprite })"
              @closed="clearActiveSprite()">
          <tree-li>
            <sprite-manager :half="half"
                            :index="k"/>
          </tree-li>
        </tree>
      </tree-li>
      </template>
    </tree>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import SpriteManager from './SpriteManager.vue'
import Tree from './Tree.vue'
import TreeLi from './TreeLi.vue'

export default {
  name: 'sprite-manager-tree',
  components: {
    SpriteManager,
    Tree,
    TreeLi
  },
  computed: {
    ...mapGetters([
      'activeHalf',
      'activeSpriteAddress',
      'tileMapFrame'
    ])
  },
  methods: {
    ...mapActions([
      'clearActiveSprite',
      'setActiveSprite'
    ])
  }
}
</script>

<style>
</style>
