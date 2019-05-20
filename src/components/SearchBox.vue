<template>
  <div>
    <q-search v-model="entry"
              class="search-box__input"
              clearable
              placeholder="Search used poses"
              @keyup.up="scrollThroughEntries('up')"
              @keyup.down="scrollThroughEntries('down')"
              @keyup.enter="submitEntry()"/>
    <div class="search-box__entries">
      <div v-for="(e, i) in entries"
          :key="e.id"
          :class="hilightedIndex === i ? '--hilight' : ''">
        <button class="no-style"
                @click="getEntry(e)">
        {{ e.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'

export default {
  name: 'search-box',
  data () {
    return {
      entry: '',
      hilightedIndex: -1
    }
  },
  inject: ['poses'],
  computed: {
    entries () {
      if (this.entry) {
        const regExp = new RegExp(this.entry, 'gi')
        return this.poses.filter(it => it.name.search(regExp) > -1)
      } else return []
    }
  },
  methods: {
    getEntry (e) {
      this.$emit('load-entry', { entry: cloneDeep(e) })
      this.entry = ''
      this.hilightedIndex = -1
    },
    scrollThroughEntries (direction) {
      if (this.entries) {
        switch (direction) {
          case 'up':
            this.hilightedIndex = (this.hilightedIndex > 0)
              ? this.hilightedIndex - 1
              : this.entries.length - 1
            if (this.$el.querySelector('.search-box__entries').scrollTop > 0) {
              this.$el.querySelector('.search-box__entries').scrollTop = (this.hilightedIndex * 50) - 125
            } else if (this.hilightedIndex >= this.entries.length - 1) {
              this.$el.querySelector('.search-box__entries').scrollTop =
                50 * this.entries.length - 1
            }
            break
          case 'down':
            this.hilightedIndex = (this.hilightedIndex < this.entries.length - 1)
              ? this.hilightedIndex + 1
              : 0
            if (this.hilightedIndex > 3) {
              this.$el.querySelector('.search-box__entries').scrollTop = (this.hilightedIndex * 50) - 125
            } else this.$el.querySelector('.search-box__entries').scrollTop = 0
        }
      }
    },
    submitEntry () {
      if (this.hilightedIndex > -1) {
        this.getEntry(this.entries[this.hilightedIndex])
      }
    }
  },
  watch: {
    entry (newVal) {
      if (!newVal) this.hilightedIndex = -1
    }
  }
}
</script>

<style>
.search-box__input {
}
.search-box__entries {
  display: flex;
  flex-direction: column;
  position: absolute;
  background: white;
  width: 100%;
  z-index: 99;
  max-height: 300px;
  overflow: auto;
  border: 1px solid #ccc;
  align-content: center;
}
.search-box__entries > div {
  width: 100%;
  height: 100%;
  min-height: 50px;
  border-bottom: 1px solid #ccc;
}
.search-box__entries > div.--hilight {
  background: #ccc;
}
.search-box__entries > div > button {
  text-decoration: none;
  width: 100%;
  min-height: 50px;
  padding: .5rem;
}
.search-box__entries > div > button:focus {
  background: #eee;
  width: 100%;
  height: 100%;
  min-height: 50px;
}
.search-box__entries > div > button:hover {
  background: #ddf;
  width: 100%;
  min-height: 50px;
  justify-self: top;
}
</style>
