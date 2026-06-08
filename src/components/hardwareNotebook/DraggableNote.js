import React, { forwardRef } from "react"
import styled from "styled-components"
import { NOTE_ASSET } from "./constants.js"

/**
 * Single yellow taped sticky-note PNG on the free canvas.
 */
export const DraggableNote = forwardRef(function DraggableNote(
  {
    noteId,
    label,
    xPct,
    yPct,
    rotateDeg = 0,
    zIndex,
    isDragging,
    onPointerDown,
    onNudge,
    style,
  },
  ref
) {
  return (
    <NoteWrap
      ref={ref}
      data-note-id={noteId}
      $xPct={xPct}
      $yPct={yPct}
      $rotateDeg={rotateDeg}
      $zIndex={zIndex}
      $isDragging={isDragging}
      style={style}
      role="button"
      tabIndex={0}
      aria-label={`${label}. Use arrow keys to move this note.`}
      aria-grabbed={isDragging}
      onPointerDown={onPointerDown}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 5 : 1
        const deltas = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
        }
        const delta = deltas[event.key]
        if (!delta) return
        event.preventDefault()
        onNudge?.(...delta)
      }}
    >
      <NoteImg src={NOTE_ASSET} alt="" draggable={false} />
    </NoteWrap>
  )
})

const NoteWrap = styled.div`
  position: absolute;
  left: ${({ $xPct }) => `${$xPct}%`};
  top: ${({ $yPct }) => `${$yPct}%`};
  transform: translate(-50%, -50%) rotate(${({ $rotateDeg }) => $rotateDeg}deg);
  z-index: ${({ $zIndex }) => $zIndex};
  width: min(220px, 32vw);
  max-width: 280px;
  cursor: ${({ $isDragging }) => ($isDragging ? "grabbing" : "grab")};
  touch-action: none;
  user-select: none;
  opacity: ${({ $isDragging }) => ($isDragging ? 0 : 1)};
  transition: opacity 0.12s ease;
  background: transparent;

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 4px;
  }
`

const NoteImg = styled.img`
  width: 100%;
  height: auto;
  display: block;
  background: transparent;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.15));
  pointer-events: none;
`

export default DraggableNote
