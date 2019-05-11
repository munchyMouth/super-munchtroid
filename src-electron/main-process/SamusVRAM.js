import stampit from 'stampit'

export default stampit({ /* extends RomData, SamusProps, SamusAnimations */
  init () {
    // PRIVATE -----------------------------------------------------------------
    const { chunk } = this

    function chunkTileDataToROMWords (td) {
      return chunk(
        td.map(tileDataToBits)
          .reduce(tileDataBitsToBufferBits, ['', '', '', ''])
          .map(bytes => parseInt(bytes, 2)))
        .reverse() // -------------------------- reverse words, we want low word first.
        .map(it => it.reverse()) // ------------ reverse bytes
    }

    function tileDataBitsToBufferBits (arr, bits) {
      bits.forEach((bit, i) => (arr[i] += bit))
      return arr
    }

    function tileDataToBits (tileData) {
      let n = tileData.toString(2)
      while (n.length < 4) n = '0' + n
      return n.split('')
    }

    function toConcatenatedHighAndLowBuffers (arr, buffs) {
      return buffs.reduce((a, it, i) => {
        const newBuff = Buffer.from(it)
        a[i] = (a[i])
          ? Buffer.concat([a[i], newBuff], a[i].length + newBuff.length)
          : newBuff
        return arr
      }, arr)
    }

    // PUBLIC ------------------------------------------------------------------
    this.bytesToPixels = function (thirtyTwoBytes) {
      let row = []
      const lowHigh = chunk(thirtyTwoBytes, 0x10)
      for (let i = 0; i < 0x10; i += 2) {
        const bytes = []
        for (let j = 0; j <= 1; j++) { // - jump between high and low byte of word
          for (let k = 0; k <= 1; k++) { // jump between high and low 16 bytes
            let bits = lowHigh[j][i + k].toString(2)
            for (let l = bits.length - 1; l < 7; l++) bits = '0' + bits
            bytes.push(bits)
          }
        }
        row.push(this.pixelate(bytes))
      }
      return row
    }.bind(this)

    this.getPart = async function (firstTile, end, partTrace) {
      const tiles = await this.getOffsetData(firstTile, end)
      return {
        _address: `$${firstTile.toString(16)}`,
        _id: firstTile,
        tiles: chunk(tiles, 0x20).map(function (it, i) {
          return {
            _address: `$${(firstTile + (i * 0x20)).toString(16)}`,
            _id: firstTile + (i * 0x20),
            data: this.bytesToPixels(it)
          }
        }.bind(this))
      }
    }.bind(this)

    // LOADS THE RAW REPRESENTATION OF THE TILE INTO MEMORY.
    this.getVRAMByDMAEntry = async function (dmaEntry) {
      const firstTile = this.getPCAddressFromBufferData(dmaEntry, dmaEntry[2])
      const vramCount1 = dmaEntry.readUIntLE(3, 2)
      const vramCount2 = dmaEntry.readUIntLE(5, 2)
      const obj = {
        _address: `$${firstTile.toString(16)}`,
        _id: firstTile
      }
      obj.part1 = await this.getPart(firstTile, vramCount1, 'PART1')
      obj.part2 = await this.getPart(firstTile + vramCount1, vramCount2, `PART2$${dmaEntry + ' ' + dmaEntry[2]}`)
      return obj
    }.bind(this)

    this.loadVRAMTiles = async function (i = 0, arr = []) {
      if (i < this.dmaEntries.length) {
        const length = arr.push({
          bottom: {
            parts: await this.getVRAMByDMAEntry(this.dmaEntries[i].bottom)
          },
          top: {
            parts: await this.getVRAMByDMAEntry(this.dmaEntries[i].top)
          }
        })
        Object.keys(arr[length - 1]).forEach(key => {
          arr[length - 1][key]._id = this.dmaEntries[i][key]._id
          arr[length - 1][key]._address = this.dmaEntries[i][key]._address
        })
        await this.loadVRAMTiles(i + 1, arr)
      }
      return arr
    }.bind(this)

    this.pixelate = function (bytes) {
      const row = []
      for (let i = 0; i < 8; i++) {
        row.push( // read bytes reversed and read from high 16 to low 16
          parseInt(bytes[3][i] + bytes[2][i] + bytes[1][i] + bytes[0][i], 2)
        )
      }
      return row
    }

    this.tileDataToVRAMBuffers = function ({ data }) {
      return data
        .map(td => chunkTileDataToROMWords(td))
        .reduce(
          toConcatenatedHighAndLowBuffers,
          new Array(2))
    }
  }
})
