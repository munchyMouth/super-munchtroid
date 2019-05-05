import stampit from 'stampit'

export default stampit({ /* extends RomData, SamusProps */
  init () {
    // PRIVATE -----------------------------------------------------------------
    const obj = this.loadSettingsFile('TableData')
    const { ANIMATION_TABLE, INDEX_OFFSET_TABLE_BOT, INDEX_OFFSET_TABLE_TOP } =
      ['ANIMATION_TABLE', 'INDEX_OFFSET_TABLE_BOT', 'INDEX_OFFSET_TABLE_TOP']
        .reduce((o, key) => {
          o[key] = parseInt(obj[key], 16)
          return o
        }, {})

    function tileMapPointerIsEmpty (tileMapPointer) {
      for (let i = 0; i < tileMapPointer.length; i++) {
        if (tileMapPointer[i]) return false
      }
      return true
    }

    // PUBLIC ------------------------------------------------------------------
    this.getSpriteMapTable =
      async function (tileMapAddress) {
        let tileMapAddressLong =
          this.getPCAddressFromBufferData(tileMapAddress, 0x92) // SNES bank address = $92
        const spriteCount = await this.getSpriteCount(tileMapAddressLong)
        const tileMap =
          await this.getOffsetData(tileMapAddressLong += 2, spriteCount * 5)
        return this.buildSpriteMapTableEntry(tileMap, tileMapAddressLong)
      }

    this.buildSpriteMapTableEntry = function (tileMap, tileMapAddressLong) {
      return {
        sprites: this.chunk(tileMap, 5)
          .map((it, i) => {
            if (i < 50) {
              const spriteId = tileMapAddressLong + (5 * (i))
              return {
                _address: `$${spriteId.toString(16)}`,
                _id: spriteId,
                sprite: it,
                ...this.parseSpriteMapLogic(it)
              }
            } else {
              debugger
              throw new Error('failed to load TileMap for this sprite.')
            }
          }),
        _id: tileMapAddressLong - 2,
        _address: `$${(tileMapAddressLong - 2).toString(16)}`
      }
    }.bind(this)

    this.parseSpriteMapLogic = function (map) {
      return {
        ...this.parseTileOffset(map[3]),
        xAxisIsNegative: !!(map[1] % 2),
        load16x16: !!(map[1] >= 0x80),
        xOffset: map[1] % 2 ? -((0xFF - map[0]) + 1) : map[0], // ---- subtract from FF for negatives.
        yOffset: map[2] >= 0x80 ? -((0xFF - map[2]) + 1) : map[2], //  $01 - $7F move tile down. $80 - $FF move tile up.
        hFlip: (map[4] >> 6) === 1 || (map[4] >> 6) === 3, // -------- $40 means tile is hflip
        vFlip: (map[4] >> 6) > 1, // --------------------------------- $80 means tile is vflip
        priority: (map[4] & 0b00110000) >> 4 // ---------------------- Samus' priority from 0-3, jury's out on whether SNES listens to this.
      }
    }

    this.parseTileOffset = function (byte) {
      let B = byte.toString(16)
      B = B.length < 2 ? `0${B}` : B
      const vramIndex = parseInt(B[1], 16)
      return {
        vramIndex,
        part: parseInt(B[0], 16) ? 'part2' : 'part1'
      }
    }

    this.getSpriteCount = async function (tileMapAddressLong) {
      return this.reverseByteWords(
        await this.getOffsetData(tileMapAddressLong, 2))[0]
    }.bind(this)

    this.getTableOffsetByIndex = async function (table, index, length = 2) {
      const item = await this.getOffsetData(table + (index * 2), length)
      return this.reverseByteWords(item)
    }.bind(this)

    this.iterateFrameDelays = async function (frameDelays, arr = []) {
      const frameDelayData = await this.getOffsetData(frameDelays + arr.length, 1)
      if (frameDelayData[0] < 0xF0) {
        arr.push(frameDelayData[0])
        await this.iterateFrameDelays(frameDelays, arr)
      }
      return arr
    }.bind(this)

    this.loadSpriteTileMaps = async function (table, i) {
      const poseTileMapPointer =
        ANIMATION_TABLE +
        (await this.getTableOffsetByIndex(table, this.pose) * 2)
      const tileMapPointer = await this.getOffsetData(
        poseTileMapPointer + (i * 2), 2)
      return {
        tileMap: !tileMapPointerIsEmpty(tileMapPointer)
          ? await this.getSpriteMapTable(tileMapPointer)
          : { sprites: [] },
        _id: poseTileMapPointer + (i * 2),
        _pose: `$${this.pose.toString(16)}`,
        _address: `$${(poseTileMapPointer + (i * 2)).toString(16)}`
      }
    }.bind(this)

    this.loadTileMaps = async function (arr = [], i = 0) {
      try {
        if (arr.length < this.frames.length) {
          arr.push({
            bottom: await this.loadSpriteTileMaps(INDEX_OFFSET_TABLE_BOT, i),
            top: await this.loadSpriteTileMaps(INDEX_OFFSET_TABLE_TOP, i)
          })
          await this.loadTileMaps(arr, i + 1)
        }
        return arr
      } catch (err) {
        console.error(err.message)
      }
    }.bind(this)

    this.pojoToSpriteBuffer = function (pojo) {
      return Buffer.from([
        pojo.xOffset >= 0 ? pojo.xOffset : 0xFF + pojo.xOffset + 1,
        (pojo.load16x16 ? 0x80 : 0) + (pojo.xAxisIsNegative ? 1 : 0),
        pojo.yOffset >= 0 ? pojo.yOffset : 0xFF + pojo.yOffset + 1,
        (pojo.part === 'part2' ? 0x10 : 0) + pojo.vramIndex,
        (pojo.hFlip ? 0x40 : 0) + (pojo.vFlip ? 0x80 : 0) + 0x20 + 8 // not sure what the 8 is for but I don't touch it!
      ])
    }
  }
})
