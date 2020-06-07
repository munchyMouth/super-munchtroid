<template>
  <q-modal
    v-model="opened"
    no-backdrop-dismiss
    @show="modalOpen"
    @escape-key="callback(false)"
  >
    <div class="confirm-strap-line">
      Confirm
    </div>
    <div class="confirm">
      <div class="__message">
        {{ confirmed.message }}
      </div>
      <div class="__button">
        <button
          ref="ok"
          class="no-style"
          title="ok"
          @click="callback(true)"
        >
          <icon
            name="check"
            style="color: green"
          />
        </button>
        <button
          title="cancel"
          class="no-style"
          @click="callback(false)"
        >
          <icon
            name="times"
            style="color: red"
          />
        </button>
      </div>
    </div>
  </q-modal>
</template>

<script>
import 'vue-awesome/icons/check'
import 'vue-awesome/icons/times'
import Icon from 'vue-awesome/components/Icon'

import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    Icon
  },
  data () {
    return {
      opened: false
    }
  },
  computed: {
    ...mapGetters(['confirmed']),
    show () { return this.confirmed.show }
  },
  watch: {
    show (newValue) {
      this.opened = newValue
    },
    opened (newValue) {
      if (newValue !== this.show) this.toggleConfirm()
    }
  },
  methods: {
    ...mapActions(['toggleConfirm']),
    callback (value) {
      this.confirmed.callback(value)
      this.opened = false
    },
    modalOpen () {
      this.$refs['ok'].focus()
    }
  }
}
</script>

<style scoped>
.confirm-strap-line {
  background: lightslategrey;
  color: white;
  font-weight: bold;
  padding: 5px;
}
.confirm {
  display: flex;
  flex-direction: column;
  padding: 5px;
}
.confirm > .__message {
  padding: 25px;
}
.confirm > .__button {
  display: flex;
  justify-content: flex-end;
}
.confirm > .__button button {
  padding: 10px;
}
</style>
