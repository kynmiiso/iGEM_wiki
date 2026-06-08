import { NOTE_ANCHOR_FRAC } from "./constants.js"

/**
 * Anchor position in sandbox-local coordinates (px).
 */
export function getNoteAnchorPoint(noteRect, sandboxRect, anchor) {
  const frac = NOTE_ANCHOR_FRAC[anchor] ?? { x: 0.5, y: 0.5 }
  return {
    x: noteRect.left - sandboxRect.left + noteRect.width * frac.x,
    y: noteRect.top - sandboxRect.top + noteRect.height * frac.y,
  }
}
