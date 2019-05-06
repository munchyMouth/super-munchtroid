THE LIBS FOLDER

The settings files in this folder control pretty much all of the stuff needed to load your ROM.

- SamusPoses.json
  .contains the list of poses you find in the pose drop down menu

- PalettePointers.json
  . contains the list of palettes you find in the palette drop down menu
  . the number of cycles within a given palette is calculated by n * 32 (e.g. 4 cycles = 128)

- TableData.json
  . a complete list of every static pointer SMunch requires to load your ROM.
  . be extra careful when editing this file!

It is recommended that you run Munchtroid in Linux or from a command prompt if you wanna make major changes to TableData.json as some exception messages will only appear in a shell window.
