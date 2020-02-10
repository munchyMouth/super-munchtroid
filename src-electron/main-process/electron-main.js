'use strict'

import { app, BrowserWindow, globalShortcut, ipcMain, Menu } from 'electron'
import { readFileSync } from 'fs'
import path from 'path'

// case evt.keyCode === 18 && evt.key.toLowerCase() === 's' && evt.ctrlKey:
//   console.log('FOUND')
//   break
import Palette from './Palette'
import Samus from './Samus'
import { getSubmenu } from './submenus.js'

const projectDirectory = __dirname.replace(
  (process.env.PROD)
    ? /[/|\\]resources[/|\\]app.asar/g
    : 'src-electron/main-process', '')

const POSES = JSON.parse(
  readFileSync(
    path.resolve(
      projectDirectory,
      'libs',
      'SamusPoses.json')))

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = require('path').join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

let mainWindow
function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    width: 1000,
    height: 600,
    useContentSize: true
  })

  mainWindow.loadURL(process.env.APP_URL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('attachMenuEvents', (event) => {
  const menu = Menu.buildFromTemplate([{
    label: 'File', submenu: getSubmenu(event, mainWindow, POSES)
  }])
  Menu.setApplicationMenu(menu)
  globalShortcut.register('CommandOrControl+shift+s', () => {
    event.sender.send('Shortcut Save', true)
  })
})

ipcMain.on('Load Palettes', (event, { filePath, index = 0 }) => {
  try {
    Palette({ filePath })
      .getPalettesByIndex(index)
      .then(function (palettes) {
        event.sender.send('Palettes Loaded', { palettes: palettes, index })
      }, function (e) {
        console.trace(e)
        event.sender.send('Palettes Error', {
          type: 'PaletteMainLoadException',
          title: 'Failed to load a palette: Error in main',
          message: [e.message]
        })
      })
  } catch (e) {
    console.trace(e)
  }
})

// dmaOffset and frameCount are used to load in special poses.
ipcMain.on('Load Pose', (event,
  { filePath,
    index,
    dmaOffset = undefined,
    frameCount = undefined,
    optionsetIndex = undefined,
    specialPoseFrameOverride = undefined
  }) => {
  try {
    Samus({ filePath })
      .load(index, frameCount, dmaOffset)
      .then(function (samus) {
        event.sender.send('Pose loaded', {
          ...samus,
          filePath,
          frameIndex: typeof specialPoseFrameOverride !== 'undefined'
            ? (dmaOffset / 4) - specialPoseFrameOverride
            : dmaOffset / 4,
          pose: optionsetIndex || index
        })
      }, function (e) {
        console.trace(e)
        event.sender.send('Pose Error', {
          type: 'PoseMainLoadException',
          title: 'Failed to load a pose: Error in main',
          message: [e.message]
        })
      })
  } catch (e) {
    console.trace(e)
  }
})

ipcMain.on('Save Palettes', (event, { filePath, palettes }) => {
  try {
    Palette({ filePath })
      .saveToROM(palettes)
      .then(function (samus) {
        event.sender.send('Palettes Saved', true)
      }, function (e) {
        console.trace(e)
        event.sender.send('Palettes Error', {
          type: 'PaletteMainSaveException',
          title: 'Failed to save a palette: Error in main. ',
          message: [e.message]
        })
      })
  } catch (e) {
    console.trace(e)
  }
})

ipcMain.on('Save Sprite', (event, { filePath, isFirstPose = false, sprite }) => {
  try {
    Samus({ filePath })
      .saveSpriteToROM(isFirstPose, sprite)
      .then(function () {
        event.sender.send('Sprite Saved', true)
      }, function (e) {
        console.trace(e)
        event.sender.send('Sprite Error', {
          type: 'SpriteMainSaveException',
          title: 'Failed to save a sprite: Error in main',
          message: [e.message]
        })
      })
  } catch (e) {
    console.trace(e)
  }
})
ipcMain.on('Save Sprites', (event, { filePath, isFirstPose = false, sprites }) => {
  try {
    Samus({ filePath })
      .saveSpritesToROM(isFirstPose, sprites)
      .then(function () {
        event.sender.send('Sprites Saved', true)
      }, function (e) {
        console.trace(e)
        event.sender.send('Sprites Error', {
          type: 'SpritesMainSaveException',
          title: 'Failed to save sprites: Error in main',
          message: [e.message]
        })
      })
  } catch (e) {
    console.trace(e)
  }
})

ipcMain.on('Save VRAM Tile', (event, { filePath, tile }) => {
  try {
    Samus({ filePath })
      .saveVRAMTileToROM(tile)
      .then(function () {
        event.sender.send('VRAM Tile Saved', true)
      }, function (e) {
        console.trace(e)
        event.sender.send('VRAM Tile Error', {
          type: 'VramTileMainSaveException',
          title: 'Failed to save VRAM Tile: Error in main',
          message: [e.message]
        })
      })
  } catch (e) {
    console.trace(e)
  }
})
ipcMain.on('Save VRAM Tiles', (event, { filePath, tiles, save16x16 = false }) => {
  try {
    Samus({ filePath })
      .saveVRAMTilesToROM(tiles)
      .then(function () {
        event.sender.send('VRAM Tiles Saved', { save16x16 })
      }, function (e) {
        console.trace(e)
        event.sender.send('VRAM Tiles Error', {
          type: 'VramTilesMainSaveException',
          title: 'Failed to save VRAM Tile(s): Error in main',
          message: [e.message]
        })
      })
  } catch (e) {
    console.trace(e)
  }
})
