import React, { useEffect, useRef, useState } from "react"
import styled, { keyframes, css } from "styled-components"

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

const STEP_DURATION_MS = 1100

export const PetAssayAnimation = () => {
  const [step, setStep] = useState(0)
  const [cycle, setCycle] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setStep((s) => {
        const next = (s + 1) % STEPS.length
        if (next === 0) setCycle((c) => c + 1)
        return next
      })
    }, STEP_DURATION_MS)
    return () => clearInterval(timerRef.current)
  }, [])

  const current = STEPS[step].key

  return (
    <Wrap>
      <Stage role="img" aria-label={STEPS[step].label}>
        <Scene>
          <PetFilm $eaten={current === "digest"} />

          <Track>
            <BoundComplex key={cycle} $phase={current}>
              <Ta2Anchor />
              <Bind />
              <CellBody $tag="bound" />
            </BoundComplex>

            <StrayCell $visible={current === "bind"} />

            <PetaseIcon $active={current === "digest"} />
          </Track>
        </Scene>
      </Stage>

      <CaptionRow>
        <StepLabel>{STEPS[step].label}</StepLabel>
        <StepCaption>{STEPS[step].caption}</StepCaption>
      </CaptionRow>
    </Wrap>
  )
}

export default PetAssayAnimation

const bob = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
`
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
  height: 260px;
  overflow: hidden;
`

const Scene = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
`

const Track = styled.div`
  position: relative;
  width: 230px;
  height: 190px;
`

const PetFilm = styled.div`
  width: 46px;
  height: 190px;
  flex: none;
  background: #e8c9c9;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  transition: clip-path 0.4s ease-in-out;
  ${({ $eaten }) =>
    $eaten &&
    css`
      animation: ${nibble} 0.4s ease-in-out forwards;
    `}

  &::after {
    content: "PET";
    position: absolute;
    left: 23px;
    top: 50%;
    transform: translate(-50%, -50%) rotate(-90deg);
    font-size: 0.95rem;
    letter-spacing: 0.04em;
    color: var(--color-muted);
    white-space: nowrap;
  }
`

const Ta2Anchor = styled.div`
  width: 34px;
  height: 28px;
  background: #7b2fd6;
  border-radius: 0 14px 14px 0;
  flex: none;
`

const CellBody = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f5e6ac;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: var(--color-text);

  &::after {
    content: "cell";
  }
`

const Bind = styled.div`
  width: 16px;
  height: 2px;
  background: var(--color-border);
  flex: none;
`

const BoundComplex = styled.div`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  transition: transform 0.5s ease-in-out 0.4s;

  ${({ $phase }) =>
    $phase === "digest" &&
    css`
      transform: translateY(-50%) translate(110px, -16px);
    `}
`

const StrayCell = styled(CellBody)`
  position: absolute;
  left: 130px;
  top: 8px;
  width: 42px;
  height: 42px;
  opacity: ${({ $visible }) => ($visible ? 0.85 : 0)};
  transition: opacity 0.25s ease;
`

const PetaseIcon = styled.div`
  position: absolute;
  left: 150px;
  top: 4px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #d5e8cc;
  border: 1px solid var(--color-border);
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transition: opacity 0.2s ease;
  animation: ${({ $active }) => ($active ? css`${bob} 0.5s ease-in-out infinite` : "none")};

  &::after {
    content: "PETase";
    position: absolute;
    top: -24px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.85rem;
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
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
`

const StepCaption = styled.p`
  color: var(--color-muted);
  font-size: 1rem;
`