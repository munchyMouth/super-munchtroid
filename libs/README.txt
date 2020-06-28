THE LIBS FOLDER

The settings files in this folder control pretty much all of the stuff needed to load your ROM.

- SamusPoses.json
  . contains the list of poses you find in the pose drop down menu
  . flags poses that have missile fins
  (NOTE: Some fins are used for multiple poses;
    - SPARTA only wires those poses up once.
    - For a full list of missile fin poses, please visit http://patrickjohnston.org/bank/90#C9DD
    - *ALL* the missile fins addresses listed at the link above are Lo addresses that map to the PC addresses in SamusPoses.json)

- SamusSpecialPoses.json
  . contains concealed loading pose and some more obscure poses that are not indexed in the conventional fashion

- PalettePointers.json
  . contains the list of palettes you find in the palette drop down menu
  . the number of cycles within a given palette is calculated by no-of-cycles * 32 (e.g. 4 cycles = 4 * 32 = 128)

- TableData.json
  . a complete list of every static pointer SMunch requires to load your ROM.
  . be extra careful when editing this file!

- BeamData.json
  . all pointers related to beams, charge beam spark and grapple beam spark

It is recommended that you run Munchtroid in Linux or from a command prompt if you wanna make major changes to TableData.json as some exception messages will only appear in a shell window.
