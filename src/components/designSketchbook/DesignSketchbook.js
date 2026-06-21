import React, { useEffect, useRef, useState } from "react"
import styled from "styled-components"
import {
  DESIGN_SKETCHBOOK_PAGES,
  PAGE_FLIP_ATTRIBUTION,
} from "../../data/designSketchbookPages.js"

import "page-flip/src/Style/stPageFlip.css"

const FLIP_SETTINGS = {
  width: 520,
  height: 680,
  size: "stretch",
  minWidth: 320,
  maxWidth: 900,
  minHeight: 440,
  maxHeight: 900,
  showCover: true,
  drawShadow: true,
  flippingTime: 700,
  usePortrait: true,
  mobileScrollSupport: true,
  autoSize: true,
}

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function SketchPageContent({ page }) {
  return (
    <SketchPageInner $variant={page.variant}>
      {page.variant === "cover" && <SketchCoverMark aria-hidden>✎</SketchCoverMark>}
      <SketchTitle>{page.title}</SketchTitle>
      {page.subtitle && <SketchSubtitle>{page.subtitle}</SketchSubtitle>}
      {page.body && <SketchBody>{page.body}</SketchBody>}
      {page.variant === "spread" && <SketchPlaceholder aria-hidden />}
    </SketchPageInner>
  )
}

export function DesignSketchbook() {
  const bookHostRef = useRef(null)
  const pageFlipRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageCount, setPageCount] = useState(DESIGN_SKETCHBOOK_PAGES.length)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(prefersReducedMotion())
  }, [])

  useEffect(() => {
    if (reducedMotion || typeof window === "undefined") return undefined

    let cancelled = false
    let flipInstance = null

    const init = async () => {
      const host = bookHostRef.current
      if (!host) return

      const pages = host.querySelectorAll("[data-sketch-page]")
      if (!pages.length) return

      try {
        const { PageFlip } = await import("page-flip")
        if (cancelled) return

        flipInstance = new PageFlip(host, FLIP_SETTINGS)
        pageFlipRef.current = flipInstance

        flipInstance.on("flip", (e) => {
          setPageIndex(typeof e.data === "number" ? e.data : flipInstance.getCurrentPageIndex())
        })

        flipInstance.loadFromHTML(pages)
        setPageCount(flipInstance.getPageCount())
        setPageIndex(flipInstance.getCurrentPageIndex())
        setReady(true)
      } catch {
        setReady(false)
      }
    }

    const timer = window.setTimeout(init, 50)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      if (pageFlipRef.current) {
        pageFlipRef.current.destroy()
        pageFlipRef.current = null
      }
      setReady(false)
    }
  }, [reducedMotion])

  const goPrev = () => {
    pageFlipRef.current?.flipPrev("bottom")
  }

  const goNext = () => {
    pageFlipRef.current?.flipNext("bottom")
  }

  if (reducedMotion) {
    return (
      <SketchbookRoot>
        <ReducedMotionList aria-label="Design sketchbook pages">
          {DESIGN_SKETCHBOOK_PAGES.map((page) => (
            <ReducedMotionPage key={page.id} $variant={page.variant}>
              <SketchPageContent page={page} />
            </ReducedMotionPage>
          ))}
        </ReducedMotionList>
        <AttributionFooter />
      </SketchbookRoot>
    )
  }

  return (
    <SketchbookRoot>
      <BookStage aria-label="Design team sketchbook — drag corners or use controls to flip pages">
        <BookHost ref={bookHostRef} className="stf__parent">
          {DESIGN_SKETCHBOOK_PAGES.map((page) => (
            <SketchPage
              key={page.id}
              data-sketch-page
              data-density={page.density}
              className="design-sketchbook-page"
            >
              <SketchPageContent page={page} />
            </SketchPage>
          ))}
        </BookHost>
      </BookStage>

      <Controls>
        <ControlButton type="button" onClick={goPrev} disabled={!ready || pageIndex <= 0}>
          Previous
        </ControlButton>
        <PageIndicator aria-live="polite">
          {ready ? `Page ${pageIndex + 1} of ${pageCount}` : "Loading sketchbook…"}
        </PageIndicator>
        <ControlButton
          type="button"
          onClick={goNext}
          disabled={!ready || pageIndex >= pageCount - 1}
        >
          Next
        </ControlButton>
      </Controls>

      <Hint>Drag a page corner or click the edges to flip. Keyboard users can use Previous / Next.</Hint>

      <AttributionFooter />
    </SketchbookRoot>
  )
}

function AttributionFooter() {
  const { name, author, url, license, npmPackage } = PAGE_FLIP_ATTRIBUTION
  return (
    <Attribution>
      Page-turn effect by{" "}
      <a href={url} target="_blank" rel="noopener noreferrer">
        {name}
      </a>{" "}
      ({license}) — {author}, via{" "}
      <a
        href="https://www.npmjs.com/package/page-flip"
        target="_blank"
        rel="noopener noreferrer"
      >
        {npmPackage}
      </a>
      .
    </Attribution>
  )
}

export default DesignSketchbook

const SketchbookRoot = styled.div`
  width: 100%;
  max-width: 72rem;
  margin: var(--space-lg) 0;
`

const BookStage = styled.div`
  width: 100%;
  min-height: 28rem;
`

const BookHost = styled.div`
  width: 100%;
  margin: 0 auto;
`

const SketchPage = styled.div`
  background: #f5f0e6;
  border: 1px solid rgba(34, 34, 34, 0.12);
  box-sizing: border-box;
  overflow: hidden;
`

const SketchPageInner = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: ${({ $variant }) =>
    $variant === "cover" || $variant === "back" ? "center" : "flex-start"};
  align-items: ${({ $variant }) =>
    $variant === "cover" || $variant === "back" ? "center" : "flex-start"};
  text-align: ${({ $variant }) =>
    $variant === "cover" || $variant === "back" ? "center" : "left"};
  height: 100%;
  min-height: 100%;
  padding: clamp(1.25rem, 4vw, 2rem);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.35), transparent 55%),
    #f5f0e6;
`

const SketchCoverMark = styled.span`
  font-size: 2.5rem;
  line-height: 1;
  margin-bottom: var(--space-sm);
  opacity: 0.45;
`

const SketchTitle = styled.h3`
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 400;
  color: var(--color-text);
  margin: 0 0 var(--space-sm);
  line-height: 1.2;
`

const SketchSubtitle = styled.p`
  font-family: var(--font-body);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin: 0 0 var(--space-md);
`

const SketchBody = styled.p`
  font-family: var(--font-body);
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--color-muted);
  margin: 0;
  max-width: 26rem;
`

const SketchPlaceholder = styled.div`
  margin-top: var(--space-md);
  width: 100%;
  max-width: 20rem;
  height: 7rem;
  border: 1.5px dashed rgba(34, 34, 34, 0.2);
  border-radius: 4px;
  background: repeating-linear-gradient(
    -45deg,
    rgba(200, 240, 80, 0.08),
    rgba(200, 240, 80, 0.08) 6px,
    transparent 6px,
    transparent 12px
  );
`

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  margin-top: var(--space-md);
  flex-wrap: wrap;
`

const ControlButton = styled.button`
  appearance: none;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.45rem 1rem;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: var(--color-accent);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
`

const PageIndicator = styled.p`
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0;
  min-width: 8rem;
  text-align: center;
`

const Hint = styled.p`
  font-size: 0.75rem;
  color: var(--color-muted);
  text-align: center;
  margin: var(--space-sm) 0 0;
`

const Attribution = styled.p`
  font-size: 0.7rem;
  color: var(--color-muted);
  text-align: center;
  margin: var(--space-md) 0 0;
  line-height: 1.5;

  a {
    color: var(--color-text);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`

const ReducedMotionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`

const ReducedMotionPage = styled.div`
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
  min-height: 10rem;
`
