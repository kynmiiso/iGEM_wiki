import React, { useEffect, useRef, useState } from "react"
import styled, { keyframes, css } from "styled-components"

/**
 * PetAssayAnimation
 * -------------------------------------------------------------
 * Animates the "Surface Collection" assay, cycling automatically
 * (no buttons — it's time-based, ~3.2s per step, looping):
 *   1. TA2 (anchor peptide) is displayed on PET film and binds cells.
 *   2. A wash step removes cells that never bound.
 *   3. PETase eats a bite out of the PET film, releasing the TA2
 *      anchor still attached to its cell. Collect freed cells.
 *
 * Drop this file next to InteractiveGizmo.js (e.g.
 * src/interactive/PetAssayAnimation.js), then register it in
 * mdxComponents.js:
 *
 *   import { PetAssayAnimation } from "./interactive/PetAssayAnimation.js"
 *   export const mdxComponents = { ..., PetAssayAnimation }
 *
 * and drop <PetAssayAnimation /> into the Experimental Overview MDX.
 */

const STEPS = [
  {
    key: "bind",
    label: "TA2 binds PET film",
    caption:
      "TA2 displayed on the cell surface binds directly to the PET film.",
  },
  {
    key: "wash",
    label: "Wash removes unbound cells",
    caption:
      "A wash step clears away cells that never attached, leaving only PET-bound cells.",
  },
  {
    key: "digest",
    label: "PETase eats PET and releases TA2",
    caption:
      "PETase eats PET and releases TA2, thereby releasing the cell. Collect freed cells.",
  },
]

const STEP_DURATION_MS = 3200

export const PetAssayAnimation = () => {
  const [step, setStep] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length)
    }, STEP_DURATION_MS)
    return () => clearInterval(timerRef.current)
  }, [])

  const current = STEPS[step].key

  return (
    <Wrap>
      <Stage role="img" aria-label={STEPS[step].label}>
        <PetFilm $eaten={current === "digest"} />

        {/* Bound cell + TA2, sits at the film surface for the first two steps */}
        <BoundComplex $phase={current}>
          <Ta2Anchor $cleaved={current === "digest"} />
          <CellBody $tag="bound" />
        </BoundComplex>

        {/* An unbound cell that only exists during the bind/wash steps */}
        <StrayCell $visible={current === "bind"} />

        {/* PETase enzyme, appears to do its work during the digest step */}
        <PetaseIcon $active={current === "digest"} />

        {/* Freed complex drifting away from the film once released */}
        <FreedComplex $phase={current}>
          <Ta2AnchorSmall />
          <CellBody $tag="freed" />
        </FreedComplex>
      </Stage>

      <CaptionRow>
        <StepLabel>{STEPS[step].label}</StepLabel>
        <StepCaption>{STEPS[step].caption}</StepCaption>
      </CaptionRow>
    </Wrap>
  )
}

export default PetAssayAnimation

/* ---------------------------------- styling ---------------------------------- */

const drift = keyframes`
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(120px, -14px) scale(0.94); opacity: 1; }
`

const bob = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
`

/* Bites a single triangular notch out of the right edge of the film,
   rather than shearing off a whole chunk. */
const nibble = keyframes`
  0%   { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
  100% { clip-path: polygon(0% 0%, 100% 0%, 100% 40%, 55% 50%, 100% 60%, 100% 100%, 0% 100%); }
`

const Wrap = styled.div`
  max-width: 54rem;
  margin: var(--space-lg) 0;
  padding: var(--space-md) var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.24);
`

const Stage = styled.div`
  position: relative;
  height: 220px;
  overflow: hidden;
`

const PetFilm = styled.div`
  position: absolute;
  left: 8%;
  top: 14px;
  width: 34px;
  height: 190px;
  background: #e8c9c9;
  border: 1px solid var(--color-border);
  border-radius: 3px;
  transition: clip-path 1.1s ease-in-out;
  ${({ $eaten }) =>
    $eaten &&
    css`
      animation: ${nibble} 1.1s ease-in-out forwards;
    `}

  &::after {
    content: "PET";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(-90deg);
    font-size: 0.7rem;
    letter-spacing: 0.04em;
    color: var(--color-muted);
    white-space: nowrap;
  }
`

const Ta2Base = styled.div`
  width: 26px;
  height: 22px;
  background: #7b2fd6;
  border-radius: 0 11px 11px 0;
`

const Ta2Anchor = styled(Ta2Base)`
  transition: opacity 0.5s ease, transform 0.5s ease;
  ${({ $cleaved }) =>
    $cleaved &&
    css`
      opacity: 0;
      transform: translateX(-8px) scale(0.7);
    `}
`

const Ta2AnchorSmall = styled(Ta2Base)`
  width: 18px;
  height: 15px;
  flex: none;
`

const CellBody = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #f5e6ac;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.62rem;
  color: var(--color-text);

  &::after {
    content: "cell";
  }
`

const BoundComplex = styled.div`
  position: absolute;
  left: calc(8% + 34px);
  top: 96px;
  display: flex;
  align-items: center;
  transition: opacity 0.6s ease, transform 0.6s ease;

  ${({ $phase }) =>
    $phase === "digest" &&
    css`
      opacity: 0;
      transform: translateX(-10px);
    `}
`

const FreedComplex = styled.div`
  position: absolute;
  left: calc(8% + 34px);
  top: 96px;
  display: flex;
  align-items: center;
  opacity: 0;
  pointer-events: none;

  ${({ $phase }) =>
    $phase === "digest" &&
    css`
      opacity: 1;
      animation: ${drift} 1.6s ease-in-out forwards;
    `}
`

const StrayCell = styled(CellBody)`
  position: absolute;
  left: 62%;
  top: 40px;
  width: 30px;
  height: 30px;
  opacity: ${({ $visible }) => ($visible ? 0.85 : 0)};
  transition: opacity 0.5s ease;
`

const PetaseIcon = styled.div`
  position: absolute;
  left: calc(8% + 34px + 60px);
  top: 46px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #d5e8cc;
  border: 1px solid var(--color-border);
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transition: opacity 0.4s ease;
  animation: ${({ $active }) => ($active ? css`${bob} 0.9s ease-in-out infinite` : "none")};

  &::after {
    content: "PETase";
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.62rem;
    color: var(--color-muted);
    white-space: nowrap;
  }
`

const CaptionRow = styled.div`
  margin-top: var(--space-sm);
`

const StepLabel = styled.p`
  color: var(--color-text) !important;
  font-weight: 700;
  margin-bottom: 0.25rem;
`

const StepCaption = styled.p`
  color: var(--color-muted);
  font-size: 0.9rem;
`