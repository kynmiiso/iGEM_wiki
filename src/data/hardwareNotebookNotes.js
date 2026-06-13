/**
 * Hardware notebook sticky-note registry.
 * ids: stable kebab-case for graph edges + localStorage.
 * links: used when HARDWARE_NOTEBOOK_FEATURE_FLAGS.stringPin is true.
 * start: default position on the free canvas (% of sandbox).
 */

export const HARDWARE_NOTEBOOK_FEATURE_FLAGS = {
  stringPin: false,
}

/** @typedef {'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'} NoteAnchor */

/**
 * @typedef {Object} NoteLink
 * @property {string} to
 * @property {NoteAnchor} fromAnchor
 * @property {NoteAnchor} toAnchor
 */

/**
 * @typedef {Object} HardwareNoteDef
 * @property {string} id
 * @property {string} label - screen readers only; copy lives on the PNG
 * @property {{ xPct: number, yPct: number, rotateDeg?: number }} start
 * @property {number} zIndex
 * @property {NoteLink[]} links
 */

/** @type {HardwareNoteDef[]} */
export const HARDWARE_NOTEBOOK_NOTES = [
  {
    id: "idea-01-power",
    label: "Power routing",
    start: { xPct: 22, yPct: 28, rotateDeg: -5 },
    zIndex: 1,
    links: [{ to: "idea-02-enclosure", fromAnchor: "topRight", toAnchor: "bottomLeft" }],
  },
  {
    id: "idea-02-enclosure",
    label: "Enclosure",
    start: { xPct: 38, yPct: 32, rotateDeg: 4 },
    zIndex: 2,
    links: [{ to: "idea-01-power", fromAnchor: "bottomLeft", toAnchor: "topRight" }],
  },
  {
    id: "idea-03-sensors",
    label: "Sensors",
    start: { xPct: 26, yPct: 48, rotateDeg: 3 },
    zIndex: 3,
    links: [{ to: "idea-04-firmware", fromAnchor: "bottomRight", toAnchor: "topLeft" }],
  },
  {
    id: "idea-04-firmware",
    label: "Firmware",
    start: { xPct: 44, yPct: 52, rotateDeg: -3 },
    zIndex: 4,
    links: [],
  },
  {
    id: "idea-05-fluidics",
    label: "Fluidics",
    start: { xPct: 30, yPct: 66, rotateDeg: -4 },
    zIndex: 5,
    links: [{ to: "idea-06-safety", fromAnchor: "topLeft", toAnchor: "topRight" }],
  },
  {
    id: "idea-06-safety",
    label: "Safety interlocks",
    start: { xPct: 48, yPct: 70, rotateDeg: 5 },
    zIndex: 6,
    links: [],
  },
]

export const HARDWARE_NOTEBOOK_STORAGE_KEY = "hardware-notebook-layout-v2"
