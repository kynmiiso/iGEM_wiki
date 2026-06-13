import React, { useLayoutEffect, useState } from "react"
import styled from "styled-components"
import {
  HARDWARE_NOTEBOOK_FEATURE_FLAGS,
  HARDWARE_NOTEBOOK_NOTES,
} from "../../data/hardwareNotebookNotes.js"
import { getNoteAnchorPoint } from "./noteAnchors.js"

/**
 * SVG strings between linked notes. Hidden until stringPin flag is enabled.
 */
export function StringPinLayer({ sandboxRef, noteRefs }) {
  const [paths, setPaths] = useState([])

  useLayoutEffect(() => {
    if (!HARDWARE_NOTEBOOK_FEATURE_FLAGS.stringPin) {
      setPaths([])
      return undefined
    }

    const update = () => {
      const sandbox = sandboxRef.current
      if (!sandbox) return
      const sandboxRect = sandbox.getBoundingClientRect()
      const next = []

      for (const note of HARDWARE_NOTEBOOK_NOTES) {
        if (!note.links?.length) continue
        const fromEl = noteRefs.current?.[note.id]
        if (!fromEl) continue

        for (const link of note.links) {
          const toEl = noteRefs.current?.[link.to]
          if (!toEl) continue

          const fromRect = fromEl.getBoundingClientRect()
          const toRect = toEl.getBoundingClientRect()
          const a = getNoteAnchorPoint(fromRect, sandboxRect, link.fromAnchor)
          const b = getNoteAnchorPoint(toRect, sandboxRect, link.toAnchor)

          const midX = (a.x + b.x) / 2
          const midY = (a.y + b.y) / 2 - 24
          const d = `M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`
          next.push({ key: `${note.id}-${link.to}-${link.fromAnchor}`, d })
        }
      }

      setPaths(next)
    }

    update()
    window.addEventListener("scroll", update, { passive: true, capture: true })
    window.addEventListener("resize", update, { passive: true })
    return () => {
      window.removeEventListener("scroll", update, { capture: true })
      window.removeEventListener("resize", update)
    }
  }, [sandboxRef, noteRefs])

  if (!HARDWARE_NOTEBOOK_FEATURE_FLAGS.stringPin) return null

  return (
    <StringsSvg aria-hidden>
      {paths.map(({ key, d }) => (
        <path key={key} d={d} />
      ))}
    </StringsSvg>
  )
}

const StringsSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 50;
  overflow: visible;

  path {
    fill: none;
    stroke: #8b4513;
    stroke-width: 2;
    stroke-linecap: round;
    opacity: 0.75;
  }
`

export default StringPinLayer
