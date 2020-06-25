import stampit from 'stampit'

import RomData from './RomData.js'

export default stampit(RomData, { /* extends RomData */
  init () {
    // PRIVATE -----------------------------------------------------------------
    const BEAM_OFFSETS =
      this.loadSettingsFile('BeamData')

    const getBeamKeysByType = (beam, type) => Object.keys(beam).filter(k => {
      return ((type === 'DEFAULT' && !beam[k]._isSpark) ||
        (type === 'CHARGE_ORIGIN' && beam[k]._isSpark))
    })

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
                        await _this.getOffsetData(parseInt(BEAM_OFFSETS[position][xY][key === 'GRAPPLE_ORIGIN' ? 'CHARGE_ORIGIN' : key], 16), 20))
                        .map(it => it > 255 ? -(65535 - it) : it),
                      _isSpark: key.includes('ORIGIN')
                    }
                    if (key === 'CHARGE_ORIGIN' || key === 'DEFAULT') xYObj[key]._updates = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    return xYObj
                  }, {})
            })
          return obj
        }, {})
    }

    // const handleOffsetVariable = (update, type) => (update > 0 && type === 'GRAPPLE_ORIGIN') ? type - 5 : type

    this.saveToROM = async function (beams) {
      const _this = this
      await _this.each(
        Object.keys(beams),
        async function (actionKey) {
          await _this.each(
            Object.keys(beams[actionKey]),
            async function (XYKey) {
              await _this.each(
                ['DEFAULT', 'CHARGE_ORIGIN'],
                async function (type) {
                  if (beams[actionKey][XYKey][type]._updates.filter(it => it !== 0).length) {
                    await _this.each(getBeamKeysByType(beams[actionKey][XYKey], type),
                      async function (beamKey) {
                        if (beamKey !== '_updates') {
                          // spark updates are stored in CHARGE_ORIGIN, the rest are stored in DEFAULT
                          beams[actionKey][XYKey][beamKey].data =
                            beams[actionKey][XYKey][beamKey].data.reduce(
                              function (arr, it, i) {
                                let v = it + beams[actionKey][XYKey][type]._updates[i]
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
        })
      return this.load()
    }
  }
})
