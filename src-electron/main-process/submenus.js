import { dialog } from 'electron'
import { readFileSync } from 'fs'
import path from 'path'

import Beam from './Beam'
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

const BEAM_DATA = JSON.parse(
  readFileSync(
    path.resolve(
      projectDirectory,
      'libs',
      'BeamData.json')))

export const getSubmenu = function (event, mainWindow, POSES) {
  return [
    {
      label: 'load ROM [ctrl o]',
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
            const beam = await Beam({ filePath }).load()
            event.sender.send(
              'ROM Loaded', { ...samus, beam, filePath, palettes, BEAM_DATA, POSES, PALETTES, SPECIAL_POSES })
          }
        } catch (e) {
          event.sender.send('ROM Error', {
            type: 'RomMainLoadException',
            title: 'Failed to load your ROM: Error in main',
            message: [e.message]
          })
        }
      }
    },
    {
      label: 'View Shortcuts [F1]',
      click () {
        event.sender.send('Shortcut Help', true)
      }
    }
  ]
}
