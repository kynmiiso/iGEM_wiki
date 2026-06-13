import { useCallback, useEffect, useRef, useState } from "react"
import { DRAG_THRESHOLD_PX } from "./constants.js"

/**
 * Pointer drag for sticky notes anywhere on the sandbox canvas.
 */
export function useNoteDrag({ sandboxRef, onBringToFront, onMoveNote }) {
  const [dragVisual, setDragVisual] = useState(null)
  const sessionRef = useRef(null)

  const clearSession = useCallback(() => {
    sessionRef.current = null
    setDragVisual(null)
  }, [])

  const clientToSandbox = useCallback(
    (clientX, clientY) => {
      const root = sandboxRef.current
      if (!root) return { x: 0, y: 0 }
      const r = root.getBoundingClientRect()
      return { x: clientX - r.left, y: clientY - r.top }
    },
    [sandboxRef]
  )

  const sandboxPctFromClient = useCallback(
    (clientX, clientY) => {
      const root = sandboxRef.current
      if (!root) return { xPct: 50, yPct: 50 }
      const r = root.getBoundingClientRect()
      const xPct = ((clientX - r.left) / r.width) * 100
      const yPct = ((clientY - r.top) / r.height) * 100
      return {
        xPct: Math.min(96, Math.max(4, xPct)),
        yPct: Math.min(96, Math.max(4, yPct)),
      }
    },
    [sandboxRef]
  )

  const syncVisual = useCallback(
    (clientX, clientY) => {
      const session = sessionRef.current
      if (!session) return
      const pt = clientToSandbox(clientX, clientY)
      setDragVisual({
        noteId: session.noteId,
        x: pt.x - session.offsetX,
        y: pt.y - session.offsetY,
      })
    },
    [clientToSandbox]
  )

  const armDragOffset = useCallback(
    (noteEl, clientX, clientY) => {
      const session = sessionRef.current
      if (!session || !noteEl) return
      const sandbox = sandboxRef.current
      if (!sandbox) return
      const noteRect = noteEl.getBoundingClientRect()
      const sandboxRect = sandbox.getBoundingClientRect()
      const centerX = noteRect.left - sandboxRect.left + noteRect.width / 2
      const centerY = noteRect.top - sandboxRect.top + noteRect.height / 2
      const pt = clientToSandbox(clientX, clientY)
      session.offsetX = pt.x - centerX
      session.offsetY = pt.y - centerY
      session.started = true
      onBringToFront(session.noteId)
    },
    [clientToSandbox, onBringToFront, sandboxRef]
  )

  const bindNotePointerDown = useCallback(
    (noteId) => (e) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()

      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }

      sessionRef.current = {
        noteId,
        pointerId: e.pointerId,
        started: false,
        startClientX: e.clientX,
        startClientY: e.clientY,
        offsetX: 0,
        offsetY: 0,
        lastClientX: e.clientX,
        lastClientY: e.clientY,
      }

      const el = sandboxRef.current?.querySelector(`[data-note-id="${noteId}"]`)
      if (el) {
        armDragOffset(el, e.clientX, e.clientY)
        syncVisual(e.clientX, e.clientY)
      } else {
        const pt = clientToSandbox(e.clientX, e.clientY)
        setDragVisual({ noteId, x: pt.x, y: pt.y })
      }
    },
    [armDragOffset, clientToSandbox, syncVisual, sandboxRef]
  )

  useEffect(() => {
    const onMove = (e) => {
      const session = sessionRef.current
      if (!session || e.pointerId !== session.pointerId) return

      session.lastClientX = e.clientX
      session.lastClientY = e.clientY

      if (!session.started) {
        const dist = Math.hypot(
          e.clientX - session.startClientX,
          e.clientY - session.startClientY
        )
        if (dist < DRAG_THRESHOLD_PX) return

        const noteEl = sandboxRef.current?.querySelector(
          `[data-note-id="${session.noteId}"]`
        )
        if (noteEl) armDragOffset(noteEl, e.clientX, e.clientY)
        else {
          session.started = true
          onBringToFront(session.noteId)
        }
      }

      syncVisual(e.clientX, e.clientY)
    }

    const onUp = (e) => {
      const session = sessionRef.current
      if (!session || e.pointerId !== session.pointerId) return

      const { noteId, started, lastClientX, lastClientY } = session

      if (started) {
        const { xPct, yPct } = sandboxPctFromClient(lastClientX, lastClientY)
        onMoveNote(noteId, xPct, yPct)
      }

      clearSession()
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
    }
  }, [
    armDragOffset,
    clearSession,
    onBringToFront,
    onMoveNote,
    sandboxPctFromClient,
    sandboxRef,
    syncVisual,
  ])

  return {
    dragVisual,
    bindNotePointerDown,
    isDragging: dragVisual != null,
  }
}
