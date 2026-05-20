import React from "react"
import { Link } from "gatsby"
import styled from "styled-components"

/**
 * Sticky-column scroll prototype on the home page (desktop).
 * Layered wiki front mockup (no motion yet): /home-scroll-prototype/
 */
export function HomeStickyPrototype() {
  return (
    <MotionLab aria-labelledby="sticky-prototype-heading">
      <MotionLabHeader>
        <MotionLabBadge>Prototype</MotionLabBadge>
        <h2 id="sticky-prototype-heading">Motion lab (internal)</h2>
        <p>
          Sticky section preview below. Layered wiki front mockup (static compositing) on{" "}
          <Link to="/home-scroll-prototype/">/home-scroll-prototype/</Link>.
        </p>
      </MotionLabHeader>

      <DemoBlock>
        <DemoTitle>Sticky section</DemoTitle>
        <p className="demo-desc">Left panel sticks while the right column scrolls (desktop only).</p>
        <StickyDemo>
          <StickySide>
            <StickyCard>
              <strong>Sticky panel</strong>
              <p>Stays pinned while you scroll the numbered blocks on the right.</p>
            </StickyCard>
          </StickySide>
          <StickyScroll>
            {Array.from({ length: 8 }, (_, i) => (
              <StickyStep key={i}>
                <span>Step {i + 1}</span>
                <p>
                  Dummy copy to add scroll length. Lorem placeholder for prototyping vertical rhythm
                  without real wiki text.
                </p>
              </StickyStep>
            ))}
          </StickyScroll>
        </StickyDemo>
      </DemoBlock>
    </MotionLab>
  )
}

export default HomeStickyPrototype

const MotionLab = styled.section`
  margin: var(--space-xl) 0;
  padding: var(--space-lg);
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  background: color-mix(in srgb, var(--color-text) 3%, transparent);
`

const MotionLabHeader = styled.div`
  margin-bottom: var(--space-lg);

  h2 {
    font-size: clamp(1.25rem, 2.5vw, 1.75rem);
    margin: var(--space-sm) 0 var(--space-sm);
  }

  p {
    color: var(--color-muted);
    font-size: 0.9rem;
    max-width: 40rem;
    line-height: 1.6;
  }

  a {
    color: var(--color-accent);
  }
`

const MotionLabBadge = styled.span`
  display: inline-block;
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-accent);
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
`

const DemoBlock = styled.div`
  padding-top: 0;
  margin-top: 0;

  .demo-desc {
    color: var(--color-muted);
    font-size: 0.875rem;
    margin-bottom: var(--space-md);
    max-width: 42rem;
  }
`

const DemoTitle = styled.h3`
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: var(--space-xs);
`

const StickyDemo = styled.div`
  display: grid;
  grid-template-columns: minmax(11rem, 14rem) 1fr;
  gap: var(--space-lg);
  align-items: start;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

const StickySide = styled.div`
  @media (min-width: 721px) {
    position: sticky;
    top: var(--space-lg);
  }
`

const StickyCard = styled.div`
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: var(--space-md);
  background: var(--color-bg);

  strong {
    font-family: var(--font-display);
    font-weight: 400;
    display: block;
    margin-bottom: var(--space-sm);
  }

  p {
    font-size: 0.85rem;
    color: var(--color-muted);
    line-height: 1.55;
  }
`

const StickyScroll = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  min-height: 70vh;
`

const StickyStep = styled.div`
  border-left: 3px solid var(--color-accent);
  padding: var(--space-sm) var(--space-md);
  background: color-mix(in srgb, var(--color-accent) 6%, transparent);

  span {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-text);
  }

  p {
    margin-top: var(--space-xs);
    font-size: 0.875rem;
    color: var(--color-muted);
    line-height: 1.55;
  }
`
