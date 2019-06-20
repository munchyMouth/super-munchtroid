// The cross tile's data -------------------------------------------------------
// used by:
//  - inaccessible VRAM tiles
//  - the editor if no tile has been selected.
export function createBlankTemplate () {
  return [
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [0, -1, 0, 0, 0, 0, -1, 0],
    [0, 0, -1, 0, 0, -1, 0, 0],
    [0, 0, 0, -1, -1, 0, 0, 0],
    [0, 0, 0, -1, -1, 0, 0, 0],
    [0, 0, -1, 0, 0, -1, 0, 0],
    [0, -1, 0, 0, 0, 0, -1, 0],
    [-1, 0, 0, 0, 0, 0, 0, -1]
  ]
}

// VRAM is too complex to behave reactively; ultimately, it feels more intuitive
// to have a function manually collate update data from a vram instance than
// trying to rig reactivity through some kind of workaround. The optional 2nd
// argument allows you to perform actions on the given VRAM tiles.
export function getUpdatedVramTiles (vram, _callback) {
  // [vram].reduce((arr, frame, frameIndex) => {
  return ['bottom', 'top'].reduce((arr, half) => {
    ['part1', 'part2'].forEach(part => {
      vram[half].parts[part].tiles.forEach((tile, index) => {
        if (tile._updated) {
          if (_callback) _callback({ half, part, tile, index })
          arr.push(tile)
        }
      })
    })
    return arr
  }, [])
  // }, [])
}

// handle weird morph ball logic edge-case -------------------------------------
// (sometimes bottom vram references top vram, just to be annoying!)
// since I'm gonna let users swap back and forth, I implement the reverse too
export function handleIrregularHalfLogic ({ half, vramIndex }) {
  return (half === 'bottom' && vramIndex < 8)
    ? 'top'
    : (half === 'top' && vramIndex > 7
      ? 'bottom'
      : half)
}

export function snakeCaseToUIFormat (string) {
  return string
    .split('_')
    .reduce((str, it) =>
      (str ? (str + ' ') : str) +
      it.substring(0, 1) +
      it.substring(1, it.length)
        .toLowerCase(), '')
}
