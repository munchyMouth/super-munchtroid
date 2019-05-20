import stampit from 'stampit'

import RomData from './RomData.js'

// ROM Palette format = 0BBBBBGG GGGRRRRR (1st bit is redundant)
// to convert each 5 bits of color to 255 simply >> 3
// to convert back, reverse the process!
export default stampit(RomData, {
  init () {
    // PRIVATE -----------------------------------------------------------------
    const { chunk, each, getOffsetData, setOffsetData, loRomToPc } = this

    function shiftHexTo5BitChunks (it) {
      let shifted = (parseInt(it, 16) >> 3).toString(2)
      while (shifted.length < 5) shifted = 0 + shifted
      return shifted
    }

    function toHex (bits) {
      let hex = ''
      for (let i = 0; i < 3; i++) {
        let h = (parseInt(bits[i], 2) << 3).toString(16)
        hex += h.length === 1 ? '0' + h : h
      }
      console.log(hex)
      return `#${hex}`
    }

    function toRRGGBB (buffer) { // e.g. '#3de7f8'
      return toHex(chunk(
        buffer.reduce((str, byte) => {
          let bits = byte.toString(2)
          while (bits.length < 8) bits = '0' + bits
          return str + bits
        }, '').substring(1), 5).reverse())
    }

    function to16BitString (it) { // e.g. '0001001000100100001'
      return '0'.concat(
        it.replace('#', '')
          .match(/[0-9A-F]{2}/gi)
          .reverse()
          .map(shiftHexTo5BitChunks)
          .toString() // ---------- convert whole array to string
          .replace(/,/g, '')) // -- remove commas from that string
    }

    function toROMFormat (it) { // e.g. <Buffer 3b e4 />
      return Buffer.from(
        to16BitString(it)
          .match(/[0-1]{8}/g)
          .map(k => parseInt(k, 2))
          .reverse())
    }

    // PUBLIC ------------------------------------------------------------------
    this.getPalettesByIndex = async function (index = 0) {
      const { id, length } = this.loadSettingsFile('PalettePointers')[index]
      const romAddr = chunk(id, 2).reverse().map(it => parseInt(it, 16))
      const address = loRomToPc(romAddr[0], romAddr[1], romAddr[2])
      const data = await getOffsetData(address, length)
      return chunk(chunk(data, 2).map(it => toRRGGBB(it.reverse())), 16)
        .map((palette, i) => {
          return {
            _id: address + (i * 32),
            _address: `$${(address + (i * 32)).toString(16)}`,
            palette
          }
        })
    }

    this.saveToROM = async function (palettes) {
      await each(palettes, async ({ _id, palette }) => {
        const p = Buffer.concat(palette.map(toROMFormat))
        await setOffsetData(p, _id, p.length)
      })
    }
  }
})
