import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { withPrefix } from "gatsby"
import styled, { css, keyframes } from "styled-components"
import { WikiTopBar } from "./WikiTopBar.js"

/**
 * Mockups live under /static/wiki-mockup/ so the browser loads predictable URLs
 * (avoids webpack + long filenames with spaces, and respects pathPrefix via withPrefix).
 */
const ASSETS = {
  back: withPrefix("/wiki-mockup/wiki-front-back.jpg"),
  front: withPrefix("/wiki-mockup/wiki-front-front.png"),
  logo: withPrefix("/wiki-mockup/wiki-front-logo.png"),
  bottle: withPrefix("/wiki-mockup/wiki-front-bottle.png"),
  water: withPrefix("/wiki-mockup/wiki-front-water.png"),
}

/** Design canvas the layered PNGs were exported from. */
const DESIGN_W = 1440
const DESIGN_H = 2440

/** Parallax scroll multipliers — higher = more movement relative to page scroll. */
const PARALLAX = {
  front: 0.07,
  water: 0.05,
}

/** Overlays above the in-flow back plate (water on top). */
const Z = {
  front: 1,
  logo: 2,
  bottle: 3,
  water: 4,
}

const BOTTLE_SHIFT_FRAC = -0.25
const BOTTLE_PIN_SCROLL_UP_LEAVE = 40
const BOTTLE_FLIP_MS = 580

/**
 * Scale dynamic foreground layers so they cover the hero frame on the current viewport.
 * Background, title, and bottle sticky layer are outside this scale (fixed positioning needs no ancestor transform).
 */
function computeDynamicScale(frameWidth, frameHeight) {
  if (!frameWidth || !frameHeight) return 1
  const widthScale = frameWidth / DESIGN_W
  const coverScale = Math.max(widthScale, frameHeight / DESIGN_H)
  return coverScale / widthScale
}

/**
 * Full-page wiki front compositing with parallax separation.
 *
 * Static: background plate + PETABITE title (full-width, no parallax scale group).
 * Bottle touchpoints: (1) when the bottle midpoint crosses the viewport middle, capture scrollY
 * and pin the bottle centered; (2) stay pinned through the bottom of the page so it does not
 * vanish. Unpin only when the user scrolls back up past TP1 (`scrollY` below that capture minus slack).
 * Bottle lives outside transformed parallax layers so position:fixed is viewport-relative.
 */
export function HomeScrollPrototype() {
  const stackRef = useRef(null)
  const bottleTouchRef = useRef(null)
  const bottleFlipRef = useRef(null)
  const bottleTouchPinnedRef = useRef(false)
  const bottlePinEnterScrollYRef = useRef(null)
  const flipUnpinFirstRef = useRef(null)
  const flipPinFirstRef = useRef(null)
  const flipCleanupRef = useRef(null)
  const [navPinned, setNavPinned] = useState(false)
  const [bottleTouchPinned, setBottleTouchPinned] = useState(false)
  const [dynamicScale, setDynamicScale] = useState(1)
  const [frontShift, setFrontShift] = useState(0)
  const [waterShift, setWaterShift] = useState(0)

  bottleTouchPinnedRef.current = bottleTouchPinned

  useEffect(() => {
    if (typeof window === "undefined") return
    window.scrollTo(0, 0)
  }, [])

  useLayoutEffect(() => {
    const tick = () => {
      const stack = stackRef.current
      const bottleSpot = bottleTouchRef.current
      const doc = document.documentElement
      const y = window.scrollY
      const maxY = Math.max(0, doc.scrollHeight - window.innerHeight)
      const nearBottom = y >= maxY - 8

      if (stack) {
        const frameWidth = stack.clientWidth
        const frameHeight = stack.clientHeight
        setDynamicScale(computeDynamicScale(frameWidth, frameHeight))
        setFrontShift(-y * PARALLAX.front)
        setWaterShift(-y * PARALLAX.water)
      }

      if (stack) {
        const rect = stack.getBoundingClientRect()
        setNavPinned(rect.top < 0 && rect.bottom > 0)
      }

      if (bottleTouchPinnedRef.current) {
        const pin0 = bottlePinEnterScrollYRef.current
        if (pin0 != null && y < pin0 - BOTTLE_PIN_SCROLL_UP_LEAVE) {
          const flip = bottleFlipRef.current
          if (flip) flipUnpinFirstRef.current = flip.getBoundingClientRect()
          else flipUnpinFirstRef.current = null
          bottleTouchPinnedRef.current = false
          bottlePinEnterScrollYRef.current = null
          setBottleTouchPinned(false)
        }
      } else if (bottleSpot) {
        const br = bottleSpot.getBoundingClientRect()
        const bottleMidY = br.top + br.height / 2
        const viewMidY = window.innerHeight / 2
        if (!nearBottom && bottleMidY <= viewMidY && br.bottom > 32) {
          const flip = bottleFlipRef.current
          if (flip) flipPinFirstRef.current = flip.getBoundingClientRect()
          else flipPinFirstRef.current = null
          bottlePinEnterScrollYRef.current = y
          bottleTouchPinnedRef.current = true
          setBottleTouchPinned(true)
        }
      }
    }

    tick()
    window.addEventListener("scroll", tick, { passive: true })
    window.addEventListener("resize", tick, { passive: true })
    return () => {
      window.removeEventListener("scroll", tick)
      window.removeEventListener("resize", tick)
    }
  }, [])

  useLayoutEffect(() => {
    if (typeof window === "undefined") return
    const el = bottleFlipRef.current
    if (!el) return

    if (flipCleanupRef.current) {
      flipCleanupRef.current()
      flipCleanupRef.current = null
    }

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion) {
      el.style.transition = ""
      el.style.transform = ""
      el.style.willChange = ""
      flipUnpinFirstRef.current = null
      flipPinFirstRef.current = null
      return undefined
    }

    const runFlip = (first, ease) => {
      const last = el.getBoundingClientRect()
      const dx = first.left - last.left
      const dy = first.top - last.top

      let raf2 = 0
      let timeoutId = 0

      const clearTimers = () => {
        cancelAnimationFrame(raf2)
        window.clearTimeout(timeoutId)
      }

      const finish = () => {
        el.style.transition = ""
        el.style.transform = ""
        el.style.willChange = ""
        el.removeEventListener("transitionend", onEnd)
      }

      function onEnd(ev) {
        if (ev.propertyName !== "transform") return
        clearTimers()
        finish()
      }

      el.style.willChange = "transform"
      el.style.transition = "none"
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`

      requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          el.style.transition = `transform ${BOTTLE_FLIP_MS}ms ${ease}`
          el.style.transform = "translate3d(0, 0, 0)"
        })
      })

      el.addEventListener("transitionend", onEnd)
      timeoutId = window.setTimeout(() => {
        clearTimers()
        finish()
      }, BOTTLE_FLIP_MS + 120)

      flipCleanupRef.current = () => {
        clearTimers()
        finish()
      }
    }

    if (!bottleTouchPinned && flipUnpinFirstRef.current) {
      const first = flipUnpinFirstRef.current
      flipUnpinFirstRef.current = null
      runFlip(first, "cubic-bezier(0.22, 1, 0.36, 1)")
    } else if (bottleTouchPinned && flipPinFirstRef.current) {
      const first = flipPinFirstRef.current
      flipPinFirstRef.current = null
      runFlip(first, "cubic-bezier(0.34, 1.28, 0.64, 1)")
    }

    return () => {
      if (flipCleanupRef.current) {
        flipCleanupRef.current()
        flipCleanupRef.current = null
      }
    }
  }, [bottleTouchPinned])

  return (
    <WikiFrontRoot>
      <ScrollStack ref={stackRef}>
        <CompositionRoot>
          {/* Static — full page width, sets scroll height */}
          <FlowSizer>
            <StaticImg src={ASSETS.back} alt="Wiki front — background scenery" />
          </FlowSizer>

          <OverlayStack aria-hidden>
            {/* Dynamic — buildings/people, bottle, waterfall */}
            <DynamicParallaxRoot $scale={dynamicScale}>
              <ParallaxSlice $z={Z.front} $shift={frontShift}>
                <DynamicImg src={ASSETS.front} alt="" />
              </ParallaxSlice>
              <ParallaxSlice $z={Z.water} $shift={waterShift}>
                <DynamicImg src={ASSETS.water} alt="" />
              </ParallaxSlice>
            </DynamicParallaxRoot>

            {/* Bottle — outside transformed parallax root so position:fixed sticky scroll works */}
            <BottleLayer $z={Z.bottle}>
              <BottlePinSpot ref={bottleTouchRef} $touchPinned={bottleTouchPinned}>
                <BottleFlipSurface ref={bottleFlipRef}>
                  <BottleStickyRock $active={bottleTouchPinned}>
                    <BottleShiftWrap>
                      <BottleFloatWrap>
                        <RailImg src={ASSETS.bottle} alt="" />
                      </BottleFloatWrap>
                    </BottleShiftWrap>
                  </BottleStickyRock>
                </BottleFlipSurface>
              </BottlePinSpot>
            </BottleLayer>

            {/* Static — PETABITE title */}
            <StaticSlice $z={Z.logo}>
              <LogoFloatWrap>
                <StaticImg src={ASSETS.logo} alt="PETABITE" />
              </LogoFloatWrap>
            </StaticSlice>
          </OverlayStack>
        </CompositionRoot>

        <HomeNavMount $pinned={navPinned}>
          <WikiTopBar />
        </HomeNavMount>
      </ScrollStack>
    </WikiFrontRoot>
  )
}

export default HomeScrollPrototype

const WikiFrontRoot = styled.div`
  width: 100%;
  min-width: 0;
  background: var(--color-bg);
  overflow: hidden;
`

const ScrollStack = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
  overflow: hidden;
`

const HomeNavMount = styled.div`
  position: ${({ $pinned }) => ($pinned ? "fixed" : "absolute")};
  top: 0;
  left: 0;
  right: 0;
  z-index: 110;
`

const CompositionRoot = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
  overflow: hidden;
`

/** In-flow sizer — background fills page width at natural aspect (${DESIGN_W}×${DESIGN_H}). */
const FlowSizer = styled.div`
  width: 100%;
  pointer-events: none;
`

const OverlayStack = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`

/**
 * Shared scale for foreground parallax layers (front, waterfall).
 * Bottle is a sibling layer — not scaled here — so sticky position:fixed is viewport-relative.
 */
const DynamicParallaxRoot = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transform: scale(${({ $scale }) => $scale});
  transform-origin: center bottom;
  will-change: transform;
`

const ParallaxSlice = styled.div`
  position: absolute;
  inset: 0;
  z-index: ${({ $z }) => $z};
  pointer-events: none;
  transform: translate3d(0, ${({ $shift }) => $shift}px, 0);
  will-change: transform;
`

/** Bottle layer — no CSS transform on this subtree (required for viewport-fixed sticky scroll). */
const BottleLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: ${({ $z }) => $z};
  pointer-events: none;
`

/** Static overlay slice — no parallax shift or dynamic scale. */
const StaticSlice = styled.div`
  position: absolute;
  inset: 0;
  z-index: ${({ $z }) => $z};
  pointer-events: none;
`

/** Static layers: full width, natural height — matches original compositor. */
const StaticImg = styled.img`
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  user-select: none;
  pointer-events: none;
`

/** Dynamic layers: cover the hero frame so buildings/people/water fill the window. */
const DynamicImg = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
  user-select: none;
  pointer-events: none;
`

const logoIdleFloat = keyframes`
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -7px, 0);
  }
`

const bottleIdleFloat = keyframes`
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -5px, 0);
  }
`

const bottleStickyRock = keyframes`
  0%,
  100% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(10deg);
  }
`

const BottleStickyRock = styled.div`
  width: 100%;
  transform-origin: 50% 42%;

  ${({ $active }) =>
    $active
      ? css`
          animation: ${bottleStickyRock} 2s ease-in-out infinite;
        `
      : css`
          animation: none;
        `}

  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
  }
`

const LogoFloatWrap = styled.div`
  width: 100%;
  animation: ${logoIdleFloat} 4.2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const BottleFlipSurface = styled.div`
  width: 100%;
`

const BottlePinSpot = styled.div`
  width: 100%;
  pointer-events: none;

  ${({ $touchPinned }) =>
    $touchPinned
      ? css`
          position: fixed;
          left: 0;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 95;
        `
      : css`
          position: relative;
        `}
`

const BottleShiftWrap = styled.div`
  width: 100%;
  transform: translateY(${BOTTLE_SHIFT_FRAC * 100}%);
`

const BottleFloatWrap = styled.div`
  width: 100%;
  animation: ${bottleIdleFloat} 1.5s ease-in-out infinite;
  animation-delay: -0.7s;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const RailImg = styled.img`
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  user-select: none;
  pointer-events: none;
`
