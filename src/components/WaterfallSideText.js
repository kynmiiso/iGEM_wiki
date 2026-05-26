import React from "react"
import styled from "styled-components"
import { ExplainTerm } from "./ExplainTermPopover.js"

/** Horizontal offset from the left edge of the mockup composition (%). */
export const WATERFALL_TEXT_LEFT_PCT = 2

/** Vertical offset from the top of the mockup composition (%). */
export const WATERFALL_TEXT_TOP_PCT = 58

/** Width as % of mockup composition (scales with the artwork, no rem cap). */
export const WATERFALL_TEXT_WIDTH_PCT = 28

/** Screen-reader label for the labore popover (visual copy is in the PNG). */
const LABORE_EXPLANATION = "Explanation for labore."

/**
 * Waterfall-band copy on the home scroll mockup (left / brown side).
 * Positioning is percentage-based so it tracks the full-bleed art on resize.
 */
export function WaterfallSideText() {
  return (
    <TextMount>
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
  padding-right: 1.5%;
  padding-left: max(env(safe-area-inset-left, 0px), 1.5%);
  box-sizing: border-box;
  pointer-events: auto;
  z-index: 1;
  overflow: visible;
`

const Heading = styled.h2`
  margin: 0 0 0.65em;
  color: #fff;
  font-family: var(--font-body);
  font-size: clamp(0.85rem, 3.8vw, 1.35rem);
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.15;
  text-transform: uppercase;
`

const Body = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  font-family: var(--font-body);
  font-size: clamp(0.7rem, 1.9vw, 1.05rem);
  font-weight: 400;
  line-height: 1.45;
  overflow-wrap: break-word;
  overflow: visible;
`
