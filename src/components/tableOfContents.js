import React, { useEffect, useState } from "react"
import styled from "styled-components"

const Nav = styled.nav`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  overscroll-behavior: contain;
`

const Item = styled.button`
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1.5;
  padding: 2px;
  border-left: 3px solid ${p => p.$active ? "var(--color-accent)" : "var(--color-border)"};
  color: ${p => p.$active ? "var(--color-accent)" : "var(--color-muted)"};
  padding-left: ${p => p.$level === "H3" ? "16px" : "8px"};
  font-weight: ${p => p.$active ? 600 : 400};
  transition: color 0.15s, border-color 0.15s;
  &:hover { color: var(--color-accent) !important; border-left-color: var(--color-accent) !important; }
`

const TableOfContents = () => {
  const [headings, setHeadings] = useState([])
  const [active, setActive] = useState("")

  useEffect(() => {
    const scan = () => {
      const root = document.getElementById("page-content") || document.body
      const els = Array.from(root.querySelectorAll("h2, h3"))
      els.forEach((el, i) => { if (!el.id) el.id = `heading-${i}` })
      setHeadings(els.map(el => ({ id: el.id, text: el.textContent, level: el.tagName })))
    }
    // small delay so WikiLayout has finished rendering
    const t = setTimeout(scan, 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const root = document.getElementById("page-content") || document.body
    const observedHeadings = Array.from(root.querySelectorAll("h2, h3"))
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: "0px 0px -60% 0px" }
    )
    observedHeadings.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <Nav>
      {headings.map(h => (
        <Item
          key={h.id}
          $level={h.level}
          $active={active === h.id}
          onClick={() => document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" })}
        >
          {h.text}
        </Item>
      ))}
    </Nav>
  )
}

export default TableOfContents
