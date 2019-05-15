import stampit from 'stampit'

export default stampit({ /* extends RomData, SamusProps */
  init (frames) {
    // PRIVATE -----------------------------------------------------------------
    let { FRAME_PROGRESS_TABLE, DMA_TABLES } = this.loadSettingsFile('TableData')
    DMA_TABLES = ['TOP', 'BOTTOM'].reduce((obj, half) => {
      obj[half] = DMA_TABLES[half].map(it => Buffer.from(it, 'hex'))
      return obj
    }, {})
    FRAME_PROGRESS_TABLE = parseInt(FRAME_PROGRESS_TABLE, 16)

    // PUBLIC ------------------------------------------------------------------
    this.getDMAData = async function (dmaOffsets, arr = []) {
      if (dmaOffsets.length) {
        const dmaOffset = dmaOffsets.shift()
        const dmaTable = {
          top: this.getPCAddressFromBufferData(DMA_TABLES.TOP[dmaOffset[0]], 0x92),
          bottom: this.getPCAddressFromBufferData(DMA_TABLES.BOTTOM[dmaOffset[2]], 0x92)
        }
        const data = {
          top: await this.getOffsetData(dmaTable.top + dmaOffset[1] * 7, 7),
          bottom: await this.getOffsetData(dmaTable.bottom + dmaOffset[3] * 7, 7)
        }
        Object.keys(dmaTable).forEach(key => {
          data[key]._id = dmaTable[key]
          data[key]._address = `$${dmaTable[key].toString(16)}`
        })
        arr.push(data)
        await this.getDMAData(dmaOffsets, arr)
      }
      return arr
    }.bind(this)

    this.loadDMAEntries = async function (manualOffset = 0) {
      const dmaOffsetsPointer = await this.getOffsetData(
        FRAME_PROGRESS_TABLE + (this.pose * 2), 2)
      const dmaOffsetsPointerLong =
        this.getPCAddressFromBufferData(dmaOffsetsPointer, 0x92)
      const dmaOffsets = await this.getOffsetData(
        dmaOffsetsPointerLong + manualOffset, 4) // this.frames.length * 4)
      this.dmaEntries = await this.getDMAData(this.chunk(dmaOffsets, 4))
      this.dmaEntries._address = `$${dmaOffsetsPointerLong.toString(16)}`
      this.dmaEntries._id = dmaOffsetsPointerLong
      this.dmaEntries._pose = `$${this.pose.toString(16)}`
    }.bind(this)
  }
})
