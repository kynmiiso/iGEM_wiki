import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { withPrefix } from "gatsby"
import styled, { css, keyframes } from "styled-components"
import { WikiTopBar, WIKI_TOP_BAR_Z_INDEX } from "./WikiTopBar.js"
import { WaterfallSideText } from "./WaterfallSideText.js"
import { SwipeInBox } from "./SwipeInBox.js"

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

/** Full-bleed shore section layers (iGEM team static CDN). */
const SHORE_ASSETS = {
  waterBg: "https://static.igem.wiki/teams/6187/wiki/homepage-components/5-water-bg.avif",
  waterDetails: "https://static.igem.wiki/teams/6187/wiki/homepage-components/4-water-details.avif",
  sand: "https://static.igem.wiki/teams/6187/wiki/homepage-components/3-sand.avif",
  grass: "https://static.igem.wiki/teams/6187/wiki/homepage-components/2-grass.avif",
}

/** Overlays above the in-flow back plate. Text/popover above water so the glossary box is visible. */
const Z = {
  front: 1,
  logo: 2,
  bottle: 3,
  water: 4,
  text: 5,
}

/**
 * Fraction of the bottle layer height: positive `translateY` moves the bottle layer down
 * (toward the waterfall base / yellow figure). Increase if it still sits too high.
 */
const BOTTLE_SHIFT_FRAC = -0.25

/** Pixels scroll must move back above the captured TP1 scrollY before bottle unpins. */
const BOTTLE_PIN_SCROLL_UP_LEAVE = 40

/** FLIP duration (ms) for bottle pick-up / put-down when toggling sticky. */
const BOTTLE_FLIP_MS = 580

/** Back layer scroll speed vs foreground (lower = slower / more depth). */
const BACK_PARALLAX_SPEED = 0.42

/**
 * Fraction of the composition (layer) height where the water surface / ripple sits.
 * Once this line rises above the anchored bottle, the bottle is treated as submerged.
 * Tune against wiki-front-water.png (ripple ≈ 0.92 down the 1440×2440 canvas).
 * Pushed to 0.98 so the bottle stays fully opaque until it's deep under the water.
 */
const WATER_RIPPLE_FRAC = 0.98

/**
 * Visible bottle band as a fraction of its layer height (already includes the
 * BOTTLE_SHIFT nudge). The bottle fades from opaque→hidden as the ripple sweeps
 * from BOT_FRAC up to TOP_FRAC — a narrow gap makes the fade snap 100→0 fast.
 */
const BOTTLE_SUBMERGE_TOP_FRAC = 0.49
const BOTTLE_SUBMERGE_BOT_FRAC = 0.52

/**
 * Conditions card: enter high on the waterfall (before the bottle hits water),
 * exit after scrolling into the sand.
 */
const CONDITIONS_ENTER_VH = 1.25
const CONDITIONS_EXIT_SAND_FRAC = 0.42
const CONDITIONS_EXIT_VH = 0.28
/** Continuous left→right pass (no centered hold) so the card covers less screen time. */
const CONDITIONS_ENTER_END = 1
const CONDITIONS_HOLD_END = 0

const clamp01 = (v) => Math.max(0, Math.min(1, v))

/**
 * Full-page wiki front compositing: layered mockup PNGs plus a gentle idle float on the logo.
 *
 * Site nav uses scroll-driven `position: fixed` while the mockup is on-screen.
 *
 * Bottle touchpoints: (1) when the bottle midpoint crosses the viewport middle, capture scrollY
 * and pin the bottle centered; (2) stay pinned through the bottom of the page so it does not
 * vanish. Unpin only when the user scrolls back up past TP1 (`scrollY` below that capture minus slack).
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
  const parallaxBackRef = useRef(null)
  const waterRef = useRef(null)
  const compositionRef = useRef(null)
  const shoreRef = useRef(null)
  const [navPinned, setNavPinned] = useState(false)
  const [bottleTouchPinned, setBottleTouchPinned] = useState(false)
  const reduceMotionParallaxRef = useRef(false)

  bottleTouchPinnedRef.current = bottleTouchPinned

  /** 0–1 progress from past the puddle → a little into the sand. */
  const getConditionsProgress = useCallback(() => {
    const comp = compositionRef.current
    const shore = shoreRef.current
    if (!comp || !shore || typeof window === "undefined") return 0

    const vh = window.innerHeight
    const y = window.scrollY
    const compBottomDoc = y + comp.getBoundingClientRect().bottom
    const shoreRect = shore.getBoundingClientRect()
    const shoreTopDoc = y + shoreRect.top

    const enterScroll = compBottomDoc - vh * CONDITIONS_ENTER_VH
    const exitScroll =
      shoreTopDoc + shoreRect.height * CONDITIONS_EXIT_SAND_FRAC - vh * CONDITIONS_EXIT_VH

    return clamp01((y - enterScroll) / Math.max(1, exitScroll - enterScroll))
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => {
      reduceMotionParallaxRef.current = mq.matches
      if (mq.matches && parallaxBackRef.current) {
        parallaxBackRef.current.style.transform = "translate3d(0, 0, 0)"
        parallaxBackRef.current.style.willChange = "auto"
      }
    }
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
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
        const rect = stack.getBoundingClientRect()
        setNavPinned(rect.top < 0 && rect.bottom > 0)
        const scrolledInto = Math.max(0, -rect.top)
        const offset = reduceMotionParallaxRef.current
          ? 0
          : scrolledInto * (1 - BACK_PARALLAX_SPEED)
        if (parallaxBackRef.current) {
          parallaxBackRef.current.style.transform = `translate3d(0, ${offset}px, 0)`
          parallaxBackRef.current.style.willChange = offset > 0 ? "transform" : "auto"
        }
      }

      // Water surface (ripple) viewport position — the "barrier" the bottle sinks behind.
      const water = waterRef.current
      let rippleY = null
      if (water) {
        const wr = water.getBoundingClientRect()
        rippleY = wr.top + wr.height * WATER_RIPPLE_FRAC
      }

      if (bottleTouchPinnedRef.current) {
        const pin0 = bottlePinEnterScrollYRef.current
        if (pin0 != null && y < pin0 - BOTTLE_PIN_SCROLL_UP_LEAVE) {
          const flip = bottleFlipRef.current
          if (flip) {
            flipUnpinFirstRef.current = flip.getBoundingClientRect()
            flip.style.opacity = ""
          } else {
            flipUnpinFirstRef.current = null
          }
          bottleTouchPinnedRef.current = false
          bottlePinEnterScrollYRef.current = null
          setBottleTouchPinned(false)
        } else {
          // Anchored at the barrier: fade the bottle out as the rising water sweeps
          // up over it, so it disappears behind the water and stays hidden past this
          // point. Fades back in (and later unpins) only when the user scrolls up.
          const flip = bottleFlipRef.current
          if (flip && rippleY != null) {
            const fr = flip.getBoundingClientRect()
            const topY = fr.top + BOTTLE_SUBMERGE_TOP_FRAC * fr.height
            const botY = fr.top + BOTTLE_SUBMERGE_BOT_FRAC * fr.height
            const span = Math.max(1, botY - topY)
            const op = Math.max(0, Math.min(1, (rippleY - topY) / span))
            flip.style.opacity = String(op)
          }
        }
      } else if (bottleSpot) {
        const flip = bottleFlipRef.current
        if (flip) flip.style.opacity = ""
        const br = bottleSpot.getBoundingClientRect()
        const bottleMidY = br.top + br.height / 2
        const viewMidY = window.innerHeight / 2
        if (!nearBottom && bottleMidY <= viewMidY && br.bottom > 32) {
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
        <CompositionRoot ref={compositionRef}>
          <FlowSizer>
            <ParallaxBack
              ref={parallaxBackRef}
            >
              <BackRailImg src={ASSETS.back} alt="Wiki front — background scenery" />
            </ParallaxBack>
          </FlowSizer>
          <OverlayStack>
            <OverlaySlice $z={Z.front}>
              <RailImg src={ASSETS.front} alt="" />
            </OverlaySlice>
            <OverlaySlice $z={Z.text} $interactive>
              <WaterfallSideText />
            </OverlaySlice>
            <OverlaySlice $z={Z.logo}>
              <LogoFloatWrap>
                <RailImg src={ASSETS.logo} alt="PETABITE" />
              </LogoFloatWrap>
            </OverlaySlice>
            <OverlaySlice $z={Z.bottle}>
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
            </OverlaySlice>
            <OverlaySlice $z={Z.water}>
              <RailImg ref={waterRef} src={ASSETS.water} alt="" />
            </OverlaySlice>
          </OverlayStack>
        </CompositionRoot>

        <SwipeInBox
          getProgress={getConditionsProgress}
          enterEnd={CONDITIONS_ENTER_END}
          holdEnd={CONDITIONS_HOLD_END}
          eyebrow="PETase living conditions"
          title="Three conditions"
          body="Temperature, pH, and the surrounding environment all have to line up for PETase to break down plastic efficiently — and industrial enzymes today only work in a narrow window."
        />

        <DrawnShoreSection ref={shoreRef}>
          <ShoreFlowSizer>
            <ShoreRailImg src={SHORE_ASSETS.waterBg} alt="" />
          </ShoreFlowSizer>
          <ShoreOverlayStack>
            <ShoreLayer $z={1}>
              <ShoreRailImg src={SHORE_ASSETS.waterDetails} alt="" />
            </ShoreLayer>
            <ShoreLayer $z={2}>
              <ShoreStackImg src={SHORE_ASSETS.sand} alt="" />
              <ShoreStackImg src={SHORE_ASSETS.grass} alt="" />
            </ShoreLayer>
            <ShoreTextLayer $z={3}>
              <ShoreTextMount>
                <ShoreBody>
                  That&apos;s why our team has developed the LOGAN index: a planetary sequence
                  search that discovers novel plastic-degrading enzymes.
                </ShoreBody>
                <ShoreBody $spaced>
                  Before, the industry was using an enzyme dataset of roughly 200. With our
                  advisory lab, the RNAlab, the team uncovered 215.7 million high-quality
                  plastic‑degrading enzymes — a 1,000,000‑fold increase from the enzyme
                  landscape previously known.
                </ShoreBody>
              </ShoreTextMount>
            </ShoreTextLayer>
          </ShoreOverlayStack>
        </DrawnShoreSection>

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
  overflow: visible;
`

const ScrollStack = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
`

/** Absolute at rest; `fixed` while scrolling through mockup so nav stays reachable. */
const HomeNavMount = styled.div`
  position: ${({ $pinned }) => ($pinned ? "fixed" : "absolute")};
  top: 0;
  left: 0;
  right: 0;
  z-index: ${WIKI_TOP_BAR_Z_INDEX};
`

const CompositionRoot = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
  overflow: visible;
`

/** Full-bleed shore under the waterfall; height from water-bg art. */
const DrawnShoreSection = styled.section`
  position: relative;
  z-index: 0;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  background: #000;
`

const ShoreFlowSizer = styled.div`
  width: 100%;
  pointer-events: none;
`

const ShoreOverlayStack = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
`

const ShoreLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: ${({ $z }) => $z};
  display: flex;
  align-items: flex-start;
  justify-content: center;
`

const ShoreTextLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: ${({ $z }) => $z};
  pointer-events: none;
`

/** Sits on the sand bank (left/center of the shore art). */
const ShoreTextMount = styled.div`
  position: absolute;
  top: 22%;
  left: max(env(safe-area-inset-left, 0px), 10%);
  width: min(48%, 34rem);
  max-width: calc(100% - 14%);
  box-sizing: border-box;
  container-type: inline-size;
  pointer-events: auto;

  @media (max-width: 720px) {
    top: 20%;
    left: max(env(safe-area-inset-left, 0px), 6%);
    width: min(56%, 48vw);
  }
`

const ShoreBody = styled.p`
  margin: ${({ $spaced }) => ($spaced ? "0.85em 0 0" : "0")};
  color: #51594a;
  font-family: var(--font-body);
  font-size: clamp(1.15rem, 10cqw, 2.15rem);
  font-weight: 600;
  line-height: 1.45;
  overflow-wrap: break-word;
`

const ShoreRailImg = styled.img`
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  user-select: none;
  pointer-events: none;
`

/** Sand and grass share the foreground frame; stacked absolute. */
const ShoreStackImg = styled(ShoreRailImg)`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: auto;
`

const RailImg = styled.img`
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  user-select: none;
  pointer-events: none;
`

const FlowSizer = styled.div`
  width: 100%;
  pointer-events: none;
  overflow: hidden;
`

const ParallaxBack = styled.div`
  width: 100%;
  will-change: auto;

  @media (prefers-reduced-motion: reduce) {
    transform: none !important;
    will-change: auto;
  }
`

const BackRailImg = styled(RailImg)`
  transform: scale(1.04);
  transform-origin: center top;
`

const OverlayStack = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
`

const OverlaySlice = styled.div`
  position: absolute;
  inset: 0;
  z-index: ${({ $z }) => $z};
  display: flex;
  align-items: flex-start;
  justify-content: center;
  pointer-events: ${({ $interactive }) => ($interactive ? "auto" : "none")};
  overflow: visible;
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

/** Very slow, subtle sway only while the bottle is in touch “sticky” (fixed) mode. */
const bottleStickyRock = keyframes`
  0%,
  100% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(10deg);
  }
`

/** Subtle idle rotation while bottle is pinned (fixed); off during normal scroll. */
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

/** Owns FLIP `transform` so parent pin spot can stay `position: fixed` without fighting this layer. */
const BottleFlipSurface = styled.div`
  width: 100%;
`

/** Scroll touch: pins bottle to viewport center while stack scrolls; releases near page bottom. */
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

/** Nudges the bottle PNG down (see `BOTTLE_SHIFT_FRAC`); inner wrap adds idle float. */
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
