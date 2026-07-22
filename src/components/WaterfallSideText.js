import React, { useLayoutEffect, useRef } from "react"
import styled, { css, keyframes } from "styled-components"
import { ExplainTerm } from "./ExplainTermPopover.js"

/** Used for popover accessibility; visible copy lives in the textbox image asset. */
const PETASE_EXPLANATION =
  "PETase breaks the chemical bonds in PET to free a compound called MHET. A second enzyme, MHETase, then cleaves this into environmentally friendly products (ethylene glycol and terephthalic acid)."

const ARROW_SRC =
  "https://static.igem.wiki/teams/6187/wiki/homepage-components/arrow.avif"

/** Horizontal offset from the left edge of the mockup composition (%). */
export const WATERFALL_TEXT_LEFT_PCT = 2

/** Horizontal start for right-side copy (% from left); box fills to the right edge. */
export const WATERFALL_TEXT_RIGHT_LEFT_PCT = 75

/** Vertical offset from the top of the mockup composition (%). */
export const WATERFALL_TEXT_TOP_PCT = 55

/** Vertical offset for right-side copy — sits below the left block (%). */
export const WATERFALL_TEXT_RIGHT_TOP_PCT = 74

/**
 * Preferred width as % of mockup composition (left column). Type inside uses `cqw`
 * so font size tracks this box when the window (and artwork) get narrower.
 * Right column uses left→right edge fill instead of a fixed %.
 */
export const WATERFALL_TEXT_WIDTH_PCT = 30

/** Viewport px from top where faded copy reaches full opacity. */
export const WATERFALL_TEXT_FADE_FULL_AT_PX = 150

/** Viewport px from top where fade begins (0 = screen top; raise to sit below nav). */
export const WATERFALL_TEXT_FADE_START_AT_PX = 0

/** Mask alpha at the top of the fade band (0–1). */
export const WATERFALL_TEXT_FADE_MIN_ALPHA = 0.28

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

function useViewportTopFade(mountRef) {
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
  }, [mountRef])
}

/**
 * Waterfall-band copy on the home scroll mockup (left + right of the fall).
 * Positioning is percentage-based so it tracks the full-bleed art on resize.
 */
export function WaterfallSideText() {
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  useViewportTopFade(leftRef)
  useViewportTopFade(rightRef)

  return (
    <>
      <TextMount ref={leftRef} $side="left">
        <Heading>The problem</Heading>
        <Body>
          The world produces over 400 million tonnes of plastic each year, and as they degrade, it
          breaks down into microplastics that can infiltrate our bodies—where they damage cells and
          cause cancer-associated mechanisms.
        </Body>
        <Body $spaced>
          To combat this, we are engineering plastic-degrading enzymes or{" "}
          <TermHintWrap>
            <ExplainTerm term="PETases..." explanation={PETASE_EXPLANATION} />
            <PopupHint>
              <ArrowImg src={ARROW_SRC} alt="" aria-hidden />
              <HintText>
                Hover red underlined words for a quick popup — or click to pin it open / click again
                to close.
              </HintText>
            </PopupHint>
          </TermHintWrap>
        </Body>
      </TextMount>

      <TextMount ref={rightRef} $side="right">
        <Body $large>
          However, PETases currently in industry have a major limitation...
        </Body>
      </TextMount>
    </>
  )
}

export default WaterfallSideText

const TextMount = styled.div`
  position: absolute;
  top: ${({ $side }) =>
    $side === "right" ? WATERFALL_TEXT_RIGHT_TOP_PCT : WATERFALL_TEXT_TOP_PCT}%;
  box-sizing: border-box;
  container-type: inline-size;
  pointer-events: auto;
  z-index: 1;
  overflow: visible;
  mask-size: 100% 100%;
  -webkit-mask-size: 100% 100%;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;

  ${({ $side }) =>
    $side === "left"
      ? css`
          left: ${WATERFALL_TEXT_LEFT_PCT}%;
          width: ${WATERFALL_TEXT_WIDTH_PCT}%;
          max-width: 100%;
          padding-right: 2%;
          padding-left: max(env(safe-area-inset-left, 0px), 2%);

          @media (max-width: 720px) {
            width: min(${WATERFALL_TEXT_WIDTH_PCT}%, 42vw);
          }

          @media (max-width: 480px) {
            width: min(24%, 38vw);
          }
        `
      : css`
          /* Pin to the right edge so the box shrinks with the window instead of clipping. */
          left: ${WATERFALL_TEXT_RIGHT_LEFT_PCT}%;
          right: max(env(safe-area-inset-right, 0px), 2%);
          width: auto;
          max-width: none;
          padding-left: 2%;
          padding-right: 0;
        `}
`

const Heading = styled.h2`
  margin: 0 0 0.55em;
  color: #fff;
  font-family: var(--font-body);
  font-size: clamp(0.95rem, 9cqw, 1.7rem);
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.15;
  text-transform: uppercase;
`

const Body = styled.p`
  margin: ${({ $spaced }) => ($spaced ? "0.75em 0 0" : "0")};
  color: rgba(255, 255, 255, 0.92);
  font-family: var(--font-body);
  font-size: ${({ $large }) =>
    $large ? "clamp(1.1rem, 11cqw, 2.15rem)" : "clamp(0.8rem, 7cqw, 1.3rem)"};
  font-weight: 400;
  line-height: ${({ $large }) => ($large ? 1.4 : 1.4)};
  overflow-wrap: break-word;
  overflow: visible;
`

const arrowFloat = keyframes`
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -8px, 0);
  }
`

/** Keeps the arrow + hint tucked under the red-underlined term. */
const TermHintWrap = styled.span`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  vertical-align: baseline;
  max-width: 100%;
`

const PopupHint = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2em;
  margin-top: 0.15em;
  margin-left: -0.35em;
  max-width: min(14rem, 90cqw);
`

const ArrowImg = styled.img`
  display: block;
  width: min(5.5rem, 55%);
  height: auto;
  user-select: none;
  pointer-events: none;
  transform-origin: center bottom;
  animation: ${arrowFloat} 1.8s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const HintText = styled.span`
  display: block;
  width: 100%;
  text-align: center;
  color: #e63946;
  font-family: var(--font-body);
  font-size: clamp(0.65rem, 5.5cqw, 0.95rem);
  font-weight: 600;
  line-height: 1.4;
  overflow-wrap: break-word;
`
