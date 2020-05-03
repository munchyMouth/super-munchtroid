import stampit from 'stampit'
import path from 'path'
import { close, open, read, readFileSync, write } from 'fs'

export default stampit({
  props: {
    dmaEntries: [],
    frameOffset: 0,
    frames: 0,
    pose: 0
  },
  init ({ filePath }) {
    // PRIVATE -----------------------------------------------------------------
    const cleanFilePath = (filePath instanceof Array && filePath.length)
      ? filePath[0]
      : filePath

    function setArrayFormat (data, type) {
      switch (type) {
        case 'hex': return data.reverse().toString('hex')
        case 'int': return data.readUIntLE(0, 2)
      }
    }

    // PUBLIC ------------------------------------------------------------------
    this.chunk = function (arr, size = 2, R = []) {
      for (let i = 0, len = arr.length; i < len; i += size) {
        R.push(arr.slice(i, i + size))
      }
      return R
    }

    this.each = async (items, fn) => {
      if (items && items.length) {
        await Promise.all(
          items.map(async (item) => {
            await fn(item)
          }))
      }
    }

    this.getPCAddressFromBufferData = function (bufferAddress, bank) {
      return this.loRomToPc(bufferAddress[0], bufferAddress[1], bank)
    }.bind(this)

    this.reduce = async (items, fn, initialValue) => {
      await this.each(
        items, async (item) => {
          initialValue = await fn(initialValue, item)
        })
      return initialValue
    }

    this.loRomToPc = function (lo, hi, bank, header = false) {
      return ((lo & 255) +
        (256 * (hi & 255)) +
        (32768 * (bank - 0x80)) -
        (header ? 0 : 512) -
        32256)
    }

    // THIS IS WHERE THE FILE LOADING MAGIC HAPPENS!!!
    this.getOffsetData = function (offset, length) {
      return new Promise(function (resolve, reject) {
        try {
          open(cleanFilePath, 'r', function (err, fd) {
            if (!err) {
              const buff = Buffer.alloc(length)
              read(fd, buff, 0, length, offset, function (inErr, n, buffer) {
                close(fd, closeErr => { if (closeErr) throw closeErr })
                if (!inErr) resolve(buffer)
                else throw inErr
              })
            } else throw err
          })
        } catch (e) {
          reject(e)
        }
      })
    }

    this.loadSettingsFile = function (fileName) {
      return JSON.parse(
        readFileSync(
          path.resolve(
            __dirname.replace(
              (process.env.PROD)
                ? /[/|\\]resources[/|\\]app.asar/g
                : 'src-electron/main-process', ''),
            'libs',
            `${fileName}.json`)))
    }

    this.reverseByteWords = function (data, format = 'int') {
      switch (true) {
        case data instanceof Buffer:
          return this.chunk(data, 2).map(it => setArrayFormat(it, format))

        case typeof data === 'string' && data.length === 4:
          let i = data.subString(0, 2)
          return [data.subString(2, 4) + i]
      }
    }

    // THIS IS WHERE THE FILE SAVING MAGIC HAPPENS!!!
    this.setOffsetData = async function (buff, offset) {
      return new Promise(function (resolve, reject) {
        try {
          open(cleanFilePath, 'r+', function (err, fd) {
            if (!err) {
              write(fd, buff, 0, buff.length, offset, function (inErr) {
                close(fd, closeErr => { if (closeErr) throw closeErr })
                if (!inErr) resolve(true)
                else throw inErr
              })
            } else throw err
          })
        } catch (e) {
          reject(e)
        }
      })
    }
  }
})
