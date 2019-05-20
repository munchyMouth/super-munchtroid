import { dialog } from 'electron'
import { readFileSync } from 'fs'
import path from 'path'

import Samus from './Samus'
import Palette from './Palette'

const projectDirectory = __dirname.replace(
  (process.env.PROD)
    ? /[/|\\]resources[/|\\]app.asar/g
    : 'src-electron/main-process', '')

const PALETTES = JSON.parse(
  readFileSync(
    path.resolve(
      projectDirectory,
      'libs',
      'PalettePointers.json')))

const SPECIAL_POSES = JSON.parse(
  readFileSync(
    path.resolve(
      projectDirectory,
      'libs',
      'SamusSpecialPoses.json')))

export const getSubmenu = function (event, mainWindow, POSES) {
  return [
    {
      label: 'load ROM',
      async click () {
        try {
          const filePath = dialog.showOpenDialog(
            mainWindow, {
              filters: [{
                name: 'ROM File',
                extensions: ['smc', 'sfc']
              }]
            })
          if (filePath && filePath.length) {
            const palettes = await Palette({ filePath }).getPalettesByIndex()
            const samus = await Samus({ filePath }).load(0)
            event.sender.send(
              'ROM Loaded', { ...samus, filePath, palettes, POSES, PALETTES, SPECIAL_POSES })
          }
        } catch (e) {
          event.sender.send('ROM Error', {
            type: 'RomMainLoadException',
            title: 'Failed to load your ROM: Error in main',
            message: [e.message]
          })
        }
      }
    }
  ]
}
