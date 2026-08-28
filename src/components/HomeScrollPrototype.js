import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import styled, { css, keyframes } from "styled-components"
import { WikiTopBar, WIKI_TOP_BAR_Z_INDEX } from "./WikiTopBar.js"
import { WaterfallSideText, PETASE_EXPLANATION } from "./WaterfallSideText.js"
import { SwipeInBox } from "./SwipeInBox.js"
import { ExplainTerm } from "./ExplainTermPopover.js"

/**
 * Homepage bottle stages (degradation journey).
 * `sky` is used for the waterfall; section1–5 are reserved for later sections.
 */
export const BOTTLE_STAGES = {
  sky: "https://static.igem.wiki/teams/6187/wiki/homepage-components/bottle-stages/sky.avif",
  section1: "https://static.igem.wiki/teams/6187/wiki/homepage-components/bottle-stages/section1.avif",
  section2: "https://static.igem.wiki/teams/6187/wiki/homepage-components/bottle-stages/section2.avif",
  section3: "https://static.igem.wiki/teams/6187/wiki/homepage-components/bottle-stages/section3.avif",
  section4: "https://static.igem.wiki/teams/6187/wiki/homepage-components/bottle-stages/section4.avif",
  section5: "https://static.igem.wiki/teams/6187/wiki/homepage-components/bottle-stages/section5.avif",
}

const ASSETS = {
  back: "https://static.igem.wiki/teams/6187/wiki/homepage-components/wiki-front-page-back.avif",
  /** Unified front plate: plaza + waterfall + river + map + forest. */
  front: "https://static.igem.wiki/teams/6187/wiki/homepage-components/wiki-front-page-top.avif",
  /** Foreground bushes — highest scenery layer (same 563×4000 canvas as front). */
  bush: "https://static.igem.wiki/teams/6187/wiki/homepage-components/wiki-front-page-bush.avif",
  /** Waterfall / sky section bottle (current homepage stage). */
  bottle: BOTTLE_STAGES.sky,
}

/** Nine-frame PETABITE logo loop (same slot + idle float as the old static logo). */
const LOGO_FRAME_COUNT = 9
/** Base hold for frames 1–7. */
const LOGO_FRAME_MS = 170
/** Longer hold for the last two frames (8–9). */
const LOGO_LAST_FRAME_MS = 450
const LOGO_FRAMES = Array.from(
  { length: LOGO_FRAME_COUNT },
  (_, i) =>
    `https://static.igem.wiki/teams/6187/wiki/homepage-components/logo-animation-files/untitled-artwork-${i + 1}.avif`
)

/** Per-frame visibility windows so the last two frames linger longer. */
const LOGO_FRAME_TIMING = (() => {
  const durations = Array.from({ length: LOGO_FRAME_COUNT }, (_, i) =>
    i >= LOGO_FRAME_COUNT - 2 ? LOGO_LAST_FRAME_MS : LOGO_FRAME_MS
  )
  const cycleMs = durations.reduce((sum, ms) => sum + ms, 0)
  let acc = 0
  const windows = durations.map((ms) => {
    const start = acc / cycleMs
    acc += ms
    return { start, end: acc / cycleMs }
  })
  return { cycleMs, windows }
})()

const LOGO_FRAME_KEYFRAMES = LOGO_FRAME_TIMING.windows.map(({ start, end }) => {
  const s = start * 100
  const e = end * 100
  if (start <= 0) {
    return keyframes`
      0%,
      ${e}% {
        opacity: 1;
      }
      ${e + 0.001}%,
      100% {
        opacity: 0;
      }
    `
  }
  return keyframes`
    0%,
    ${Math.max(0, s - 0.001)}% {
      opacity: 0;
    }
    ${s}%,
    ${e}% {
      opacity: 1;
    }
    ${e + 0.001}%,
    100% {
      opacity: 0;
    }
  `
})

/**
 * Unified front canvas (CDN `wiki-front-page-top.avif`).
 * Overlay bands are fractions of this image so a same-composition re-export
 * (e.g. 1440-wide) keeps placement. Measured on 563×4000:
 *   0–395 transparent sky hole (Toronto shows through)
 *   395–1380 plaza + waterfall (legacy 2440 plate)
 *   1380–2440 river / first sand (legacy shore)
 *   2440–2900 world map
 *   2900–3503 forest
 *   3503–4000 transparent pad
 */
const FRONT_ART_HEIGHT = 4000
const WATERFALL_BAND_TOP = 395 / FRONT_ART_HEIGHT
const WATERFALL_BAND_BOT = 1380 / FRONT_ART_HEIGHT
const SHORE_BAND_BOT = 2440 / FRONT_ART_HEIGHT
const WATERFALL_BAND_HEIGHT = WATERFALL_BAND_BOT - WATERFALL_BAND_TOP
const SHORE_BAND_TOP = WATERFALL_BAND_BOT
const SHORE_BAND_HEIGHT = SHORE_BAND_BOT - SHORE_BAND_TOP
/** Under the world map, through the forest / just above the bushes. */
const FOREST_BAND_TOP = 2660 / FRONT_ART_HEIGHT
const FOREST_BAND_BOT = 3503 / FRONT_ART_HEIGHT
const FOREST_BAND_HEIGHT = FOREST_BAND_BOT - FOREST_BAND_TOP
const CREAM_PAD_TOP = FOREST_BAND_BOT
const CREAM_PAD_HEIGHT = 1 - CREAM_PAD_TOP

const SHORE_BOTTLE_IMG =
  "https://static.igem.wiki/teams/6187/wiki/homepage-components/bottle-stages/bottle-w-ripples.avif"

const CONDITION_CARD_IMAGES = [
  {
    src: "https://static.igem.wiki/teams/6187/wiki/homepage-components/condition-cards/ph.avif",
    alt: "pH",
  },
  {
    src: "https://static.igem.wiki/teams/6187/wiki/homepage-components/condition-cards/temp.avif",
    alt: "Temperature",
  },
  {
    src: "https://static.igem.wiki/teams/6187/wiki/homepage-components/condition-cards/surrounding-env.avif",
    alt: "Environment",
  },
]

const RNALAB_TEXTBOX_IMG =
  "https://static.igem.wiki/teams/6187/wiki/homepage-components/text-boxes/rnalab.avif"

const RNALAB_EXPLANATION =
  "RNAlab is our advisory lab partner that helped uncover 215.7 million high-quality plastic-degrading enzymes."

/** Jump to the top on mount / HMR. Turn back on before shipping. */
const RESET_SCROLL_ON_MOUNT = false

/** Overlays inside a band (text above bottle). */
const Z = {
  logo: 2,
  bottle: 3,
  text: 5,
}

/**
 * Shift painting-locked overlays up within the waterfall band (logo + birds stay).
 * Applied to copy, sky bottle, splash, and the sink lip so they stay in step.
 */
const LANDMARK_NUDGE_UP = 0.07

/**
 * Where the bottle sits in the legacy art band (0 = top, 1 = bottom).
 * Anchors into the waterfall rather than the sky.
 */
const BOTTLE_TOP_FRAC = 0.42 - LANDMARK_NUDGE_UP

/** Pixels scroll must move back above the captured TP1 scrollY before bottle unpins. */
const BOTTLE_PIN_SCROLL_UP_LEAVE = 40

/** FLIP duration (ms) for bottle pick-up / put-down when toggling sticky. */
const BOTTLE_FLIP_MS = 580

/** Back layer scroll speed vs foreground (lower = slower / more depth). */
const BACK_PARALLAX_SPEED = 0.7

/**
 * Full-bleed bird flap pairs (same canvas as the back art).
 * `speed` is parallax vs scroll (between back and foreground).
 * `flapMs` is one full A↔B cycle.
 */
const BIRDS = [
  {
    id: 1,
    a: "https://static.igem.wiki/teams/6187/wiki/homepage-components/birds/wiki-front-page-bird-1.avif",
    b: "https://static.igem.wiki/teams/6187/wiki/homepage-components/birds/wiki-front-page-bird-1-2.avif",
    speed: 0.82,
    flapMs: 980,
    delayMs: 0,
    depth: "back",
    driftMs: 32000,
    driftDelayMs: 2000,
  },
  {
    id: 2,
    a: "https://static.igem.wiki/teams/6187/wiki/homepage-components/birds/wiki-front-page-bird-2.avif",
    b: "https://static.igem.wiki/teams/6187/wiki/homepage-components/birds/wiki-front-page-bird-2-2.avif",
    speed: 0.88,
    flapMs: 480,
    delayMs: 140,
    depth: "front",
    z: 4,
  },
  {
    id: 3,
    a: "https://static.igem.wiki/teams/6187/wiki/homepage-components/birds/wiki-front-page-bird-3.avif",
    b: "https://static.igem.wiki/teams/6187/wiki/homepage-components/birds/wiki-front-page-bird-3-2.avif",
    speed: 0.78,
    flapMs: 1100,
    delayMs: 240,
    depth: "back",
    driftMs: 40000,
    driftDelayMs: 8000,
  },
  {
    id: 4,
    a: "https://static.igem.wiki/teams/6187/wiki/homepage-components/birds/wiki-front-page-bird-4.avif",
    b: "https://static.igem.wiki/teams/6187/wiki/homepage-components/birds/wiki-front-page-bird-4-2.avif",
    speed: 0.92,
    flapMs: 520,
    delayMs: 80,
    depth: "front",
  },
]

/**
 * Fraction of the waterfall band height where the puddle / ripple sits.
 * Tune against the unified front plate (lip ≈ 1380/4000).
 */
const WATER_RIPPLE_FRAC = 0.98 - LANDMARK_NUDGE_UP - 0.06

/**
 * Visible bottle band as a fraction of its layer height.
 * Higher fracs = fade finishes sooner (before deep water / shore overlap).
 */
const BOTTLE_SUBMERGE_TOP_FRAC = 0.42
const BOTTLE_SUBMERGE_BOT_FRAC = 0.72
/** Extra downward slide (px) as the bottle fades under the water. */
const BOTTLE_SINK_SLIDE_PX = 36
/** CSS splash duration (ms) when the bottle hits the water. */
const BOTTLE_SPLASH_MS = 920
/** Fire splash once the bottle is mostly faded (after fade starts, before full hide). */
const BOTTLE_SPLASH_TRIGGER_OPACITY = 0.35
/**
 * Shore-approach fade: start clearing the pinned sky bottle before the shore
 * enters the viewport so it never overlaps the second art section.
 * Values are shore-top as a fraction of viewport height.
 */
const BOTTLE_SHORE_FADE_START_VH = 0.75
const BOTTLE_SHORE_FADE_END_VH = 0.6
/** Splash anchor on the first (waterfall) art band — puddle / river start. */
const WATERFALL_SPLASH_TOP_PCT = 92 - LANDMARK_NUDGE_UP * 100 - 6
const WATERFALL_SPLASH_LEFT_PCT = 50

/**
 * Autonomous shore-bottle rematch (section1).
 * Triggers once when the river/sand band crosses an early viewport threshold after the sky
 * bottle sinks; then slowly drifts down and exits left on its own.
 */
/** Shore top below this fraction of vh → start the drift (appear as shore peeks in). */
const SHORE_BOTTLE_TRIGGER_FRAC = 1.02
/** Shore top above this → reset so the drift can replay on the next pass. */
const SHORE_BOTTLE_RESET_FRAC = 1.08
/** Total drift duration (continuous path travel). */
const SHORE_BOTTLE_DRIFT_MS = 15000
/** Sky bottle treated as sunk once fade opacity drops below this. */
const SHORE_BOTTLE_SUNK_OPACITY = 0.2

const CRAB_CDN =
  "https://static.igem.wiki/teams/6187/wiki/homepage-components/section-2-animals"

/**
 * Section-2 crabs (shore / sand). Each pair is a full transparent plate
 * (2238×3132) with the crab painted in place — same flip idea as the birds.
 * Overlay is full-bleed on the shore band from the top; `xPct` / `yPct` are
 * extra translates (% of that plate) if you need to nudge one.
 *
 * Painted spots on the plate (left%, top% = bbox; also centroid):
 *   a  left 64.4  top 6.9   (centroid 68.5, 10.4)  — upper-right sand
 *   b  left 76.6  top 11.2  (centroid 79.5, 13.4)  — further right, a bit lower
 *   c  left 30.4  top 81.4  (centroid 36.4, 86.1)  — lower-left sand
 */
const CRABS = [
  {
    id: "a",
    a: `${CRAB_CDN}/crab-section-2-a.avif`,
    b: `${CRAB_CDN}/crab-section-2-a-2.avif`,
    xPct: -10,
    yPct: 12,
    flapMs: 860,
    delayMs: 0,
  },
  {
    id: "b",
    a: `${CRAB_CDN}/crab-section-2-b.avif`,
    b: `${CRAB_CDN}/crab-section-2-b-2.avif`,
    xPct: -50,
    yPct: 30,
    flapMs: 640,
    delayMs: 180,
  },
  {
    id: "c",
    a: `${CRAB_CDN}/crab-section-2-c.avif`,
    b: `${CRAB_CDN}/crab-section-2-c-2.avif`,
    xPct: 0,
    yPct: 0,
    flapMs: 980,
    delayMs: 320,
  },
]

const SECTION3_CDN =
  "https://static.igem.wiki/teams/6187/wiki/homepage-components/section-3-animals"

/**
 * Section-3 animals (under the map, above the bushes). Same 2238×3132 plates
 * and a↔a-2 flip as the shore crabs. Overlay is full-bleed from the forest
 * band top; `xPct` / `yPct` nudge (% of the plate).
 *
 * Painted spots (bbox left%, top% / centroid):
 *   background-axolotl  25.2, 67.0  (49.6, 71.3)  — wide mid-bottom, static
 *   axolotl             80.3, 64.2  (87.2, 68.4)  — lower right
 *   bird-a              69.1, 34.9  (72.7, 37.5)  — upper right
 *   bird-b              33.3, 33.7  (35.9, 36.3)  — upper left
 *   crab-a              24.5, 53.4  (26.5, 54.4)  — mid left
 *   crab-b              17.9, 69.4  (20.1, 70.9)  — lower left
 *   crab-c              77.3, 72.3  (79.5, 74.0)  — lower right
 */
const SECTION3_ANIMALS = [
  {
    id: "background-axolotl",
    static: true,
    src: `${SECTION3_CDN}/section-3-background-axolotl.avif`,
    xPct: 0,
    yPct: 10,
  },
  {
    id: "axolotl",
    a: `${SECTION3_CDN}/section-3-axolotl.avif`,
    b: `${SECTION3_CDN}/section-3-axolotl-2.avif`,
    xPct: 1,
    yPct: 10,
    flapMs: 1100,
    delayMs: 80,
  },
  {
    id: "bird-a",
    a: `${SECTION3_CDN}/section-3-bird-a.avif`,
    b: `${SECTION3_CDN}/section-3-bird-a-2.avif`,
    xPct: 10,
    yPct: 0,
    scale: 1.32,
    originX: 72.7,
    originY: 37.5,
    hover: true,
    /** Empty transparent column on the right of the plate — drop it so scale doesn't widen the page. */
    clipRightPct: 24,
    flapMs: 480,
    delayMs: 40,
  },
  {
    id: "bird-b",
    a: `${SECTION3_CDN}/section-3-bird-b.avif`,
    b: `${SECTION3_CDN}/section-3-bird-b-2.avif`,
    xPct: -15,
    yPct: 10,
    scale: 1.32,
    originX: 35.9,
    originY: 36.3,
    hover: true,
    flapMs: 720,
    delayMs: 160,
  },
  {
    id: "crab-a",
    a: `${SECTION3_CDN}/section-3-crab-a.avif`,
    b: `${SECTION3_CDN}/section-3-crab-a-2.avif`,
    xPct: -23,
    yPct: 25,
    flapMs: 820,
    delayMs: 0,
  },
  {
    id: "crab-b",
    a: `${SECTION3_CDN}/section-3-crab-b.avif`,
    b: `${SECTION3_CDN}/section-3-crab-b-2.avif`,
    xPct: -1,
    yPct: -8,
    flapMs: 700,
    delayMs: 220,
  },
  {
    id: "crab-c",
    a: `${SECTION3_CDN}/section-3-crab-c.avif`,
    b: `${SECTION3_CDN}/section-3-crab-c-2.avif`,
    xPct: 0,
    yPct: -10,
    flapMs: 940,
    delayMs: 360,
  },
]

/**
 * Section-3 human plate (2238×3132, same overlay as the forest animals).
 * Above the painting + animals, under the bush layer. Tweak `xPct` / `yPct`.
 * Painted bbox ≈ left 31.2% top 17% (centroid 61.5, 51.2).
 */
const HUMAN = {
  src: "https://static.igem.wiki/teams/6187/wiki/homepage-components/human/human-1.avif",
  srcArrived:
    "https://static.igem.wiki/teams/6187/wiki/homepage-components/human/human-2.avif",
  xPct: 20,
  yPct: 33,
  scale: 0.47,
  originX: 61.5,
  originY: 51.2,
}

/** Extra in-flow scroll while the forest frame is sticky; maps to walk progress. */
const WALK_TRACK_VH = 120
/** Extra freeze after pose 2 + bang, so the arrived art can be seen before unpin. */
const WALK_HOLD_VH = 55
/** Keep the figure centroid at this viewport Y while the forest is frozen. */
const HUMAN_PIN_VIEW_Y = 0.68
/** Human / animal overlay plates are 2238×3132. */
const OVERLAY_PLATE_ASPECT = 3132 / 2238
/** Head on the human plate (%), for placing the bang behind it. */
const HUMAN_HEAD_X = 61.5
const HUMAN_HEAD_Y = 22
/** Bang centroid on the full-size exclamation plate (%). */
const EXCLAMATION_MARK_X = 55
const EXCLAMATION_MARK_Y = 30
const EXCLAMATION_SRC =
  "https://static.igem.wiki/teams/6187/wiki/homepage-components/human/exclamation.avif"

/**
 * Full-page wiki front compositing: Toronto parallax behind one tall front plate.
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
  const birdParallaxRefs = useRef([])
  const waterRef = useRef(null)
  const shoreRef = useRef(null)
  const walkTrackRef = useRef(null)
  const compositionRef = useRef(null)
  const humanWalkRef = useRef(null)
  const humanBobRef = useRef(null)
  const forestDatasetRef = useRef(null)
  const walkArrivedRef = useRef(false)
  const walkLatchedRef = useRef(false)
  const walkReleasedRef = useRef(false)
  const shoreBottlePlayedRef = useRef(false)
  /** True after the sky bottle finishes its waterfall sink (near-bottom unpin). */
  const skyBottleHasSunkRef = useRef(false)
  /** Keep the overlay bottle hidden after sink so it cannot reappear through the fall. */
  const skyBottleHiddenRef = useRef(false)
  /** Splash plays once per sink; reset when the sky bottle is restored. */
  const splashPlayedRef = useRef(false)
  const bottleSinkMotionRef = useRef(null)
  const bottleVisualRef = useRef(null)
  const [navPinned, setNavPinned] = useState(false)
  const [bottleTouchPinned, setBottleTouchPinned] = useState(false)
  const [shoreBottlePlaying, setShoreBottlePlaying] = useState(false)
  const [splashPlaying, setSplashPlaying] = useState(false)
  const [walkArrived, setWalkArrived] = useState(false)
  const reduceMotionParallaxRef = useRef(false)

  bottleTouchPinnedRef.current = bottleTouchPinned

  const applyBottleSinkVisual = useCallback((opacity) => {
    const visual = bottleVisualRef.current
    const sink = bottleSinkMotionRef.current
    const op = Math.max(0, Math.min(1, opacity))
    if (visual) {
      visual.style.opacity = String(op)
    }
    if (sink) {
      const slide = (1 - op) * BOTTLE_SINK_SLIDE_PX
      sink.style.transform = slide > 0.1 ? `translate3d(0, ${slide}px, 0)` : ""
    }
  }, [])

  const triggerBottleSplash = useCallback(() => {
    if (splashPlayedRef.current) return
    splashPlayedRef.current = true
    setSplashPlaying(true)
  }, [])

  const hideSkyBottle = useCallback(() => {
    skyBottleHasSunkRef.current = true
    skyBottleHiddenRef.current = true
    applyBottleSinkVisual(0)
    triggerBottleSplash()
  }, [applyBottleSinkVisual, triggerBottleSplash])

  const restoreSkyBottle = useCallback(() => {
    skyBottleHasSunkRef.current = false
    skyBottleHiddenRef.current = false
    splashPlayedRef.current = false
    setSplashPlaying(false)
    applyBottleSinkVisual(1)
  }, [applyBottleSinkVisual])

  // Reset scroll before paint so a restored mid-page scroll cannot flash a pinned/sunk bottle.
  useLayoutEffect(() => {
    if (typeof window === "undefined") return
    if (!RESET_SCROLL_ON_MOUNT) return
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
    window.scrollTo(0, 0)
    skyBottleHasSunkRef.current = false
    skyBottleHiddenRef.current = false
    splashPlayedRef.current = false
    bottleTouchPinnedRef.current = false
    bottlePinEnterScrollYRef.current = null
    applyBottleSinkVisual(1)
  }, [applyBottleSinkVisual])

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => {
      reduceMotionParallaxRef.current = mq.matches
      if (mq.matches) {
        if (parallaxBackRef.current) {
          parallaxBackRef.current.style.transform = "translate3d(0, 0, 0)"
          parallaxBackRef.current.style.willChange = "auto"
        }
        birdParallaxRefs.current.forEach((el) => {
          if (!el) return
          el.style.transform = "translate3d(0, 0, 0)"
          el.style.willChange = "auto"
        })
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
      const y = window.scrollY

      // Use ScrollStack bottom to know where the mockup section is in the viewport
      const stackBottom = stack ? stack.getBoundingClientRect().bottom : window.innerHeight

      // Release the bottle when the ScrollStack bottom crosses 45% of viewport height
      const UNPIN_THRESHOLD = window.innerHeight * 0.45
      const nearBottom = stackBottom <= UNPIN_THRESHOLD

      if (bottleTouchPinnedRef.current && nearBottom) {
        const flip = bottleFlipRef.current
        if (flip) flipUnpinFirstRef.current = flip.getBoundingClientRect()
        else flipUnpinFirstRef.current = null
        hideSkyBottle()
        bottleTouchPinnedRef.current = false
        bottlePinEnterScrollYRef.current = null
        setBottleTouchPinned(false)
        // Fall through — still run parallax / shore rematch this frame.
      }

      if (stack) {
        const rect = stack.getBoundingClientRect()
        setNavPinned(rect.top < 0 && rect.bottom > 0)
      }

      const painting = compositionRef.current
      const track = walkTrackRef.current
      const walker = humanWalkRef.current
      const reduceWalk = reduceMotionParallaxRef.current
      const walkPx = reduceWalk ? 0 : window.innerHeight * (WALK_TRACK_VH / 100)
      const holdPx = reduceWalk || walkPx <= 0 ? 0 : window.innerHeight * (WALK_HOLD_VH / 100)
      const freezePx = walkPx + holdPx
      let walkProgress = 0

      if (painting) {
        const artH = painting.offsetHeight
        const artW = painting.offsetWidth
        const plateH = artW * OVERLAY_PLATE_ASPECT
        const humanOriginY =
          FOREST_BAND_TOP * artH + ((HUMAN.originY + HUMAN.yPct) / 100) * plateH
        const forestPinY = Math.max(
          0,
          humanOriginY - window.innerHeight * HUMAN_PIN_VIEW_Y
        )
        if (reduceWalk || freezePx <= 0) {
          if (track) {
            track.style.height = ""
            track.style.paddingBottom = "0px"
          }
          painting.style.position = "relative"
          painting.style.top = "0px"
          painting.style.left = ""
          painting.style.width = ""
        } else if (track) {
          track.style.paddingBottom = "0px"
          if (walkReleasedRef.current) {
            track.style.height = `${artH}px`
            painting.style.position = "relative"
            painting.style.top = "0px"
            painting.style.left = ""
            painting.style.width = ""
          } else {
            track.style.height = `${artH + freezePx}px`
            const trackDocTop = track.getBoundingClientRect().top + y
            const pinAt = trackDocTop + forestPinY
            walkProgress = Math.max(0, Math.min(1, (y - pinAt) / Math.max(1, walkPx)))
            if (walkProgress >= 0.995) walkLatchedRef.current = true
            painting.style.left = "0px"
            painting.style.width = "100%"
            if (walkLatchedRef.current && y > pinAt + freezePx) {
              walkReleasedRef.current = true
              window.scrollTo({ top: y - freezePx, left: 0, behavior: "instant" })
              track.style.height = `${artH}px`
              painting.style.position = "relative"
              painting.style.top = "0px"
              painting.style.left = ""
              painting.style.width = ""
            } else if (y < pinAt) {
              painting.style.position = "absolute"
              painting.style.top = "0px"
            } else if (y <= pinAt + freezePx) {
              painting.style.position = "fixed"
              painting.style.top = `${-forestPinY}px`
            } else {
              painting.style.position = "absolute"
              painting.style.top = `${freezePx}px`
            }
          }
        }
        if (walker) {
          const latched = walkLatchedRef.current
          const p = latched ? 1 : walkProgress
          const paintingLeft = painting.getBoundingClientRect().left
          const startX = ((HUMAN.originX + HUMAN.xPct) / 100) * painting.offsetWidth
          const extraXMax = window.innerWidth / 2 - (paintingLeft + startX)
          const extraX = extraXMax * p
          walker.style.transform = extraX ? `translate3d(${extraX}px, 0, 0)` : ""
          walker.style.willChange = !latched && p > 0 && p < 1 ? "transform" : "auto"
          if (humanBobRef.current) {
            humanBobRef.current.dataset.walking =
              !latched && walkProgress > 0.02 && walkProgress < 0.995 ? "1" : ""
          }
          if (forestDatasetRef.current) {
            forestDatasetRef.current.style.opacity =
              reduceWalk || latched ? "1" : String(walkProgress)
          }
          if (latched !== walkArrivedRef.current) {
            walkArrivedRef.current = latched
            setWalkArrived(latched)
          }
        }
      }

      const paintingRect = painting ? painting.getBoundingClientRect() : null
      if (painting && paintingRect) {
        const scrolledInto = Math.max(0, -paintingRect.top)
        const offset = reduceMotionParallaxRef.current
          ? 0
          : scrolledInto * (1 - BACK_PARALLAX_SPEED)
        if (parallaxBackRef.current) {
          parallaxBackRef.current.style.transform = `translate3d(0, ${offset}px, 0)`
          parallaxBackRef.current.style.willChange = offset > 0 ? "transform" : "auto"
        }
        BIRDS.forEach((bird, i) => {
          const el = birdParallaxRefs.current[i]
          if (!el) return
          const birdOffset = reduceMotionParallaxRef.current
            ? 0
            : scrolledInto * (1 - bird.speed)
          el.style.transform = `translate3d(0, ${birdOffset}px, 0)`
          el.style.willChange = birdOffset > 0 ? "transform" : "auto"
        })
      }

      // Water surface (ripple) viewport position — the "barrier" the bottle sinks behind.
      const water = waterRef.current
      let rippleY = null
      if (water) {
        const wr = water.getBoundingClientRect()
        rippleY = wr.top + wr.height * WATER_RIPPLE_FRAC
      }

      // Clear the sky bottle before the shore (2nd section) overlaps the pinned bottle.
      let shoreApproachOp = 1
      const shoreEl = shoreRef.current
      if (shoreEl) {
        const shoreTop = shoreEl.getBoundingClientRect().top
        const vh = window.innerHeight
        const fadeStart = vh * BOTTLE_SHORE_FADE_START_VH
        const fadeEnd = vh * BOTTLE_SHORE_FADE_END_VH
        shoreApproachOp = Math.max(
          0,
          Math.min(1, (shoreTop - fadeEnd) / Math.max(1, fadeStart - fadeEnd))
        )
      }

      if (bottleTouchPinnedRef.current) {
        const pin0 = bottlePinEnterScrollYRef.current
        if (pin0 != null && y < pin0 - BOTTLE_PIN_SCROLL_UP_LEAVE) {
          const flip = bottleFlipRef.current
          if (flip) {
            flipUnpinFirstRef.current = flip.getBoundingClientRect()
          } else {
            flipUnpinFirstRef.current = null
          }
          restoreSkyBottle()
          bottleTouchPinnedRef.current = false
          bottlePinEnterScrollYRef.current = null
          setBottleTouchPinned(false)
        } else {
          // Fade from water ripple + shore approach (whichever clears the bottle first).
          if (skyBottleHiddenRef.current) {
            applyBottleSinkVisual(0)
          } else {
            const flip = bottleFlipRef.current
            let rippleOp = 1
            if (flip && rippleY != null) {
              const fr = flip.getBoundingClientRect()
              const topY = fr.top + BOTTLE_SUBMERGE_TOP_FRAC * fr.height
              const botY = fr.top + BOTTLE_SUBMERGE_BOT_FRAC * fr.height
              const span = Math.max(1, botY - topY)
              rippleOp = Math.max(0, Math.min(1, (rippleY - topY) / span))
            }
            const op = Math.min(rippleOp, shoreApproachOp)
            applyBottleSinkVisual(op)
            // Splash after fade is underway, still on the waterfall section.
            if (op < BOTTLE_SPLASH_TRIGGER_OPACITY) {
              triggerBottleSplash()
            }
            if (op < SHORE_BOTTLE_SUNK_OPACITY) {
              hideSkyBottle()
            }
          }
        }
      } else if (bottleSpot) {
        const flip = bottleFlipRef.current
        const br = bottleSpot.getBoundingClientRect()
        const bottleMidY = br.top + br.height / 2
        const viewMidY = window.innerHeight / 2

        if (skyBottleHiddenRef.current) {
          // Stay hidden after sink. Restore only once scrolled back up past the pin zone.
          applyBottleSinkVisual(0)
          if (!nearBottom && shoreApproachOp >= 0.98 && (bottleMidY > viewMidY + 24 || y < 64)) {
            restoreSkyBottle()
          }
        } else {
          if (flip && !skyBottleHiddenRef.current) {
            // Idle / pre-pin: fully visible (do not clear a mid-fade if somehow present).
            applyBottleSinkVisual(1)
          }
          if (!nearBottom && bottleMidY <= viewMidY && br.bottom > 32) {
            if (flip) flipPinFirstRef.current = flip.getBoundingClientRect()
            else flipPinFirstRef.current = null
            bottlePinEnterScrollYRef.current = y
            bottleTouchPinnedRef.current = true
            setBottleTouchPinned(true)
          }
        }
      }

      // Shore rematch: trigger a slow autonomous drift once the sky bottle has sunk
      // and the shore is just entering the viewport (earlier than a mid-shore scrub).
      const shore = shoreRef.current
      if (shore) {
        const rect = shore.getBoundingClientRect()
        const vh = window.innerHeight
        if (rect.top > vh * SHORE_BOTTLE_RESET_FRAC) {
          if (shoreBottlePlayedRef.current) {
            shoreBottlePlayedRef.current = false
            setShoreBottlePlaying(false)
          }
        } else if (
          skyBottleHasSunkRef.current &&
          !shoreBottlePlayedRef.current &&
          rect.top < vh * SHORE_BOTTLE_TRIGGER_FRAC
        ) {
          shoreBottlePlayedRef.current = true
          setShoreBottlePlaying(true)
        }
      }
    }

    tick()
    window.addEventListener("scroll", tick, { passive: true })
    window.addEventListener("resize", tick, { passive: true })
    const paintingEl = compositionRef.current
    const resizeObserver =
      typeof ResizeObserver !== "undefined" && paintingEl
        ? new ResizeObserver(() => tick())
        : null
    if (resizeObserver && paintingEl) resizeObserver.observe(paintingEl)
    return () => {
      window.removeEventListener("scroll", tick)
      window.removeEventListener("resize", tick)
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [applyBottleSinkVisual, hideSkyBottle, restoreSkyBottle, triggerBottleSplash])

  // Reduced-motion path has no CSS animationend — clear the quiet mid-pose after a beat.
  useEffect(() => {
    if (!shoreBottlePlaying || typeof window === "undefined") return undefined
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!reduce) return undefined
    const t = window.setTimeout(() => setShoreBottlePlaying(false), 2200)
    return () => window.clearTimeout(t)
  }, [shoreBottlePlaying])

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
        <WalkTrack ref={walkTrackRef}>
          <CompositionRoot ref={compositionRef}>
          <BackScene>
            <ParallaxBack ref={parallaxBackRef}>
              <BackRailImg src={ASSETS.back} alt="Wiki front — background scenery" />
            </ParallaxBack>
            <BirdsStack aria-hidden="true">
              {BIRDS.map((bird, i) => (
                <BirdParallax
                  key={bird.id}
                  $z={bird.z ?? (bird.depth === "front" ? 2 : 1)}
                  ref={(el) => {
                    birdParallaxRefs.current[i] = el
                  }}
                >
                  <BirdDrift
                    $enabled={bird.depth === "back"}
                    $durationMs={bird.driftMs || 36000}
                    $delayMs={bird.driftDelayMs || 0}
                  >
                    <BirdHoverMotion $delayMs={bird.delayMs}>
                      <BirdFlapper>
                        <BirdFrame
                          $phase="a"
                          $durationMs={bird.flapMs}
                          $delayMs={bird.delayMs}
                          src={bird.a}
                          alt=""
                        />
                        <BirdFrame
                          $phase="b"
                          $durationMs={bird.flapMs}
                          $delayMs={bird.delayMs}
                          src={bird.b}
                          alt=""
                        />
                      </BirdFlapper>
                    </BirdHoverMotion>
                  </BirdDrift>
                </BirdParallax>
              ))}
            </BirdsStack>
          </BackScene>

          <FlowSizer>
            <RailImg src={ASSETS.front} alt="" />
          </FlowSizer>

          <ArtBand
            ref={waterRef}
            $top={WATERFALL_BAND_TOP}
            $height={WATERFALL_BAND_HEIGHT}
            $z={2}
          >
            <OverlayStack>
              <OverlaySlice $z={Z.text} $interactive>
                <WaterfallSideText />
              </OverlaySlice>
              <OverlaySlice $z={Z.logo}>
                <LogoShiftWrap>
                  <LogoFloatWrap>
                    <LogoFlapper aria-label="PETABITE">
                      {LOGO_FRAMES.map((src, i) => (
                        <LogoFrame
                          key={src}
                          src={src}
                          alt={i === 0 ? "PETABITE" : ""}
                          aria-hidden={i !== 0}
                          $index={i}
                        />
                      ))}
                    </LogoFlapper>
                  </LogoFloatWrap>
                </LogoShiftWrap>
              </OverlaySlice>
              <OverlaySlice $z={Z.bottle}>
                <BottlePinSpot ref={bottleTouchRef} $touchPinned={bottleTouchPinned}>
                  <BottleFlipSurface ref={bottleFlipRef}>
                    <BottleStickyRock $active={bottleTouchPinned}>
                      <BottleShiftWrap>
                        <BottleSinkMotion ref={bottleSinkMotionRef}>
                          <BottleFloatWrap>
                            <BottleVisual ref={bottleVisualRef}>
                              <RailImg src={ASSETS.bottle} alt="" />
                            </BottleVisual>
                          </BottleFloatWrap>
                        </BottleSinkMotion>
                      </BottleShiftWrap>
                    </BottleStickyRock>
                  </BottleFlipSurface>
                </BottlePinSpot>
              </OverlaySlice>
              <OverlaySlice $z={Z.text}>
                {splashPlaying ? (
                  <WaterfallSplashAnchor
                    key="bottle-splash"
                    aria-hidden="true"
                    onAnimationEnd={(e) => {
                      if (e.target !== e.currentTarget) return
                      setSplashPlaying(false)
                    }}
                  >
                    <SplashRipple $delay={0} />
                    <SplashRipple $delay={120} $large />
                    <SplashDrop $n={0} />
                    <SplashDrop $n={1} />
                    <SplashDrop $n={2} />
                    <SplashDrop $n={3} />
                    <SplashDrop $n={4} />
                    <SplashDrop $n={5} />
                    <SplashDrop $n={6} />
                    <SplashFoam />
                  </WaterfallSplashAnchor>
                ) : null}
              </OverlaySlice>
            </OverlayStack>
          </ArtBand>

          <ArtBand
            ref={shoreRef}
            $top={SHORE_BAND_TOP}
            $height={SHORE_BAND_HEIGHT}
            $z={3}
          >
            <ShoreOverlayStack>
              <CrabsStack aria-hidden="true">
                {CRABS.map((crab) => (
                  <CrabMount key={crab.id} $xPct={crab.xPct} $yPct={crab.yPct}>
                    <CrabFlapper>
                      <CrabFrame
                        $phase="a"
                        $durationMs={crab.flapMs}
                        $delayMs={crab.delayMs}
                        src={crab.a}
                        alt=""
                      />
                      <CrabFrame
                        $phase="b"
                        $durationMs={crab.flapMs}
                        $delayMs={crab.delayMs}
                        src={crab.b}
                        alt=""
                      />
                    </CrabFlapper>
                  </CrabMount>
                ))}
              </CrabsStack>
              <ShoreBottleLayer $z={3}>
                <ShoreBottleMount
                  $playing={shoreBottlePlaying}
                  onAnimationEnd={(e) => {
                    if (e.target !== e.currentTarget) return
                    setShoreBottlePlaying(false)
                  }}
                >
                  <ShoreBottleSize>
                    <ShoreBottleRock $playing={shoreBottlePlaying}>
                      <ShoreBottleImg src={SHORE_BOTTLE_IMG} alt="" />
                    </ShoreBottleRock>
                  </ShoreBottleSize>
                </ShoreBottleMount>
              </ShoreBottleLayer>
              <ShoreTextLayer $z={4}>
                <ShorePetaseMount>
                  <ShorePetaseBody>
                    To combat this, we are engineering plastic-degrading enzymes or{" "}
                    <ExplainTerm term="PETases" explanation={PETASE_EXPLANATION} />.
                  </ShorePetaseBody>
                </ShorePetaseMount>
                <ShoreTextMount>
                  <ShoreBody>
                    However, PETases currently in industry have a major limitation...
                  </ShoreBody>
                </ShoreTextMount>
                <ShoreMidTextMount>
                  <ShoreMidBody>
                    ...the current enzymes only work under…
                  </ShoreMidBody>
                </ShoreMidTextMount>
                <ShoreCardsMount>
                  <SwipeInBox stationary title="...3 specific conditions">
                    <ConditionImageRow>
                      {CONDITION_CARD_IMAGES.map((image) => (
                        <ConditionFigure key={image.alt}>
                          <ConditionImage src={image.src} alt={image.alt} />
                          <ConditionCaption>{image.alt}</ConditionCaption>
                        </ConditionFigure>
                      ))}
                    </ConditionImageRow>
                  </SwipeInBox>
                </ShoreCardsMount>
                <ShoreLoganMount>
                  <ShoreLoganBody>
                    That&apos;s why our team has developed the LOGAN index: a planetary sequence
                    search that discovers novel plastic-degrading enzymes.
                  </ShoreLoganBody>
                </ShoreLoganMount>
              </ShoreTextLayer>
            </ShoreOverlayStack>
          </ArtBand>

          <ArtBand $top={FOREST_BAND_TOP} $height={FOREST_BAND_HEIGHT} $z={3}>
            <ForestAnimalsStack aria-hidden="true">
              {SECTION3_ANIMALS.map((animal) =>
                animal.static ? (
                  <CrabMount key={animal.id} $xPct={animal.xPct} $yPct={animal.yPct}>
                    <CrabFlapper>
                      <StaticPlateImg src={animal.src} alt="" />
                    </CrabFlapper>
                  </CrabMount>
                ) : (
                  <CrabMount key={animal.id} $xPct={animal.xPct} $yPct={animal.yPct}>
                    <AnimalMotion
                      $scale={animal.scale || 1}
                      $ox={animal.originX}
                      $oy={animal.originY}
                      $hover={animal.hover}
                      $delayMs={animal.delayMs}
                      $clipRightPct={animal.clipRightPct || 0}
                    >
                      <CrabFlapper>
                        <CrabFrame
                          $phase="a"
                          $durationMs={animal.flapMs}
                          $delayMs={animal.delayMs}
                          $hoverFlap={animal.hover}
                          src={animal.a}
                          alt=""
                        />
                        <CrabFrame
                          $phase="b"
                          $durationMs={animal.flapMs}
                          $delayMs={animal.delayMs}
                          $hoverFlap={animal.hover}
                          src={animal.b}
                          alt=""
                        />
                      </CrabFlapper>
                    </AnimalMotion>
                  </CrabMount>
                )
              )}
            </ForestAnimalsStack>
          </ArtBand>

          <ArtBand $top={FOREST_BAND_TOP} $height={FOREST_BAND_HEIGHT} $z={20}>
            <HumanWalkLayer ref={humanWalkRef} aria-hidden="true">
              <HumanBob ref={humanBobRef} $arrived={walkArrived}>
              <CrabMount $xPct={HUMAN.xPct} $yPct={HUMAN.yPct}>
                <AnimalMotion
                  $scale={HUMAN.scale}
                  $ox={HUMAN.originX}
                  $oy={HUMAN.originY}
                >
                  <CrabFlapper>
                    <ExclamationMark
                      $dx={HUMAN_HEAD_X - EXCLAMATION_MARK_X}
                      $dy={HUMAN_HEAD_Y - EXCLAMATION_MARK_Y}
                    >
                      <ExclamationPop $show={walkArrived}>
                        <StaticPlateImg src={EXCLAMATION_SRC} alt="" />
                      </ExclamationPop>
                    </ExclamationMark>
                    <HumanPose $show={!walkArrived}>
                      <StaticPlateImg src={HUMAN.src} alt="" />
                    </HumanPose>
                    <HumanPose $show={walkArrived} $fill>
                      <StaticPlateImg src={HUMAN.srcArrived} alt="" />
                    </HumanPose>
                  </CrabFlapper>
                </AnimalMotion>
              </CrabMount>
              </HumanBob>
            </HumanWalkLayer>
          </ArtBand>

          <ArtBand $top={FOREST_BAND_TOP} $height={FOREST_BAND_HEIGHT} $z={21}>
            <ForestDatasetMount ref={forestDatasetRef}>
              <ForestDatasetBody>
                Before, the industry was using an enzyme dataset of roughly 200.
              </ForestDatasetBody>
            </ForestDatasetMount>
          </ArtBand>

          <BushLayer>
            <RailImg src={ASSETS.bush} alt="" />
          </BushLayer>

          <ArtBand $top={CREAM_PAD_TOP} $height={CREAM_PAD_HEIGHT} $z={4}>
            <CreamPadTextMount>
              <CreamPadBody>
                With our advisory lab, the{" "}
                <ExplainTerm
                  term="RNAlab"
                  explanation={RNALAB_EXPLANATION}
                  imageSrc={RNALAB_TEXTBOX_IMG}
                  imageAlt="RNAlab"
                />
                , the team uncovered 215.7 million high-quality plastic‑degrading enzymes — a
                1,000,000‑fold increase from the enzyme landscape previously known.
              </CreamPadBody>
            </CreamPadTextMount>
          </ArtBand>
          </CompositionRoot>
        </WalkTrack>

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

const WalkTrack = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
`

const CompositionRoot = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  min-width: 0;
  overflow: hidden;
`

const HumanWalkLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`

const humanWalkBob = keyframes`
  0%,
  49.9% {
    transform: translate3d(0, 0, 0);
  }
  50%,
  100% {
    transform: translate3d(0, -12px, 0);
  }
`

const humanArriveJump = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  32% {
    transform: translate3d(0, -26px, 0);
  }
  52% {
    transform: translate3d(0, 5px, 0);
  }
  72% {
    transform: translate3d(0, -11px, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
`

const HumanBob = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;

  &[data-walking="1"] {
    animation: ${humanWalkBob} 0.4s steps(1, end) infinite;
  }

  ${({ $arrived }) =>
    $arrived &&
    css`
      animation: ${humanArriveJump} 0.64s cubic-bezier(0.22, 1.35, 0.32, 1) 1;
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const bangPopIn = keyframes`
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

const bangIdleSway = keyframes`
  0%,
  49.9% {
    transform: rotate(-8deg);
  }
  50%,
  100% {
    transform: rotate(8deg);
  }
`

const ExclamationMark = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 1;
  transform: translate3d(${({ $dx }) => $dx || 0}%, ${({ $dy }) => $dy || 0}%, 0);
  pointer-events: none;
`

const ExclamationPop = styled.div`
  width: 100%;
  transform-origin: ${EXCLAMATION_MARK_X}% ${EXCLAMATION_MARK_Y}%;
  opacity: ${({ $show }) => ($show ? 1 : 0)};

  ${({ $show }) =>
    $show
      ? css`
          animation:
            ${bangPopIn} 420ms cubic-bezier(0.34, 1.45, 0.64, 1) both,
            ${bangIdleSway} 1.4s steps(1, end) 420ms infinite;
        `
      : css`
          animation: none;
        `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: ${({ $show }) => ($show ? 1 : 0)};
    transform: none;
  }
`

const HumanPose = styled.div`
  position: ${({ $fill }) => ($fill ? "absolute" : "relative")};
  left: 0;
  top: 0;
  width: 100%;
  z-index: 2;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  pointer-events: none;
`

/** Toronto + birds, height from the back plate — sits in the transparent sky hole. */
const BackScene = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
`

const FlowSizer = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  pointer-events: none;
`

/** Frontmost scenery (bushes). Above Toronto, painting, and animals; below site nav. */
const BushLayer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 30;
  pointer-events: none;
`

/** Overlay band as a fraction of the unified front canvas. */
const ArtBand = styled.div`
  position: absolute;
  left: 0;
  width: 100%;
  top: ${({ $top }) => `${$top * 100}%`};
  height: ${({ $height }) => `${$height * 100}%`};
  z-index: ${({ $z }) => $z};
  pointer-events: none;
  overflow: visible;
`

const CrabsStack = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: visible;
`

const ForestAnimalsStack = styled(CrabsStack)`
  pointer-events: auto;
`

const animalHoverBob = keyframes`
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(var(--animal-scale, 1));
  }
  50% {
    transform: translate3d(0, -10px, 0) scale(var(--animal-scale, 1));
  }
`

const animalHoverBobStrong = keyframes`
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(var(--animal-scale, 1));
  }
  50% {
    transform: translate3d(0, -18px, 0) scale(calc(var(--animal-scale, 1) * 1.08));
  }
`

const AnimalMotion = styled.div`
  width: 100%;
  transform-origin: ${({ $ox, $oy }) =>
    `${$ox != null ? $ox : 50}% ${$oy != null ? $oy : 50}%`};
  --animal-scale: ${({ $scale }) => $scale || 1};
  transform: scale(var(--animal-scale));
  clip-path: ${({ $clipRightPct }) =>
    $clipRightPct > 0 ? `inset(0 ${$clipRightPct}% 0 0)` : "none"};

  ${({ $hover, $delayMs }) =>
    $hover &&
    css`
      animation: ${animalHoverBob} 3.6s ease-in-out infinite;
      animation-delay: ${($delayMs || 0) * 0.5}ms;

      ${ForestAnimalsStack}:hover & {
        animation-name: ${animalHoverBobStrong};
        animation-duration: 2.4s;
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const CrabMount = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  transform: translate3d(${({ $xPct }) => $xPct || 0}%, ${({ $yPct }) => $yPct || 0}%, 0);
  pointer-events: none;
`

const CrabFlapper = styled.div`
  position: relative;
  width: 100%;
`

const crabFlapA = keyframes`
  0%,
  49.9% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
`

const crabFlapB = keyframes`
  0%,
  49.9% {
    opacity: 0;
  }
  50%,
  100% {
    opacity: 1;
  }
`

const CrabFrame = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  user-select: none;
  pointer-events: none;
  opacity: ${({ $phase }) => ($phase === "a" ? 1 : 0)};
  animation-name: ${({ $phase }) => ($phase === "a" ? crabFlapA : crabFlapB)};
  animation-duration: ${({ $durationMs }) => `${$durationMs || 720}ms`};
  animation-delay: ${({ $delayMs }) => `${$delayMs || 0}ms`};
  animation-timing-function: steps(1, end);
  animation-iteration-count: infinite;

  &:first-child {
    position: relative;
  }

  ${({ $hoverFlap, $durationMs }) =>
    $hoverFlap &&
    css`
      ${ForestAnimalsStack}:hover & {
        animation-duration: ${Math.round(($durationMs || 720) * 0.72)}ms;
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: ${({ $phase }) => ($phase === "a" ? 1 : 0)};
  }
`

const StaticPlateImg = styled.img`
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  user-select: none;
  pointer-events: none;
`

const ShoreOverlayStack = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
`

const ShoreTextLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: ${({ $z }) => $z};
  pointer-events: none;
`

/** Rematched section1 bottle: autonomous slow drift along the river, under shore copy. */
const ShoreBottleLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: ${({ $z }) => $z};
  pointer-events: none;
  overflow: hidden;
`

/**
 * Path: appear high on the right early, drift mostly downward for a long stretch,
 * then sweep left to exit near the end.
 * Linear timing so it does not ease/idle at each waypoint.
 */
const shoreBottleDrift = keyframes`
  0% {
    left: 104%;
    top: 10%;
    opacity: 0;
  }
  4% {
    left: 102%;
    top: 14%;
    opacity: 1;
  }
  45% {
    left: 96%;
    top: 42%;
    opacity: 1;
  }
  68% {
    left: 90%;
    top: 64%;
    opacity: 1;
  }
  82% {
    left: 58%;
    top: 74%;
    opacity: 1;
  }
  100% {
    left: -16%;
    top: 82%;
    opacity: 1;
  }
`

const ShoreBottleMount = styled.div`
  position: absolute;
  left: 104%;
  top: 10%;
  width: 25%;
  max-width: 12rem;
  transform: translate3d(-50%, -55%, 0);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;

  ${({ $playing }) =>
    $playing
      ? css`
          visibility: visible;
          animation: ${shoreBottleDrift} ${SHORE_BOTTLE_DRIFT_MS}ms linear forwards;
        `
      : css`
          animation: none;
        `}

  @media (prefers-reduced-motion: reduce) {
    ${({ $playing }) =>
      $playing
        ? css`
            /* Keep a quiet mid-path pose; no long drift. */
            visibility: visible;
            animation: none;
            left: 92%;
            top: 48%;
            opacity: 0.9;
          `
        : css`
            animation: none;
          `}
  }
`

/** Match sky bottle display size (width set on mount vs shore box). */
const ShoreBottleSize = styled.div`
  width: 100%;
`

const shoreBottleRock = keyframes`
  0%,
  100% {
    transform: rotate(-5deg) translate3d(0, 0, 0);
  }
  50% {
    transform: rotate(5deg) translate3d(0, -4px, 0);
  }
`

const ShoreBottleRock = styled.div`
  width: 100%;
  transform-origin: 50% 70%;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.28));

  ${({ $playing }) =>
    $playing
      ? css`
          animation: ${shoreBottleRock} 2.4s ease-in-out infinite;
        `
      : css`
          animation: none;
        `}

  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
  }
`

const ShoreBottleImg = styled.img`
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
  pointer-events: none;
`

/** Centered PETases line where the condition cards used to sit (top of shore). */
const ShorePetaseMount = styled.div`
  position: absolute;
  top: -16%;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  width: min(72%, 48rem);
  max-width: calc(100% - 10%);
  box-sizing: border-box;
  pointer-events: auto;
  text-align: center;

  @media (max-width: 720px) {
    top: -20%;
    width: min(86%, 92vw);
  }
`

const ShorePetaseBody = styled.p`
  margin: 0;
  color: #fff;
  font-family: var(--font-body);
  font-size: clamp(1.25rem, 2.5vw, 2.55rem);
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: break-word;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.55),
    0 0 14px rgba(0, 0, 0, 0.35);
`

/** Sits on the sand bank (left/center of the shore art). */
const ShoreTextMount = styled.div`
  position: absolute;
  top: 14%;
  left: max(env(safe-area-inset-left, 0px), 5%);
  width: min(38%, 28rem);
  max-width: calc(100% - 14%);
  box-sizing: border-box;
  pointer-events: none;

  @media (max-width: 720px) {
    top: 12%;
    left: max(env(safe-area-inset-left, 0px), 4%);
    width: min(46%, 44vw);
  }
`

const ShoreBody = styled.p`
  margin: 0;
  color: #0a0a0a;
  font-family: var(--font-body);
  font-size: clamp(1.15rem, 2.2vw, 2.3rem);
  font-weight: 600;
  line-height: 1.4;
  overflow-wrap: break-word;
`

/** Short line on the right, along the bottle’s downward path (between LOGAN and RNAlab). */
const ShoreMidTextMount = styled.div`
  position: absolute;
  top: 42%;
  right: max(env(safe-area-inset-right, 0px), 5%);
  left: auto;
  width: min(36%, 28rem);
  box-sizing: border-box;
  pointer-events: none;
  text-align: center;

  @media (max-width: 720px) {
    top: 40%;
    width: min(44%, 42vw);
    right: max(env(safe-area-inset-right, 0px), 4%);
  }
`

const ShoreMidBody = styled.p`
  margin: 0;
  color: #fff;
  font-family: var(--font-body);
  font-size: clamp(1.2rem, 2.3vw, 2.4rem);
  font-weight: 600;
  line-height: 1.35;
  overflow-wrap: break-word;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.55),
    0 0 14px rgba(0, 0, 0, 0.35);
`

/** Condition cards + “...3 specific conditions” on the lower sand. */
const ShoreCardsMount = styled.div`
  pointer-events: none;

  /* SwipeInBox AnchoredStage defaults to top: -16% (old card slot). */
  & > div {
    top: 70%;
  }

  @media (max-width: 720px) {
    & > div {
      top: 67%;
    }
  }
`

/** Centered LOGAN line just above the world map. */
const ShoreLoganMount = styled.div`
  position: absolute;
  top: auto;
  bottom: -14%;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  width: min(70%, 46rem);
  max-width: calc(100% - 10%);
  box-sizing: border-box;
  pointer-events: none;
  text-align: center;

  @media (max-width: 720px) {
    bottom: -11%;
    width: min(84%, 92vw);
  }
`

const ShoreLoganBody = styled.p`
  margin: 0;
  color: #0a0a0a;
  font-family: var(--font-body);
  font-size: clamp(1.15rem, 2.2vw, 2.3rem);
  font-weight: 600;
  line-height: 1.4;
  overflow-wrap: break-word;
`

/** Dataset line left of the walker; opacity driven by walk progress. */
const ForestDatasetMount = styled.div`
  position: absolute;
  top: 70%;
  left: max(env(safe-area-inset-left, 0px), 11%);
  width: min(28%, 20rem);
  max-width: calc(42% - 8%);
  box-sizing: border-box;
  pointer-events: none;
  text-align: left;
  opacity: 0;

  @media (max-width: 720px) {
    top: 68%;
    left: max(env(safe-area-inset-left, 0px), 8%);
    width: min(38%, 34vw);
  }
`

const ForestDatasetBody = styled.p`
  margin: 0;
  color: #0a0a0a;
  font-family: var(--font-body);
  font-size: clamp(1.15rem, 2.2vw, 2.3rem);
  font-weight: 600;
  line-height: 1.4;
  overflow-wrap: break-word;
`

/** RNAlab copy on the cream pad below the bushes. */
const CreamPadTextMount = styled.div`
  position: absolute;
  top: 18%;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  width: min(72%, 48rem);
  max-width: calc(100% - 10%);
  box-sizing: border-box;
  pointer-events: auto;
  text-align: center;
`

const CreamPadBody = styled.p`
  margin: 0;
  color: #0a0a0a;
  font-family: var(--font-body);
  font-size: clamp(1.15rem, 2.2vw, 2.3rem);
  font-weight: 600;
  line-height: 1.4;
  overflow-wrap: break-word;
`

const ConditionImageRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(0.55rem, 2.4vw, 1.75rem);
  margin-top: clamp(0.7rem, 2.2vw, 1.75rem);
  align-items: start;
`

const ConditionFigure = styled.figure`
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
`

const ConditionImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
  /* Same desktop max as before; drop the 14rem floor so narrow windows can shrink. */
  max-height: clamp(6rem, 36vw, 24rem);
  object-fit: contain;
  user-select: none;
  pointer-events: none;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.35))
    drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
`

const ConditionCaption = styled.figcaption`
  margin: 0;
  color: #fff;
  font-family: var(--font-body);
  font-size: clamp(0.85rem, 2.8vw, 1.85rem);
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.55),
    0 0 12px rgba(0, 0, 0, 0.35);
`

const RailImg = styled.img`
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  user-select: none;
  pointer-events: none;
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

const BirdsStack = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: auto;
  overflow: hidden;
`

const BirdParallax = styled.div`
  position: absolute;
  inset: 0;
  z-index: ${({ $z }) => $z ?? 1};
  will-change: auto;
  pointer-events: none;

  @media (prefers-reduced-motion: reduce) {
    transform: none !important;
    will-change: auto;
  }
`

const birdFlapA = keyframes`
  0%,
  49.9% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
`

const birdFlapB = keyframes`
  0%,
  49.9% {
    opacity: 0;
  }
  50%,
  100% {
    opacity: 1;
  }
`

const birdHoverBob = keyframes`
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -10px, 0);
  }
`

const birdHoverBobStrong = keyframes`
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(0, -18px, 0) scale(1.02);
  }
`

const birdFlyAcross = keyframes`
  0%,
  18% {
    transform: translate3d(0, 0, 0);
  }
  72% {
    transform: translate3d(-115%, 0, 0);
  }
  72.01% {
    transform: translate3d(115%, 0, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
`

const BirdDrift = styled.div`
  position: absolute;
  inset: 0;

  ${({ $enabled, $durationMs, $delayMs }) =>
    $enabled &&
    css`
      animation: ${birdFlyAcross} ${$durationMs || 36000}ms linear infinite;
      animation-delay: ${$delayMs || 0}ms;
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const BirdHoverMotion = styled.div`
  position: absolute;
  inset: 0;
  transform-origin: center center;
  animation: ${birdHoverBob} 3.6s ease-in-out infinite;
  animation-delay: ${({ $delayMs }) => `${($delayMs || 0) * 0.5}ms`};

  ${BirdsStack}:hover & {
    animation-name: ${birdHoverBobStrong};
    animation-duration: 2.4s;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const BirdFlapper = styled.div`
  position: absolute;
  inset: 0;
`

const BirdFrame = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  user-select: none;
  pointer-events: none;
  opacity: ${({ $phase }) => ($phase === "a" ? 1 : 0)};
  animation-name: ${({ $phase }) => ($phase === "a" ? birdFlapA : birdFlapB)};
  animation-duration: ${({ $durationMs }) => `${$durationMs || 520}ms`};
  animation-delay: ${({ $delayMs }) => `${$delayMs || 0}ms`};
  animation-timing-function: steps(1, end);
  animation-iteration-count: infinite;

  ${BirdsStack}:hover & {
    animation-duration: ${({ $durationMs }) => `${Math.round(($durationMs || 520) * 0.72)}ms`};
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: ${({ $phase }) => ($phase === "a" ? 1 : 0)};
  }
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

/** Nudge PETABITE title up within the legacy art band (negative = higher). */
const LOGO_SHIFT_FRAC = -0.38

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

/** Very slow, subtle sway only while the bottle is in touch "sticky" (fixed) mode. */
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

const LogoShiftWrap = styled.div`
  width: 100%;
  height: 100%;
  transform: translate3d(0, ${LOGO_SHIFT_FRAC * 100}%, 0);
`

const LogoFloatWrap = styled.div`
  width: 100%;
  animation: ${logoIdleFloat} 4.2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

/** Stacked frames; first image stays in-flow so the rail keeps its height. */
const LogoFlapper = styled.div`
  position: relative;
  width: 100%;
`

const LogoFrame = styled.img`
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  user-select: none;
  pointer-events: none;
  opacity: 0;
  animation-name: ${({ $index }) => LOGO_FRAME_KEYFRAMES[$index] || LOGO_FRAME_KEYFRAMES[0]};
  animation-duration: ${LOGO_FRAME_TIMING.cycleMs}ms;
  animation-timing-function: steps(1, end);
  animation-iteration-count: infinite;

  ${({ $index }) =>
    $index > 0 &&
    css`
      position: absolute;
      left: 0;
      top: 0;
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: ${({ $index }) => ($index === 0 ? 1 : 0)};
  }
`

/** Owns FLIP `transform` so parent pin spot can stay `position: fixed` without fighting this layer. */
const BottleFlipSurface = styled.div`
  width: 100%;
`

/** Scroll-driven sink slide (separate from FLIP transform on BottleFlipSurface). */
const BottleSinkMotion = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  will-change: transform;
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
          position: absolute;
          left: 0;
          right: 0;
          top: ${BOTTLE_TOP_FRAC * 100}%;
        `}
`

/** Centers the bottle; inner wrap adds idle float. */
const BottleShiftWrap = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

const BottleFloatWrap = styled.div`
  position: relative;
  /* Desktop stays ~12rem; shrinks with the window below that. */
  width: clamp(5.25rem, 18vw, 12rem);
  max-width: 25%;
  animation: ${bottleIdleFloat} 1.5s ease-in-out infinite;
  animation-delay: -0.7s;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

/** Opacity target for the sky bottle image (splash stays as a sibling so it can play). */
const BottleVisual = styled.div`
  width: 100%;
  will-change: opacity;
`

const splashBurst = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.55);
  }
  18% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.05);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.2);
  }
`

const splashRipple = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.2);
    opacity: 0.95;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.85);
    opacity: 0;
  }
`

const splashDrop = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.55);
    opacity: 1;
  }
  40% {
    opacity: 0.95;
  }
  100% {
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.2);
    opacity: 0;
  }
`

const splashFoam = keyframes`
  0% {
    transform: translate(-50%, -40%) scale(0.4);
    opacity: 0;
  }
  20% {
    opacity: 0.9;
  }
  100% {
    transform: translate(-50%, -70%) scale(1.35);
    opacity: 0;
  }
`

/** Splash anchored on the first art band at the river / puddle start. */
const WaterfallSplashAnchor = styled.div`
  position: absolute;
  left: ${WATERFALL_SPLASH_LEFT_PCT}%;
  top: ${WATERFALL_SPLASH_TOP_PCT}%;
  z-index: 6;
  width: min(28vw, 14rem);
  height: min(16vw, 8rem);
  transform: translate(-50%, -50%);
  pointer-events: none;
  overflow: visible;
  animation: ${splashBurst} ${BOTTLE_SPLASH_MS}ms ease-out forwards;

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`

const SplashRipple = styled.span`
  position: absolute;
  left: 50%;
  top: 58%;
  width: ${({ $large }) => ($large ? "95%" : "70%")};
  aspect-ratio: 2.2 / 1;
  border: ${({ $large }) => ($large ? "3px" : "2.5px")} solid
    rgba(230, 248, 255, ${({ $large }) => ($large ? 0.55 : 0.95)});
  border-radius: 50%;
  box-shadow:
    0 0 18px rgba(190, 230, 255, 0.65),
    inset 0 0 12px rgba(255, 255, 255, 0.35);
  animation: ${splashRipple} ${BOTTLE_SPLASH_MS}ms ease-out forwards;
  animation-delay: ${({ $delay }) => `${$delay || 0}ms`};
`

const SPLASH_DROP_OFFSETS = [
  { dx: "-28px", dy: "-42px" },
  { dx: "24px", dy: "-46px" },
  { dx: "-42px", dy: "-14px" },
  { dx: "40px", dy: "-12px" },
  { dx: "0px", dy: "-54px" },
  { dx: "-16px", dy: "-30px" },
  { dx: "18px", dy: "-28px" },
]

const SplashDrop = styled.span`
  position: absolute;
  left: 50%;
  top: 52%;
  width: 14px;
  height: 20px;
  border-radius: 50% 50% 45% 45%;
  background: radial-gradient(circle at 35% 30%, #ffffff 0%, #b7e6f8 50%, #4a9fc4 100%);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.7);
  --dx: ${({ $n }) => SPLASH_DROP_OFFSETS[$n]?.dx || "0px"};
  --dy: ${({ $n }) => SPLASH_DROP_OFFSETS[$n]?.dy || "-36px"};
  animation: ${splashDrop} ${BOTTLE_SPLASH_MS}ms ease-out forwards;
  animation-delay: ${({ $n }) => `${($n || 0) * 30}ms`};
`

const SplashFoam = styled.span`
  position: absolute;
  left: 50%;
  top: 55%;
  width: 78%;
  height: 42%;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(180, 225, 245, 0.55) 42%,
    rgba(120, 190, 220, 0) 72%
  );
  filter: blur(1px);
  animation: ${splashFoam} ${BOTTLE_SPLASH_MS}ms ease-out forwards;
`
