<h1>SPARTA : Samus Palette &amp; Art & Repointing Tool App</h1>
<h2>(formerly known as Super Munchtroid)</h2>

<img alt="Super Munchtroid header" title="SPARTA" src="https://raw.githubusercontent.com/munchyMouth/super-munchtroid/master/src-electron/icons/linux-512x512.png" />

----

### Downloads
#### 2.29.0
- <a href="https://drive.google.com/file/d/1B1Sxza9HBlnPAGf-F-AL4XX19s422Dd7/view?usp=sharing">Super Munchtroid-linux-x64 2.29.0</a>
- <a href="https://drive.google.com/file/d/1k6wGAJtaIYDEXRKm4BrF3Bu2Rgo6UblN/view?usp=sharing">Super Munchtroid-win32-x64 2.29.0</a>

### Documentation
- <a href="https://drive.google.com/file/d/1dpVqQFGf1IFnNqHQtrXlWy0m_3EAYzyP/view?usp=sharing">Latest Manual</a>
- <a href="http://forum.metroidconstruction.com/index.php/topic,4917.0.html">News</a>
- <a href="https://www.youtube.com/watch?v=YQ3cZvTpn-Y&feature=youtu.be">Video Tutorial</a>
- <a href="https://youtu.be/vdhjD_CzNHM">2.6.1 up-to 2.10.0 update video</a>

2.29.0 Features
- beam cursor management for sparks and beams
- massively improved palette controls and palette menu bug fixes
- the SPARTA Repointing Tool
- missile fin controls

(NOTE: Some fins are used for multiple poses; SPARTA only wires those poses up once. For a full list of missile fin poses, please visit http://patrickjohnston.org/bank/90#C9DD . *ALL* the addresses listed at that point in the code are Lo addresses that map to the PC addresses recorded in SPARTA's SamusPoses.json))

#### 2.20.2
2.20.2 Features
- arrow key control of vram (while focused)
- rotate 90° control for editor
- switching off/on beam controls with buttons
- better confirm dialogs
- fixed palette undo
- added `ctrl + up | down` to navigate poses globally
- shortcut `ctrl + o` to open files

#### 2.18.0
- project renamed "SPARTA" :P
- support for setting beam offsets
- collapsible panels for sprite manager & beam editor
- added help modal and events
- some general code tidying (under the hood stuff, cos this project got massive!)

#### 2.16.2
- ctrl+left/right events matched up to frame inc/dec
- ctrl+shift+s setup for doing save to sprites and vram
- added help modal and events

#### 2.15.0
- pixel-flip support added
- added variably colored sprite masks
- added palette copy/paste
- added shortcut for show/hide settings

#### 2.12.0
- bug fixes
- the crystal flash palette
- support for conventional shortcuts for Editor window: copy/paste/undo/redo/save tile

#### 2.10.0
- fixed saves
- pixel-shifting
- 16x16px editing

#### 2.6.1
2.6.1 Features special poses, a search bar, significant bug/palette fixes and frame by frame loading (ergo, massive performance boost)

#### 2.3.2
2.3.2 fixes the default lift pose's use of a redundant tile in Common Sprites by blanking the redundant tile. Also decouples the majority of CSS logic for compnents into separate files

#### 2.3.0
2.3.0 added what should hopefully be *all* of Samus' palettes.

#### 2.2.0
2.2.0 exposed all ROM statics in libs/TableData.json

#### 2.1.0
2.1.0 added a significant fix to file loading (which may improve performance as well as preventing crashes) and exposes the pose and palette json files so users can add their own custom data

#### 2.0.0 Beta
2.0.0 Beta. First release

---------

### Installation

No installation required, simply execute as follows:

#### windows

*Requires Windows 10*
simply download, unzip and double-click on the `.exe` (in the unlikely, but not impossible, event that I have mixed things up and there is no `.exe`, check the Linux download link instead! If it has a `.exe`, that's the one you want!)

#### Linux

*Tested on Ubuntu 16, may not work on older distro's*
Download, unzip, navigate to the file directory in terminal and type the following within it:

```shell
./SPARTA
```

(pre-sparta:)
```shell
./Super\ Munchtroid
```

---------
