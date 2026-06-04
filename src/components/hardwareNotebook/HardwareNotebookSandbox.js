import React, { useCallback, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import {
  HARDWARE_NOTEBOOK_NOTES,
  HARDWARE_NOTEBOOK_STORAGE_KEY,
} from "../../data/hardwareNotebookNotes.js"
import { NOTE_ASSET } from "./constants.js"
import { NoteCanvas } from "./NoteCanvas.js"
import { StringPinLayer } from "./StringPinLayer.js"
import { useNoteDrag } from "./useNoteDrag.js"

function buildInitialState(notes) {
  /** @type {Record<string, { xPct: number, yPct: number, zIndex: number, rotateDeg: number }>} */
  const states = {}
  for (const note of notes) {
    states[note.id] = {
      xPct: note.start.xPct,
      yPct: note.start.yPct,
      zIndex: note.zIndex,
      rotateDeg: note.start.rotateDeg ?? 0,
    }
  }
  return states
}

function loadPersistedLayout(notes) {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(HARDWARE_NOTEBOOK_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return null
    const base = buildInitialState(notes)
    for (const note of notes) {
      const saved = parsed[note.id]
      if (!saved) continue
      base[note.id] = {
        xPct: typeof saved.xPct === "number" ? saved.xPct : base[note.id].xPct,
        yPct: typeof saved.yPct === "number" ? saved.yPct : base[note.id].yPct,
        zIndex: typeof saved.zIndex === "number" ? saved.zIndex : base[note.id].zIndex,
        rotateDeg:
          typeof saved.rotateDeg === "number" ? saved.rotateDeg : base[note.id].rotateDeg,
      }
    }
    return base
  } catch {
    return null
  }
}

function persistLayout(states) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(HARDWARE_NOTEBOOK_STORAGE_KEY, JSON.stringify(states))
  } catch {
    /* quota / private mode */
  }
}

export function HardwareNotebookSandbox() {
  const sandboxRef = useRef(null)
  const canvasRef = useRef(null)
  const noteRefs = useRef({})
  const maxZRef = useRef(
    Math.max(...HARDWARE_NOTEBOOK_NOTES.map((n) => n.zIndex), 0) + 10
  )

  const [noteStates, setNoteStates] = useState(() =>
    loadPersistedLayout(HARDWARE_NOTEBOOK_NOTES) ??
      buildInitialState(HARDWARE_NOTEBOOK_NOTES)
  )

  const onBringToFront = useCallback((noteId) => {
    maxZRef.current += 1
    const z = maxZRef.current
    setNoteStates((prev) => {
      const next = { ...prev, [noteId]: { ...prev[noteId], zIndex: z } }
      persistLayout(next)
      return next
    })
  }, [])

  const onMoveNote = useCallback((noteId, xPct, yPct) => {
    setNoteStates((prev) => {
      const next = {
        ...prev,
        [noteId]: { ...prev[noteId], xPct, yPct },
      }
      persistLayout(next)
      return next
    })
  }, [])

  const { dragVisual, bindNotePointerDown, isDragging } = useNoteDrag({
    sandboxRef,
    onBringToFront,
    onMoveNote,
  })

  const dragNote = dragVisual
    ? HARDWARE_NOTEBOOK_NOTES.find((n) => n.id === dragVisual.noteId)
    : null

  const dragState = dragNote ? noteStates[dragNote.id] : null

  return (
    <SandboxRoot ref={sandboxRef} $isDragging={isDragging}>
      <NoteCanvas
        notes={HARDWARE_NOTEBOOK_NOTES}
        noteStates={noteStates}
        draggingId={dragVisual?.noteId ?? null}
        bindNotePointerDown={bindNotePointerDown}
        canvasRef={canvasRef}
        noteRefs={noteRefs}
      />

      <StringPinLayer
        sandboxRef={sandboxRef}
        noteRefs={noteRefs}
      />

      {dragVisual && dragNote && (
        <DragGhost
          style={{
            left: dragVisual.x,
            top: dragVisual.y,
            transform: `translate(-50%, -50%) rotate(${dragState?.rotateDeg ?? dragNote.start.rotateDeg ?? 0}deg)`,
          }}
          aria-hidden
        >
          <img src={NOTE_ASSET} alt="" draggable={false} />
        </DragGhost>
      )}
    </SandboxRoot>
  )
}

const SandboxRoot = styled.div`
  position: relative;
  width: calc(100% + 2 * var(--page-padding));
  max-width: min(100vw, calc(var(--max-width) + 2 * var(--page-padding)));
  margin-left: calc(-1 * var(--page-padding));
  margin-right: calc(-1 * var(--page-padding));
  min-height: calc(100vh - 12rem);
  user-select: ${({ $isDragging }) => ($isDragging ? "none" : "auto")};
  background: transparent;
`

const DragGhost = styled.div`
  position: absolute;
  z-index: 200;
  width: min(220px, 32vw);
  max-width: 280px;
  pointer-events: none;
  filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.2));

  img {
    width: 100%;
    height: auto;
    display: block;
    background: transparent;
  }
`

export default HardwareNotebookSandbox
