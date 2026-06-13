import { withPrefix } from "gatsby"

export const NOTE_ASSET = withPrefix("/hardware-notebook/note-taped-yellow.png")

/** Fraction of note width/height for string anchors (tape corners). */
export const NOTE_ANCHOR_FRAC = {
  topLeft: { x: 0.12, y: 0.12 },
  topRight: { x: 0.88, y: 0.12 },
  bottomLeft: { x: 0.12, y: 0.88 },
  bottomRight: { x: 0.88, y: 0.88 },
}

export const DRAG_THRESHOLD_PX = 4
