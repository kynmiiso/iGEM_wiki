import React, { useEffect, useRef } from "react"
import styled from "styled-components"

/**
 * Scroll-driven "swipe-in" card.
 *
 * As the user scrolls through this box's tall track, an inner card:
 *   1. slides in from the left,
 *   2. holds centered on screen for a stretch,
 *   3. slides back out to the right, exiting the screen.
 *
 * Built as a standalone element so it can recur anywhere on the page (e.g. one
 * per PETase living condition). Drop it into any normal-flow container.
 */

/** Scroll length of the whole enter → hold → exit cycle (viewport heights). */
const TRACK_VH = 150

/** Progress (0–1) checkpoints: finish entering, then start exiting. Widen the */
/** middle for a longer on-screen hold; narrow it to swipe straight through.   */
const ENTER_END = 0.28
const HOLD_END = 0.58

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const lerp = (a, b, t) => a + (b - a) * t

export function SwipeInBox({ eyebrow, title, body, children }) {
  const trackRef = useRef(null)
  const boxRef = useRef(null)

  useEffect(() => {
    if (typeof window === "undefined") return undefined

    const box = boxRef.current
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduceMotion) {
      if (box) box.style.transform = "translate3d(0, 0, 0)"
      return undefined
    }

    let raf = 0
    const update = () => {
      raf = 0
      const track = trackRef.current
      const b = boxRef.current
      if (!track || !b) return

      const rect = track.getBoundingClientRect()
      const vh = window.innerHeight
      const span = Math.max(1, rect.height - vh)
      const p = clamp(-rect.top / span, 0, 1)

      // Distance (px) that fully clears the card off either edge, any viewport.
      const off = window.innerWidth / 2 + b.offsetWidth / 2 + 24

      let x
      if (p <= ENTER_END) x = lerp(-off, 0, p / ENTER_END)
      else if (p <= HOLD_END) x = 0
      else x = lerp(0, off, (p - HOLD_END) / (1 - HOLD_END))

      b.style.transform = `translate3d(${x}px, 0, 0)`
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <Track ref={trackRef} $vh={TRACK_VH}>
      <StickyViewport>
        <Box ref={boxRef}>
          {children || (
            <>
              {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
              {title && <Title>{title}</Title>}
              {body && <Body>{body}</Body>}
            </>
          )}
        </Box>
      </StickyViewport>
    </Track>
  )
}

export default SwipeInBox

const Track = styled.div`
  position: relative;
  width: 100%;
  height: ${({ $vh }) => $vh}vh;
  /* Clip (not scroll) so the off-screen card never spawns a horizontal scrollbar. */
  overflow: clip;
`

const StickyViewport = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Box = styled.div`
  width: min(520px, 88vw);
  padding: var(--space-lg, 1.5rem) var(--space-xl, 2rem);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-accent);
  border-radius: 12px;
  background: var(--color-bg);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  will-change: transform;
  /* Start off-screen left; JS positions it on first frame. */
  transform: translate3d(-100vw, 0, 0);
`

const Eyebrow = styled.p`
  margin: 0 0 var(--space-xs, 0.5rem);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--color-accent);
`

const Title = styled.h3`
  margin: 0 0 var(--space-sm, 0.75rem);
  font-size: clamp(1.4rem, 3vw, 2rem);
  color: var(--color-text);
`

const Body = styled.p`
  margin: 0;
  color: var(--color-muted);
  font-size: 1rem;
  line-height: 1.65;
`
