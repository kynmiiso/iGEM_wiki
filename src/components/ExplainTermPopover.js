import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { withPrefix } from "gatsby"
import styled, { css, keyframes } from "styled-components"

/** Source: `src/components/wiki assets MOCKUP/pop up.png` */
const TEXT_BOX_SHELL = withPrefix("/wiki-mockup/wiki-front-pop-up.png")

/** Fixed popover size (px) — does not change when the window resizes. */
export const POPOVER_WIDTH_PX = 400

export const POPOVER_GAP_PX = 12

/** Lightning-bolt tip: fraction in from the popover’s left edge. */
const BOLT_TIP_X_FRAC = 0.36

/** height ÷ width of `pop up.png` (568×355) for layout before the image loads. */
const SHELL_ASPECT = 355 / 568

const POPOVER_POP_MS = 420

const popoverPopIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.2) rotate(-8deg);
  }
  45% {
    opacity: 1;
    transform: scale(1.14) rotate(4deg);
  }
  70% {
    transform: scale(0.94) rotate(-3deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(-2deg);
  }
`

function measureButton(el) {
  const r = el.getBoundingClientRect()
  return {
    centerX: r.left + r.width / 2,
    top: r.top,
    bottom: r.bottom,
    width: r.width,
    height: r.height,
  }
}

function layoutFromButton(btn, popHeight) {
  const popW = POPOVER_WIDTH_PX
  const popH = popHeight
  const gap = POPOVER_GAP_PX
  const boltX = popW * BOLT_TIP_X_FRAC

  const left = btn.centerX - boltX
  const top = btn.top - gap - popH

  return { left, top, width: popW }
}

/**
 * Glossary term + fixed-size popover portaled to document.body so it is never
 * clipped by the mockup overlays. Position tracks the underlined word on scroll.
 */
export function ExplainTerm({ term, explanation, className }) {
  const popoverId = useId()
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const popoverRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const coarsePointerRef = useRef(false)

  const updatePosition = useCallback(() => {
    const btn = buttonRef.current
    if (!btn) return
    const m = measureButton(btn)
    if (m.width <= 0 && m.height <= 0) return

    const popEl = popoverRef.current
    const popH =
      popEl?.offsetHeight > 0
        ? popEl.offsetHeight
        : Math.round(POPOVER_WIDTH_PX * SHELL_ASPECT)

    setPos(layoutFromButton(m, popH))
  }, [])

  const show = useCallback(() => setOpen(true), [])
  const hide = useCallback(() => {
    setOpen(false)
    setPos(null)
  }, [])

  useLayoutEffect(() => {
    if (!open) return undefined
    updatePosition()
    const raf = requestAnimationFrame(updatePosition)
    window.addEventListener("scroll", updatePosition, { passive: true, capture: true })
    window.addEventListener("resize", updatePosition, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", updatePosition, { capture: true })
      window.removeEventListener("resize", updatePosition)
    }
  }, [open, updatePosition])

  const onKeyDown = useCallback(
    (ev) => {
      if (ev.key === "Escape") {
        ev.preventDefault()
        hide()
        buttonRef.current?.blur()
      }
    },
    [hide]
  )

  const onTermClick = useCallback(() => {
    if (!coarsePointerRef.current) return
    setOpen((v) => {
      if (!v) setPos(null)
      return !v
    })
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined
    const mq = window.matchMedia("(pointer: coarse)")
    const sync = () => {
      coarsePointerRef.current = mq.matches
    }
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    if (!open || !coarsePointerRef.current) return undefined
    const onDocPointer = (ev) => {
      if (rootRef.current && !rootRef.current.contains(ev.target)) hide()
    }
    document.addEventListener("pointerdown", onDocPointer)
    return () => document.removeEventListener("pointerdown", onDocPointer)
  }, [open, hide])

  return (
    <>
      <TermRoot
        ref={rootRef}
        className={className}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onKeyDown={onKeyDown}
      >
        <TermButton
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-describedby={open ? popoverId : undefined}
          onClick={onTermClick}
        >
          {term}
        </TermButton>
      </TermRoot>
      {typeof document !== "undefined" &&
        open &&
        createPortal(
          <PopoverOuter
            ref={popoverRef}
            id={popoverId}
            role="tooltip"
            aria-label={explanation || undefined}
            style={
              pos
                ? {
                    left: pos.left,
                    top: pos.top,
                    width: pos.width,
                    bottom: "auto",
                    right: "auto",
                    visibility: "visible",
                  }
                : {
                    left: -9999,
                    top: -9999,
                    width: POPOVER_WIDTH_PX,
                    bottom: "auto",
                    right: "auto",
                    visibility: "hidden",
                  }
            }
          >
            <PopoverInner>
              <ShellImg src={TEXT_BOX_SHELL} alt="" aria-hidden onLoad={updatePosition} />
            </PopoverInner>
          </PopoverOuter>,
          document.body
        )}
    </>
  )
}

const TermRoot = styled.span`
  display: inline-block;
  width: max-content;
  vertical-align: baseline;
`

const TermButton = styled.button`
  display: inline;
  margin: 0;
  padding: 0 0.12em;
  border: none;
  background: linear-gradient(
    to bottom,
    transparent 58%,
    #e63946 58%,
    #e63946 88%,
    transparent 88%
  );
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: help;
  border-radius: 2px;

  &:focus-visible {
    outline: 2px solid var(--color-accent, #c8f050);
    outline-offset: 3px;
  }
`

const PopoverOuter = styled.div`
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.4));
`

const PopoverInner = styled.div`
  width: 100%;
  transform-origin: 50% 100%;
  animation: ${popoverPopIn} ${POPOVER_POP_MS}ms cubic-bezier(0.34, 1.45, 0.64, 1) forwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: rotate(-2deg);
  }
`

const ShellImg = styled.img`
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
  pointer-events: none;
`

export default ExplainTerm
