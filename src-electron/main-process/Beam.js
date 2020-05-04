import stampit from 'stampit'

import RomData from './RomData.js'

export default stampit(RomData, { /* extends RomData */
  init () {
    // PRIVATE -----------------------------------------------------------------
    const BEAM_OFFSETS =
      this.loadSettingsFile('BeamData')

    // PUBLIC ------------------------------------------------------------------
    this.load = async function () {
      const _this = this
      return _this.reduce(
        Object.keys(BEAM_OFFSETS),
        async function (obj, position) {
          obj[position] = {}
          await _this.each(
            Object.keys(BEAM_OFFSETS[position]),
            async function (xY) {
              obj[position][xY] =
                await _this.reduce(
                  Object.keys(BEAM_OFFSETS[position][xY]),
                  async function (xYObj, key) {
                    xYObj[key] = {
                      offset: BEAM_OFFSETS[position][xY][key],
                      data: _this.reverseByteWords(
                        await _this.getOffsetData(parseInt(BEAM_OFFSETS[position][xY][key], 16), 20))
                    }
                    return xYObj
                  }, {})
            })
          return obj
        }, {})
    }
  }
})
