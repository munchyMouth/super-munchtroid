import { dialog } from 'electron'

import { SAMUS_POWERSUIT } from '../../libs/PalettePointers.json'
import Samus from './Samus'
import Palette from './Palette'

export const getSubmenu = function (event, mainWindow) {
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
            const palettes = await Palette({ filePath })
              .getPalettesById(SAMUS_POWERSUIT)
            const samus = await Samus({ filePath }).load(0)
            event.sender.send('ROM Loaded', { ...samus, filePath, palettes })
          }
        } catch (e) {
          event.sender.send('ROM Error', {
            type: 'RomMainLoadException',
            title: 'Failed to load your ROM: Error in main',
            message: e.message
          })
        }
      }
    },
    {
      label: 'save'
    }
  ]
}
