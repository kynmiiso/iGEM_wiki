import React from "react"
import { Link } from "gatsby"
import styled from "styled-components"

export const wikiNav = [
  { to: "/", label: "Home" },
  { label: "Project", children: [
    { to: "/project/description/", label: "Project Description" },
    { to: "/project/applications/", label: "Applications" },
    { to: "/project/contribution/", label: "Contribution" },
    { to: "/project/engineering/", label: "Engineering" },
  ]},
  { label: "Wet Lab", children: [
    { to: "/wet-lab/overview/", label: "Experimental Overview" },
    { to: "/wet-lab/parts/", label: "Parts" },
    { to: "/wet-lab/notebook/", label: "Notebook" },
    { to: "/wet-lab/results/", label: "Results" },
    { to: "/wet-lab/milestones/", label: "Pivotal Changes and Milestones" },
  ]},
  { label: "Dry Lab", children: [
    { to: "/dry-lab/overview/", label: "Overview" },
    { to: "/dry-lab/model/", label: "Generalized Model" },
    { to: "/dry-lab/software/", label: "Software" },
    { to: "/dry-lab/software-specs/", label: "Software Specs" },
  ]},
  { label: "Hardware", children: [
    { to: "/hardware/overview/", label: "Overview" },
    { to: "/hardware/parts/", label: "Parts" },
    { to: "/hardware/notebook/", label: "Notebook" },
    { to: "/hardware/results/", label: "Results" },
  ]},
  { label: "Team", children: [
    { to: "/team/", label: "Meet the Team" },
    { to: "/team/attributions/", label: "Attributions" },
    { to: "/team/collaborations/", label: "Collaborations" },
  ]},
  { label: "Beyond the Bench", children: [
    { to: "/beyond-the-bench/education-toolkit/", label: "Education Toolkit" },
    { to: "/beyond-the-bench/human-practices/", label: "Human Practices" },
    { to: "/beyond-the-bench/entrepreneurship/", label: "Entrepreneurship" },
    { to: "/beyond-the-bench/safety/", label: "Safety" },
  ]},
]

export function WikiTopBar() {
  return (
    <TopBar>
      <NavInner>
        <LogoPlaceholder to="/" aria-label="iGEM Toronto 2026 — Home">
          <LogoBox>LOGO</LogoBox>
        </LogoPlaceholder>
        <Nav aria-label="Wiki sections">
          {wikiNav.slice(1).map(({ label, children }) => (
            <NavItem key={label}>
              <NavParent>{label}</NavParent>
              <Dropdown>
                {children.map(({ to, label: childLabel }) => (
                  <DropdownLink key={to} to={to}>{childLabel}</DropdownLink>
                ))}
              </Dropdown>
            </NavItem>
          ))}
        </Nav>
      </NavInner>
    </TopBar>
  )
}

/** Keep nav above portaled glossary popovers (`ExplainTermPopover` uses 100). */
export const WIKI_TOP_BAR_Z_INDEX = 110

const TopBar = styled.header`
  position: relative;
  z-index: ${WIKI_TOP_BAR_Z_INDEX};
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
`

const NavInner = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0.5rem var(--page-padding);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
`

const LogoPlaceholder = styled(Link)`
  text-decoration: none;
  flex-shrink: 0;
`

const LogoBox = styled.div`
  width: 6.5rem;
  height: 1.75rem;
  border: 1px dashed var(--color-border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  font-size: 0.65rem;
  letter-spacing: 0.08em;
`

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm) var(--space-md);
  font-size: 0.8125rem;
`

const NavItem = styled.div`
  position: relative;

  &:hover > div,
  &:focus-within > div {
    display: flex;
  }

  &:last-child > div {
    left: auto;
    right: 0;
  }
`

const NavParent = styled.span`
  color: var(--color-muted);
  font-size: inherit;
  cursor: default;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &::after {
    content: '▾';
    font-size: 0.7rem;
    transition: transform 0.2s ease;
  }

  ${NavItem}:hover & {
    color: var(--color-text);
    &::after { transform: rotate(180deg); }
  }
`

const Dropdown = styled.div`
  display: none;
  flex-direction: column;
  position: absolute;
  top: 100%;
  left: 0;
  padding-top: 0.5rem;
  background: transparent;
  min-width: 200px;
  z-index: 100;

  &::before {
    content: '';
    position: absolute;
    inset: 0.5rem 0 0;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    z-index: -1;
  }
`

const DropdownLink = styled(Link)`
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  color: var(--color-muted);
  font-size: 0.875rem;
  text-decoration: none;
  white-space: nowrap;
  position: relative;
  z-index: 1;

  &:first-child { margin-top: 0.75rem; }
  &:last-child { margin-bottom: 0.25rem; }

  &:hover {
    color: var(--color-text);
    background: rgba(0,0,0,0.04);
  }
`
