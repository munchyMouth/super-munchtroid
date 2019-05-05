import stampit from 'stampit'

export default stampit({ /* extends RomData */
  init () {
    // PRIVATE -----------------------------------------------------------------
    const FRAME_DELAY_TABLE =
      parseInt(this.loadSettingsFile('TableData').FRAME_DELAY_TABLE, 16)

    // PUBLIC ------------------------------------------------------------------
    this.setPose = function (pose) {
      this.pose = pose
      return this
    }

    this.setFrames = async function () {
      const frameDelayPointerAddress =
        await this.getOffsetData(FRAME_DELAY_TABLE + (this.pose * 2), 2)
      this.frameOffset =
        this.getPCAddressFromBufferData(frameDelayPointerAddress, 0x91)
      this.frames = await this.iterateFrameDelays(this.frameOffset)
      return this
    }.bind(this)
  }
})
