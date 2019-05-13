<template>
  <div class="sprite-manager">
    <div class="sprite-manager__flips">
      <div class="sprite-manager__group">
        <label>H-Flip</label>
        <button class="no-style"
                @click="setHFlip(!sprite.hFlip)">
          <icon :name="sprite.hFlip ? 'regular/check-circle' : 'regular/circle'" />
        </button>
      </div>
      <div class="sprite-manager__group">
        <label>V-Flip</label>
        <button class="no-style"
                @click="setVFlip(!sprite.vFlip)">
          <icon :name="sprite.vFlip ? 'regular/check-circle' : 'regular/circle'" />
        </button>
      </div>
    </div>
    <hr />
    <div class="sprite-manager__flips">
      <div class="sprite-manager__group">
        <label>16x16</label>
        <button class="no-style"
                @click="set16x16(!sprite.load16x16)"
                v-if="activeSprite ? vram16x16TileIsValid({ ...activeSprite }) : false">
          <icon :name="sprite.load16x16 ? 'regular/check-circle' : 'regular/circle'" />
        </button>
        <button class="no-style" disabled v-else
                title="This tile cannot be used as the basis for a 16x16 sprite">
          <icon name="regular/times-circle" />
        </button>
      </div>
      <div class="sprite-manager__offsets">
        <div><strong>x:</strong> {{sprite.xOffset}}</div>
        <div><strong>y:</strong> {{sprite.yOffset}}</div>
      </div>
    </div>
    <hr />
    <div class="sprite-manager__save">
      <button :class="`no-style ${sprite._updated ? '--active' : ''}`"
              @click="saveSprite">
        <icon name="save" /> Save Sprite
      </button>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapActions, mapGetters } from 'vuex'

// import 'vue-awesome/icons/arrow-down'
// import 'vue-awesome/icons/arrow-up'
// import 'vue-awesome/icons/arrow-left'
import 'vue-awesome/icons/save'
import 'vue-awesome/icons/regular/check-circle'
import 'vue-awesome/icons/regular/circle'
import 'vue-awesome/icons/regular/times-circle'
import Icon from 'vue-awesome/components/Icon'

export default {
  name: 'sprite-manager',
  props: ['half', 'index'],
  components: {
    Icon
  },
  computed: {
    ...mapGetters([
      'currentPose',
      'filePath',
      'activeSprite',
      'getSpriteByProps',
      'spriteDefaulted',
      'updateSprite',
      'vram16x16TileIsValid'
    ]),
    spriteHasUpdate () {
      return this.sprite._updated
    }
  },
  data () {
    return {
      sprite: undefined
    }
  },
  methods: {
    ...mapActions([
      'clearSpriteUpdateFlag',
      'setLoading',
      'setSpriteProperty'
    ]),
    saveSprite () {
      if (this.sprite._updated) {
        this.setLoading(true)
        this.clearSpriteUpdateFlag(this.$props)
        ipcRenderer.send('Save Sprite', {
          filePath: this.filePath,
          sprite: this.sprite,
          isFirstPose: !this.currentPose
        })
      }
    },
    setHFlip (hFlip) {
      this.setSpriteProperty({
        ...this.$props, property: 'hFlip', value: hFlip })
    },
    setVFlip (vFlip) {
      this.setSpriteProperty({
        ...this.$props, property: 'vFlip', value: vFlip })
    },
    set16x16 (load16x16) {
      this.setSpriteProperty({
        ...this.$props, property: 'load16x16', value: load16x16 })
    }
  },
  created () {
    // this.sprite is really just a pointer to the store object.
    // if you wanna edit this.sprite, do it through action dispatches as above!
    this.sprite = this.getSpriteByProps(this.$props)
  }
}
</script>

<style>
  .sprite-manager {
    border: .01rem solid #ccc;
    padding: .5rem;
    margin: 0 .5rem .5rem .5rem;
  }
  .sprite-manager__flips {
    display: flex;
    flex-direction: row;
    justify-content: space-between
  }
  .sprite-manager__flips > div.sprite-manager__group {
    padding-right: .5rem
  }
  .sprite-manager__offsets {
    display: flex;
    flex-direction: column;
    font-size: .8rem;
    justify-content: space-evenly;
    width: 25%;
  }
  .sprite-manager__group button {
    margin-left: 1rem;
    padding: .5rem;
  }
  .sprite-manager__save button.--active {
    color: red;
  }
</style>
