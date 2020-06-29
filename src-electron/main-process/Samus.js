import stampit from 'stampit'

import RomData from './RomData.js'
import SamusAnimations from './SamusAnimations.js'
import SamusProps from './SamusProps.js'
import SamusTileMaps from './SamusTileMaps.js'
import SamusVRAM from './SamusVRAM.js'

export default stampit(
  RomData,
  SamusAnimations,
  SamusProps,
  SamusTileMaps,
  SamusVRAM,
  {
    init () {
      const { each, loadMissileFinOffsets, loadSettingsFile, pojoToSpriteBuffer, setOffsetData } = this

      const { REDUNDANT_LIFT_POSE_TORSO_TILE } = loadSettingsFile('TableData')

      async function eraseCommonTileForLiftPose (isFirstPose) {
        if (isFirstPose) {
          const buff = Buffer.alloc(32)
          await setOffsetData(
            buff, parseInt(REDUNDANT_LIFT_POSE_TORSO_TILE, 16), buff.length)
        }
      }

      this.load = async function (pose, frameCount, dmaOffset, POSES) {
        const { frames, loadVRAMTiles, loadDMAEntries, loadTileMaps } =
          await this.setPose(pose).setFrames(frameCount)
        await loadDMAEntries(dmaOffset)
        const fins = POSES ? await loadMissileFinOffsets(dmaOffset, pose, POSES) : undefined
        if (fins) fins.tile = await this.getMissileFinTile(dmaOffset, pose, POSES)

        return {
          fins,
          frames: frameCount ? new Array(frameCount).fill(0) : frames,
          tileMaps: await loadTileMaps(dmaOffset),
          vram: await loadVRAMTiles()
        }
      }

      this.repointData = async function ({ dma, frame }) {
        await this.setOffsetData(
          this.bufferFromArray(frame.bottom.value),
          frame.bottom._id,
          frame.bottom.value.length
        )
        await this.setOffsetData(
          this.bufferFromArray(frame.top.value),
          frame.top._id,
          frame.top.value.length
        )
        await this.setOffsetData(
          this.bufferFromArray(dma.value),
          dma._id + (dma.index * 4),
          dma.value.length
        )
      }

      this.saveMissileFinsToRom = async function ({ _id, data, length }, overwrite) {
        data = data.map(it => (it < 0) ? it + 255 : it)
        if (overwrite) while (data.length < length - 2) data.push(data.length % 2 ? data[1] : data[0])
        await this.setOffsetData(
          Buffer.from(data), _id, data.length / 2)
      }.bind(this)

      this.saveSpriteToROM = async function (isFirstPose, pojo) {
        const buff = pojoToSpriteBuffer(pojo)
        await setOffsetData(buff, pojo._id, buff.length)
        await eraseCommonTileForLiftPose(isFirstPose)
      }

      this.saveSpritesToROM = async function (isFirstPose, pojoArray) {
        await each(pojoArray, async pojo => {
          const buff = pojoToSpriteBuffer(pojo)
          await setOffsetData(buff, pojo._id, buff.length)
        })
        await eraseCommonTileForLiftPose(isFirstPose)
      }

      this.saveVRAMTileToROM = async function (tile) {
        const buff = this.tileDataToVRAMBuffers(tile)
        await setOffsetData(buff[0], tile._id, buff[0].length)
        await setOffsetData(buff[1], tile._id + 16, buff[1].length)
      }

      this.saveVRAMTilesToROM = async function (tiles) {
        await each(tiles, async tile => {
          const buff = this.tileDataToVRAMBuffers(tile)
          await setOffsetData(buff[0], tile._id, buff[0].length)
          await setOffsetData(buff[1], tile._id + 16, buff[1].length)
        })
      }
    }
  }
)
