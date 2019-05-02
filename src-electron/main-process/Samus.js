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
      const { each, pojoToSpriteBuffer, setOffsetData } = this

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

      this.saveSpriteToROM = async function (pojo) {
        const buff = pojoToSpriteBuffer(pojo)
        await setOffsetData(buff, pojo._id, buff.length)
      }

      this.saveSpritesToROM = async function (pojoArray) {
        await each(pojoArray, async pojo => {
          const buff = pojoToSpriteBuffer(pojo)
          await setOffsetData(buff, pojo._id, buff.length)
        })
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
