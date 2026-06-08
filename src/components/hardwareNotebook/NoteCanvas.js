import React from "react"
import styled from "styled-components"
import { DraggableNote } from "./DraggableNote.js"

export function NoteCanvas({
  notes,
  noteStates,
  draggingId,
  bindNotePointerDown,
  onNudgeNote,
  canvasRef,
  noteRefs,
}) {
  return (
    <CanvasRoot ref={canvasRef} aria-label="Hardware ideas board — drag notes anywhere">
      {notes.map((note) => {
        const state = noteStates[note.id]
        const isDragging = draggingId === note.id
        return (
          <DraggableNote
            key={note.id}
            ref={(el) => {
              if (noteRefs?.current) noteRefs.current[note.id] = el
            }}
            noteId={note.id}
            label={note.label}
            xPct={state?.xPct ?? note.start.xPct}
            yPct={state?.yPct ?? note.start.yPct}
            rotateDeg={state?.rotateDeg ?? note.start.rotateDeg ?? 0}
            zIndex={state?.zIndex ?? note.zIndex}
            isDragging={isDragging}
            onPointerDown={bindNotePointerDown(note.id)}
            onNudge={(deltaX, deltaY) => onNudgeNote(note.id, deltaX, deltaY)}
          />
        )
      })}
    </CanvasRoot>
  )
}

const CanvasRoot = styled.div`
  position: relative;
  width: 100%;
  min-height: calc(100vh - 12rem);
  overflow: visible;
  background: transparent;
`

export default NoteCanvas
