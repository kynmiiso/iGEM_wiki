import React, { useEffect, useRef, useState, useCallback } from "react"
import styled from "styled-components"
import { withPrefix } from "gatsby"

const BOTTLE_IMG = withPrefix("/wiki-mockup/wiki-front-bottle.png")

const IMG = {
  battle:            withPrefix("/images/petadex-battle-button-bg.png"),
}


const Wrapper = styled.div`
  position: relative;
  width: 100%;
`

const BattleBtn = styled.button`
  position: absolute;
  z-index: 101;
  background-image: url(${IMG.battle});
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-color: transparent;
  border: none;
  width: 180px;
  height: 58px;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${p => p.$visible ? 1 : 0};
  pointer-events: ${p => p.$visible ? "auto" : "none"};
  &:active { transform: translateY(3px); }
  &:hover { filter: brightness(1.1); }
`

const BattleText = styled.span`
  font-family: monospace;
  font-size: 1.3rem;
  font-weight: 700;
  color: #000;
  letter-spacing: 3px;
  pointer-events: none;
`

const BottleImg = styled.img`
  position: fixed;
  width: 1000px;
  pointer-events: none;
  transition: opacity 0.2s;
  opacity: ${p => p.$visible ? 1 : 0};
  z-index: 100;
  transform-origin: center center;
`

const PetadexBottlePath = ({ petadexRef, onBattle, children }) => {
  const wrapperRef  = useRef(null)
  const measureRef  = useRef(null)
  const rafRef      = useRef(null)

  const [pathD,         setPathD]         = useState("")
  const [pathLen,       setPathLen]       = useState(0)
  const [filled,        setFilled]        = useState(0)
  const [viewBox,       setViewBox]       = useState("0 0 1000 1000")
  const [bottlePos,     setBottlePos]     = useState({ x: -999, y: -999, angle: 0 })
  const [bottleVisible, setBottleVisible] = useState(false)
  const [btnPos,        setBtnPos]        = useState({ x: 0, y: 0 })
  const [btnVisible,    setBtnVisible]    = useState(false)
  const [cornerLen,     setCornerLen]     = useState(0)

  const compute = useCallback(() => {
    const wrapper = wrapperRef.current
    const petadex = petadexRef?.current
    if (!wrapper || !petadex) return false

    const shell = petadex.firstElementChild || petadex
    const wRect = wrapper.getBoundingClientRect()
    const pRect = shell.getBoundingClientRect()
    if (pRect.height === 0) return false

    const W = wrapper.offsetWidth
    const H = wrapper.offsetHeight
    setViewBox(`0 0 ${W} ${H}`)

    const lx = cx => cx - wRect.left
    const ly = cy => cy - wRect.top

    const pad = 55
    const x1 = 0
    const x2 = lx(pRect.right) + pad
    const y1 = ly(pRect.top)   - pad
    const y2 = ly(pRect.bottom)+ pad

    const d = [
      `M ${x1} ${y1}`,
      `L ${x2} ${y1}`,
      `L ${x2} ${y2}`,
      `L ${x1} ${y2}`,
      `L ${x1} ${H}`,
    ].join(" ")

    setPathD(d)
    setBtnPos({ x: x2 - 290, y: y2 - 260})
    setCornerLen((x2 - x1) + (y2 - y1))
    return true
  }, [petadexRef])

  useEffect(() => {
    let tries = 0
    const tryCompute = () => {
      const ok = compute()
      if (!ok && ++tries < 30) setTimeout(tryCompute, 100)
    }
    tryCompute()
    window.addEventListener("resize", compute)
    return () => window.removeEventListener("resize", compute)
  }, [compute])

  useEffect(() => {
    if (measureRef.current && pathD) {
      setPathLen(measureRef.current.getTotalLength())
    }
  }, [pathD])

  useEffect(() => {
    if (!pathLen) return

    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const wrapper = wrapperRef.current
        const measure = measureRef.current
        const petadex = petadexRef?.current
        if (!wrapper || !measure || !petadex) return

        const shell = petadex.firstElementChild || petadex
        const pRect = shell.getBoundingClientRect()

        const enter = window.innerHeight
        const top   = pRect.top
        const bot   = pRect.bottom
        const total   = enter + pRect.height
        const scrolled = enter - top
        const progress = Math.min(1, Math.max(0, scrolled / total))

        const newFilled = progress * pathLen
        setFilled(newFilled)

        // Get position AND tangent angle at the tip
        const tipLen  = Math.min(newFilled, pathLen - 1)
        const pt      = measure.getPointAtLength(tipLen)
        const ptBehind = measure.getPointAtLength(Math.max(0, tipLen - 4))
        const dx = pt.x - ptBehind.x
        const dy = pt.y - ptBehind.y
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90 // +90 because bottle image is vertical

        const svgEl   = measure.ownerSVGElement
        const svgRect = svgEl.getBoundingClientRect()
        const [,,vW,vH] = svgEl.getAttribute("viewBox").split(" ").map(Number)
        const sx = vW > 0 ? svgRect.width  / vW : 1
        const sy = vH > 0 ? svgRect.height / vH : 1

        setBottlePos({
          x: svgRect.left + pt.x * sx,
          y: svgRect.top  + pt.y * sy,
          angle,
        })

        const inZone = bot > 0 && top < window.innerHeight
        setBottleVisible(inZone && progress > 0.01 && progress < 0.99)
        setBtnVisible(newFilled > cornerLen)
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [pathLen, cornerLen, petadexRef])

  const dashFill = `${filled} ${Math.max(0, pathLen - filled)}`

  return (
    <Wrapper ref={wrapperRef}>
      <svg
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible", zIndex: 10 }}
        viewBox={viewBox}
        preserveAspectRatio="none"
      >
        <path ref={measureRef} d={pathD} fill="none" stroke="none" />
        <path
          d={pathD}
          fill="none"
          stroke="rgba(107, 189, 52, 0.33)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={pathD}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={dashFill}
          strokeDashoffset="0"
        />
      </svg>

      {children}

      <BottleImg
        src={BOTTLE_IMG}
        alt=""
        $visible={bottleVisible}
        style={{
          left: bottlePos.x,
          top: bottlePos.y,
          transform: `translate(-50%, -70%)`,
        }}
      />

      <BattleBtn
        $visible={btnVisible}
        style={{ left: btnPos.x, top: btnPos.y }}
        onClick={onBattle}
      >
        <BattleText>BATTLE</BattleText>
      </BattleBtn>
    </Wrapper>
  )
}

export default PetadexBottlePath