import stampit from 'stampit'

export default stampit({ /* extends RomData, SamusProps */
  init (frames) {
    // PRIVATE -----------------------------------------------------------------
    const FRAME_PROGRESS_TABLE = 0x9594E
    const DMA_TABLES = {
      TOP: [
        'EECB', 'CECC', 'A0CD', '80CE', 'F7CE', '6ECF', 'E5CF', '5CD0', 'E8D0', '2ED1', '13D6', 'A6D6', '4ED7'
      ].map(it => Buffer.from(it, 'hex')),
      BOTTOM: [
        '9ED1', '7ED2', '5ED3', 'D7D6', '06D4', 'A7D4', '4FD5', '86D7', 'F0D5', '9BD7', '05D6'
      ].map(it => Buffer.from(it, 'hex'))
    }

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

    this.loadDMAEntries = async function () {
      const dmaOffsetsPointer = await this.getOffsetData(
        FRAME_PROGRESS_TABLE + (this.pose * 2), 2)
      const dmaOffsetsPointerLong =
        this.getPCAddressFromBufferData(dmaOffsetsPointer, 0x92)
      const dmaOffsets = await this.getOffsetData(
        dmaOffsetsPointerLong, this.frames.length * 4)
      this.dmaEntries = await this.getDMAData(this.chunk(dmaOffsets, 4))
      this.dmaEntries._address = `$${dmaOffsetsPointerLong.toString(16)}`
      this.dmaEntries._id = dmaOffsetsPointerLong
      this.dmaEntries._pose = `$${this.pose.toString(16)}`
    }.bind(this)
  }
})
