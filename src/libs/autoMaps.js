import { pascalize } from 'humps'

/**
 * The method automatically generates getters based on states
 *
 * @param {Object} _state - VUEX state object
 * @param {Object} customGetters - additional custom getters
 */
const autoMapGetters = (_state, customGetters = {}) => {
  return Object.keys(_state).reduce((getters, stateName) => {
    if (!getters.hasOwnProperty(stateName)) {
      getters[stateName] = state => state[stateName]
    }

    return getters
  }, customGetters)
}

/**
 * The method automatically generates mutations based on states
 *
 * @param {Object} _state - VUEX state object
 * @param {Object} customMutations - additional custom mutations
 * @param {Array} methods - prefixes which be used for generating mutations
 */
const autoMapMutations = (_state, customMutations = {}, methods = ['set']) => {
  return Object.keys(_state).reduce((mutations, stateName) => {
    methods.forEach(methodName => {
      const mutationName = `${methodName}${pascalize(stateName)}`

      if (!mutations.hasOwnProperty(mutationName)) {
        mutations[mutationName] = (state, payload) => {
          state[stateName] = payload
        }
      }
    })

    return mutations
  }, customMutations)
}

/**
 * The method automatically generates mutations based on states
 *
 * @param {Object} _state - VUEX state object
 * @param {Object} customActions - additional custom actions
 * @param {Array} only - state names based on which will be generating actions
 */
const autoMapActions = (_state, customActions = {}, only = []) => {
  return Object.keys(_state)
    .filter(action => only.length > 0 ? only.includes(action) : true)
    .reduce((actions, stateName) => {
      const actionName = `set${pascalize(stateName)}`
      const mutationName = `set${pascalize(stateName)}`

      if (!actions.hasOwnProperty(actionName)) {
        actions[actionName] = ({ commit }, payload) => {
          commit(mutationName, payload)
        }
      }

      return actions
    }, customActions)
}

export {
  autoMapGetters,
  autoMapMutations,
  autoMapActions
}
