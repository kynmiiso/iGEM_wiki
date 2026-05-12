import React from "react"
import { Link } from "gatsby"
import styled from "styled-components"

const TEMPLATE_IMG_SRC = "/images/home-scroll-prototype.png"

/**
 * Full-page layout template: one static image (the PETABITE poster) as the site chrome.
 * No scroll-driven animation — use the browser’s normal scroll over the full art height.
 */
export function HomeScrollPrototype() {
  return (
    <>
      <DevBar>
        <Link to="/">Back to home</Link>
        <span>Layout template (static image — not final wiki)</span>
      </DevBar>
      <TemplateBleed aria-label="PETABITE layout template">
        <TemplateImage
          src={TEMPLATE_IMG_SRC}
          alt="PETABITE home page layout template: city to sewer vertical illustration"
          decoding="async"
          loading="eager"
          draggable={false}
        />
      </TemplateBleed>
    </>
  )
}

export default HomeScrollPrototype

const DevBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  max-width: 72rem;
  margin: 0 auto var(--space-sm);
  padding: 0 var(--space-md);
  font-size: 0.8rem;
  color: var(--color-muted);

  a {
    color: var(--color-accent);
  }

  span {
    opacity: 0.9;
  }
`

/** Break out of narrow main column so the template can use full content width. */
const TemplateBleed = styled.div`
  width: 100vw;
  max-width: 100%;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  background: var(--color-bg);
`

const TemplateImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  vertical-align: top;
  user-select: none;
`
