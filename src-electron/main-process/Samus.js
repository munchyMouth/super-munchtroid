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
      const {
        bytesToPixels,
        chunk,
        each,
        getOffsetData,
        loadSettingsFile,
        pojoToSpriteBuffer,
        setOffsetData
      } = this

      const {
        REDUNDANT_LIFT_POSE_TORSO_TILE,
        DEATH_POSE
      } = loadSettingsFile('TableData')

      async function eraseCommonTileForLiftPose (isFirstPose) {
        if (isFirstPose) {
          const buff = Buffer.alloc(32)
          await setOffsetData(
            buff, parseInt(REDUNDANT_LIFT_POSE_TORSO_TILE, 16), buff.length)
        }
      }

      this.load = async function (pose, frameCount, dmaOffset) {
        const { frames, loadVRAMTiles, loadDMAEntries, loadTileMaps } =
          await this.setPose(pose).setFrames(frameCount)
        await loadDMAEntries(dmaOffset)
        return {
          frames: frameCount ? new Array(frameCount).fill(0) : frames,
          tileMaps: await loadTileMaps(dmaOffset),
          vram: await loadVRAMTiles()
        }
      }

      this.loadSamusDeathPose = async function () {
        const { START_OFFSET, SIZE } = DEATH_POSE
        const startOffset = parseInt(START_OFFSET, 16)
        const tiles =
          await getOffsetData(startOffset, parseInt(SIZE, 16))
        return {
          _address: `$${startOffset.toString(16)}`,
          _id: startOffset,
          tiles: chunk(tiles, 0x20).map(function (it, i) {
            return {
              _address: `$${(startOffset + (i * 0x20)).toString(16)}`,
              _id: startOffset + (i * 0x20),
              data: bytesToPixels(it)
            }
          })
        }
      }

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
        debugger
        await each(tiles, async tile => {
          const buff = this.tileDataToVRAMBuffers(tile)
          await setOffsetData(buff[0], tile._id, buff[0].length)
          await setOffsetData(buff[1], tile._id + 16, buff[1].length)
        })
      }
    }
  }
)
