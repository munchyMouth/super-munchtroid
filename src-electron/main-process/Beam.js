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
                        .map(it => it > 255 ? -(65535 - it) : it)
                    }
                    return xYObj
                  }, { _updates: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] })
            })
          return obj
        }, {})
    }

    this.saveToROM = async function (beams) {
      const _this = this
      await _this.each(
        Object.keys(beams),
        async function (actionKey) {
          await _this.each(
            Object.keys(beams[actionKey]),
            async function (XYKey) {
              if (beams[actionKey][XYKey]._updates.filter(it => it !== 0).length) {
                await _this.each(Object.keys(beams[actionKey][XYKey]),
                  async function (beamKey) {
                    if (beamKey !== '_updates') {
                      beams[actionKey][XYKey][beamKey].data =
                        beams[actionKey][XYKey][beamKey].data.reduce(
                          function (arr, it, i) {
                            let v = it + beams[actionKey][XYKey]._updates[i]
                            if (v < 0) v += 65535
                            arr.push(v)
                            return arr
                          }, [])
                      await _this.setOffsetData(
                        _this.bufferFromArray(beams[actionKey][XYKey][beamKey].data),
                        parseInt(beams[actionKey][XYKey][beamKey].offset, 16)
                      )
                    }
                  })
              }
            })
        })
      return this.load()
    }
  }
})
