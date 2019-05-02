import stampit from 'stampit'

export default stampit({
  init (indexTableAddress) {
    this.getIndexTableOffset = function (offset) {
      return indexTableAddress + (offset * 2)
    }
  }
})
