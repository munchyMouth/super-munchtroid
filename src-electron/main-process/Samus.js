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
      const { each, loadSettingsFile, pojoToSpriteBuffer, setOffsetData } = this

      const { COMMON_LIFT_POSE_TORSO_TILE } = loadSettingsFile('TableData')

      async function eraseCommonTileForLiftPose (isFirstPose) {
        if (isFirstPose) {
          const buff = Buffer.alloc(32)
          await setOffsetData(
            buff, parseInt(COMMON_LIFT_POSE_TORSO_TILE, 16), buff.length)
        }
      }

      this.load = async function (pose) {
        const { frames, loadVRAMTiles, loadDMAEntries, loadTileMaps } =
          await this.setPose(pose).setFrames()
        await loadDMAEntries()
        return {
          frames,
          tileMaps: await loadTileMaps(),
          vram: await loadVRAMTiles()
        }
      }

      this.manualLoadSpecialPose = async function ({ bottom, top }) {
        const dma = await this.manualLoadDMAData({ bottom, top })
        return {
          vram: [{
            bottom: {
              parts: await this.getVRAMByDMAEntry(dma[0].bottom)
            },
            top: {
              parts: await this.getVRAMByDMAEntry(dma[0].top)
            }
          },
          {
            bottom: {
              parts: await this.getVRAMByDMAEntry(dma[0].bottom)
            },
            top: {
              parts: await this.getVRAMByDMAEntry(dma[0].top)
            }
          },
          {
            bottom: {
              parts: await this.getVRAMByDMAEntry(dma[0].bottom)
            },
            top: {
              parts: await this.getVRAMByDMAEntry(dma[0].top)
            }
          }]
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
