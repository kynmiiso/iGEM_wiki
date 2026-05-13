import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Link, withPrefix } from "gatsby"
import styled, { keyframes } from "styled-components"

/**
 * Mockups live under /static/wiki-mockup/ so the browser loads predictable URLs
 * (avoids webpack + long filenames with spaces, and respects pathPrefix via withPrefix).
 */
const ASSETS = {
  back: withPrefix("/wiki-mockup/wiki-front-back.jpg"),
  front: withPrefix("/wiki-mockup/wiki-front-front.png"),
  nav33: withPrefix("/wiki-mockup/wiki-front-nav3.png"),
  logo: withPrefix("/wiki-mockup/wiki-front-logo.png"),
  bottle: withPrefix("/wiki-mockup/wiki-front-bottle.png"),
  water: withPrefix("/wiki-mockup/wiki-front-water.png"),
}

/** Overlays above the in-flow back plate (water on top). */
const Z = {
  front: 1,
  logo: 2,
  bottle: 3,
  water: 4,
}

/**
 * Full-page wiki front compositing: layered mockup PNGs plus a gentle idle float on the logo.
 *
 * Nav3 uses scroll-driven `position: fixed` while the mockup is on-screen.
 */
export function HomeScrollPrototype() {
  const stackRef = useRef(null)
  const skipRef = useRef(null)
  const [navPinned, setNavPinned] = useState(false)
  const [navTopPx, setNavTopPx] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return
    window.scrollTo(0, 0)
  }, [])

  useLayoutEffect(() => {
    const tick = () => {
      const stack = stackRef.current
      if (!stack) return
      const rect = stack.getBoundingClientRect()
      const skip = skipRef.current
      const skipBottom = skip ? skip.getBoundingClientRect().bottom : 0
      const pin = rect.top < 0 && rect.bottom > 0
      setNavPinned(pin)
      setNavTopPx(pin ? Math.max(0, skipBottom) : 0)
    }

    tick()
    window.addEventListener("scroll", tick, { passive: true })
    window.addEventListener("resize", tick, { passive: true })
    return () => {
      window.removeEventListener("scroll", tick)
      window.removeEventListener("resize", tick)
    }
  }, [])

  return (
    <WikiFrontRoot>
      <SkipBar ref={skipRef}>
        <Link to="/">Back to wiki home</Link>
      </SkipBar>

      <ScrollStack ref={stackRef}>
        <CompositionRoot>
          <FlowSizer>
            <RailImg src={ASSETS.back} alt="Wiki front — background scenery" />
          </FlowSizer>
          <OverlayStack aria-hidden>
            <OverlaySlice $z={Z.front}>
              <RailImg src={ASSETS.front} alt="" />
            </OverlaySlice>
            <OverlaySlice $z={Z.logo}>
              <LogoFloatWrap>
                <RailImg src={ASSETS.logo} alt="PETABITE" />
              </LogoFloatWrap>
            </OverlaySlice>
            <OverlaySlice $z={Z.bottle}>
              <RailImg src={ASSETS.bottle} alt="" />
            </OverlaySlice>
            <OverlaySlice $z={Z.water}>
              <RailImg src={ASSETS.water} alt="" />
            </OverlaySlice>
          </OverlayStack>
        </CompositionRoot>

        <Nav33Mount $pinned={navPinned} $topPx={navTopPx}>
          <Nav33Img src={ASSETS.nav33} alt="" />
        </Nav33Mount>
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

const SkipBar = styled.div`
  position: relative;
  z-index: 120;
  padding: var(--space-sm) var(--space-md);
  font-size: 0.8rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);

  a {
    color: var(--color-accent);
  }
`

const ScrollStack = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
`

/** Absolute over bleed at rest; `fixed` while scrolling through mockup (`$topPx` clears skip link). */
const Nav33Mount = styled.div`
  position: ${({ $pinned }) => ($pinned ? "fixed" : "absolute")};
  top: ${({ $pinned, $topPx }) => ($pinned ? `${$topPx}px` : "0")};
  left: 0;
  right: 0;
  z-index: 100;
  pointer-events: none;
  border-bottom: 1px solid rgba(34, 34, 34, 0.22);
`

const Nav33Img = styled.img`
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  user-select: none;
`

const CompositionRoot = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
`

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

const OverlaySlice = styled.div`
  position: absolute;
  inset: 0;
  z-index: ${({ $z }) => $z};
  display: flex;
  align-items: flex-start;
  justify-content: center;
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

const LogoFloatWrap = styled.div`
  width: 100%;
  animation: ${logoIdleFloat} 4.2s ease-in-out infinite;

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
