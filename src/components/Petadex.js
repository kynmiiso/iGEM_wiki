import React, { useState } from "react"
import styled from "styled-components"
import { withPrefix } from "gatsby"

const ENTRIES = [
  {
    id: "001",
    name: "Petase 1",
    properties: ["Antibacterial"],
    image: withPrefix("/images/petase-1.png"),
  },
  {
    id: "002",
    name: "Petase 2",
    properties: ["Decomposes H₂O"],
    image: withPrefix("/images/petase-2.png"),
  },
  {
    id: "003",
    name: "Petase 3",
    properties: ["Digestive enzyme"],
    image: withPrefix("/images/petase-3.png"),
  },
]

const Body = styled.div`
  display: flex;
  gap: 36px;
  align-items: stretch;
`

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  background: #cc0000;
  border-radius: 24px;
  padding: 32px;
  gap: 24px;
  width: 720px;
  margin: 64px auto;
`

const Window = styled.div`
  background: #111;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 320px;
  min-height: 360px;
`

const EnzymeImage = styled.img`
  width: 280px;
  height: 280px;
  object-fit: contain;
  display: block;
`

const Info = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-width: 0;
`

const Id = styled.span`
  font-family: monospace;
  font-size: 1.4rem;
  color: #999;
  letter-spacing: 4px;
`

const Name = styled.h3`
  margin: 0;
  font-size: 2.2rem;
  font-weight: 700;
  color: #111;
`

const PropList = styled.ul`
  margin: 0;
  padding: 0 0 0 32px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const Prop = styled.li`
  font-size: 1.6rem;
  color: #444;
`

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Btn = styled.button`
  background: #880000;
  border: none;
  border-radius: 12px;
  color: #ffcccc;
  font-family: monospace;
  font-weight: 700;
  font-size: 1.6rem;
  padding: 12px 28px;
  cursor: pointer;
  transition: transform 0.1s;
  &:active { transform: translateY(4px);}
  &:hover { background: #aa0000; }
  &:disabled { opacity: 0.35; cursor: default; }
`

const Counter = styled.span`
  font-family: monospace;
  font-size: 1.5rem;
  color: #ffcccc;
`

const Petadex = ({ entries = ENTRIES }) => {
  const [idx, setIdx] = useState(0)
  const entry = entries[idx]

  return (
    <Shell>
      <Body>
        <Window>
          <EnzymeImage
            key={entry.id}
            src={entry.image}
            alt={entry.name}
          />
        </Window>

        <Info>
          <Id>No.{entry.id}</Id>
          <Name>{entry.name}</Name>
          <PropList>
            {entry.properties.map((p, i) => <Prop key={i}>{p}</Prop>)}
          </PropList>
        </Info>
      </Body>

      <Controls>
        <Btn onClick={() => setIdx(i => i - 1)} disabled={idx === 0}>◀ PREV</Btn>
        <Counter>{idx + 1} / {entries.length}</Counter>
        <Btn onClick={() => setIdx(i => i + 1)} disabled={idx === entries.length - 1}>NEXT ▶</Btn>
      </Controls>
    </Shell>
  )
}

export default Petadex