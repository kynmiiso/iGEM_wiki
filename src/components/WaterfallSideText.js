import React, { useLayoutEffect, useRef } from "react"
import styled from "styled-components"
import { ExplainTerm } from "./ExplainTermPopover.js"

/** Horizontal offset from the left edge of the mockup composition (%). */
export const WATERFALL_TEXT_LEFT_PCT = 2

/** Vertical offset from the top of the mockup composition (%). */
export const WATERFALL_TEXT_TOP_PCT = 58

/**
 * Width as % of mockup composition. Type inside uses `cqw` so font size tracks this box
 * when the window (and artwork) get narrower.
 */
export const WATERFALL_TEXT_WIDTH_PCT = 26

/** Viewport px from top where faded copy reaches full opacity. */
export const WATERFALL_TEXT_FADE_FULL_AT_PX = 150

/** Viewport px from top where fade begins (0 = screen top; raise to sit below nav). */
export const WATERFALL_TEXT_FADE_START_AT_PX = 0

/** Mask alpha at the top of the fade band (0–1). */
export const WATERFALL_TEXT_FADE_MIN_ALPHA = 0.28

/** Screen-reader label for the labore popover (visual copy is in the PNG). */
const LABORE_EXPLANATION = "Explanation for labore."

function clearViewportTopFade(el) {
  el.style.maskImage = ""
  el.style.webkitMaskImage = ""
}

/** Opacity at a viewport Y inside the fade band (used for mask gradient stops). */
function viewportFadeAlpha(viewportY, fadeStartVp, fadeEndVp, minA) {
  if (viewportY >= fadeEndVp) return 1
  if (viewportY <= fadeStartVp) return minA
  const t = (viewportY - fadeStartVp) / (fadeEndVp - fadeStartVp)
  return minA + (1 - minA) * t
}

/**
 * Fades heading + body near the top of the viewport while scrolling.
 * No mask when the block’s top is at or below the fade band (resting on the mockup).
 */
function applyViewportTopFade(el) {
  const rect = el.getBoundingClientRect()
  const fadeStartVp = WATERFALL_TEXT_FADE_START_AT_PX
  const fadeEndVp = WATERFALL_TEXT_FADE_FULL_AT_PX
  const minA = WATERFALL_TEXT_FADE_MIN_ALPHA

  if (rect.bottom <= 0 || rect.top >= fadeEndVp) {
    clearViewportTopFade(el)
    return
  }

  const topAlpha = viewportFadeAlpha(rect.top, fadeStartVp, fadeEndVp, minA)
  const localFadeEnd = fadeEndVp - rect.top

  if (topAlpha >= 0.995 || localFadeEnd <= 0) {
    clearViewportTopFade(el)
    return
  }

  const mask = `linear-gradient(to bottom, rgba(0,0,0,${topAlpha}) 0px, rgba(0,0,0,1) ${localFadeEnd}px)`
  el.style.maskImage = mask
  el.style.webkitMaskImage = mask
}

/**
 * Waterfall-band copy on the home scroll mockup (left / brown side).
 * Positioning is percentage-based so it tracks the full-bleed art on resize.
 */
export function WaterfallSideText() {
  const mountRef = useRef(null)

  useLayoutEffect(() => {
    const el = mountRef.current
    if (!el || typeof window === "undefined") return undefined

    const motionMq =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null
    if (motionMq?.matches) return undefined

    let raf = 0
    const update = () => {
      raf = 0
      applyViewportTopFade(el)
    }
    const schedule = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", schedule, { passive: true, capture: true })
    window.addEventListener("resize", schedule, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener("scroll", schedule, { capture: true })
      window.removeEventListener("resize", schedule)
      clearViewportTopFade(el)
    }
  }, [])

  return (
    <TextMount ref={mountRef}>
      <Heading>Lorem ipsum</Heading>
      <Body>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
        non proident, sunt in culpa qui officia deserunt mollit anim id est{" "}
        <ExplainTerm term="labore" explanation={LABORE_EXPLANATION} />.
      </Body>
    </TextMount>
  )
}

export default WaterfallSideText

const TextMount = styled.div`
  position: absolute;
  left: ${WATERFALL_TEXT_LEFT_PCT}%;
  top: ${WATERFALL_TEXT_TOP_PCT}%;
  width: ${WATERFALL_TEXT_WIDTH_PCT}%;
  max-width: 100%;
  padding-right: 2%;
  padding-left: max(env(safe-area-inset-left, 0px), 2%);
  box-sizing: border-box;
  container-type: inline-size;
  pointer-events: auto;
  z-index: 1;
  overflow: visible;
  mask-size: 100% 100%;
  -webkit-mask-size: 100% 100%;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;

  @media (max-width: 720px) {
    width: min(${WATERFALL_TEXT_WIDTH_PCT}%, 42vw);
  }

  @media (max-width: 480px) {
    width: min(24%, 38vw);
  }
`

const Heading = styled.h2`
  margin: 0 0 0.65em;
  color: #fff;
  font-family: var(--font-body);
  /* Scales with the text column (cqw), not raw viewport vw */
  font-size: clamp(0.6rem, 7.5cqw, 1.35rem);
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.15;
  text-transform: uppercase;
`

const Body = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  font-family: var(--font-body);
  font-size: clamp(0.5rem, 4.4cqw, 1.05rem);
  font-weight: 400;
  line-height: 1.45;
  overflow-wrap: break-word;
  overflow: visible;
`
