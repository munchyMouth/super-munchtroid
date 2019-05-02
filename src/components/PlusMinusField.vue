<template>
  <div class="plus-minus-field">
      <strong>{{ title }}</strong>&nbsp;
      <div>
        <button class="no-style"
              @click="$emit('decrement', true)">
        <icon name="minus" />
        </button>
        <input class="six-char"
              :value="value"
              disabled/>
        <button class="no-style"
                @click="$emit('increment', true)">
          <icon name="plus" />
        </button>
      </div>
    </div>
</template>

<script>
import 'vue-awesome/icons/plus'
import 'vue-awesome/icons/minus'
import 'vue-awesome/icons/arrow-up'
import Icon from 'vue-awesome/components/Icon'

export default {
  name: 'plus-minus-field',
  components: { Icon },
  props: ['title', 'value'],
  methods: {
  }
}
</script>

<style>
.plus-minus-field {
  display: flex;
  justify-content: center;
  margin-top: .5rem;
}
.plus-minus-field strong {
  width: 35%;
}
</style>
