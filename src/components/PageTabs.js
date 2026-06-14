import React, { useState } from "react"
import styled, { css } from "styled-components"

/**
 * In-page tab switcher for MDX wiki pages.
 *
 * <PageTabs layout="side" defaultTab="progress">
 *   <PageTab id="progress" label="Progress">...</PageTab>
 * </PageTabs>
 */
export function PageTabs({ defaultTab, layout = "horizontal", children }) {
  const isSide = layout === "side"
  const tabs = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === PageTab
  )

  const tabIds = tabs.map((tab) => tab.props.id)
  const initialTab = defaultTab && tabIds.includes(defaultTab) ? defaultTab : tabIds[0]
  const [activeId, setActiveId] = useState(initialTab)

  if (tabs.length === 0) return null

  const activePanel = tabs.find((tab) => tab.props.id === activeId) || tabs[0]

  return (
    <TabsRoot $side={isSide}>
      <TabList role="tablist" aria-label="Page sections" $side={isSide}>
        {tabs.map((tab) => {
          const { id, label } = tab.props
          const selected = id === activeId
          return (
            <TabButton
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={selected}
              aria-controls={`panel-${id}`}
              $selected={selected}
              $side={isSide}
              onClick={() => setActiveId(id)}
            >
              {label}
            </TabButton>
          )
        })}
      </TabList>
      <TabPanel
        role="tabpanel"
        id={`panel-${activePanel.props.id}`}
        aria-labelledby={`tab-${activePanel.props.id}`}
        $side={isSide}
      >
        {activePanel.props.children}
      </TabPanel>
    </TabsRoot>
  )
}

export function PageTab() {
  return null
}

const SIDE_TAB_FIXED_BREAKPOINT = "1420px"

const TabsRoot = styled.div`
  margin: var(--space-lg) 0;
  max-width: ${({ $side }) => ($side ? "none" : "54rem")};

  ${({ $side }) =>
    $side &&
    css`
      @media (min-width: ${SIDE_TAB_FIXED_BREAKPOINT}) {
        padding-left: 224px;
      }

      @media (max-width: 720px) {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      @media (min-width: 721px) and (max-width: ${SIDE_TAB_FIXED_BREAKPOINT}) {
        display: grid;
        grid-template-columns: minmax(10rem, 13rem) minmax(0, 1fr);
        gap: var(--space-xl);
        align-items: start;
      }
    `}
`

const TabList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);

  ${({ $side }) =>
    $side
      ? css`
          flex-direction: column;
          flex-wrap: nowrap;
          align-items: stretch;
          gap: 10px;
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;

          @media (min-width: ${SIDE_TAB_FIXED_BREAKPOINT}) {
            position: fixed;
            top: 230px;
            left: 24px;
            width: 200px;
            max-height: calc(100vh - 180px);
            overflow-y: auto;
            overscroll-behavior: contain;
          }

          @media (max-width: 720px) {
            flex-direction: row;
            flex-wrap: nowrap;
            overflow-x: auto;
            padding-bottom: var(--space-xs);
            border-bottom: 1px solid var(--color-border);
            -webkit-overflow-scrolling: touch;
          }
        `
      : css`
          margin-bottom: var(--space-lg);
          padding-bottom: var(--space-sm);
          border-bottom: 1px solid var(--color-border);
        `}
`

const TabButton = styled.button`
  appearance: none;
  background: none;
  color: var(--color-text);
  font-family: var(--font-body);
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  ${({ $side, $selected }) =>
    $side
      ? css`
          border: none;
          border-left: 3px solid
            ${$selected ? "var(--color-accent)" : "var(--color-border)"};
          border-radius: 0;
          padding: 2px 0 2px 8px;
          text-align: left;
          font-size: 1.5rem;
          line-height: 1.5;
          font-weight: ${$selected ? 600 : 400};
          color: ${$selected ? "var(--color-accent)" : "var(--color-muted)"};
          white-space: nowrap;

          &:hover {
            color: var(--color-accent);
            border-left-color: var(--color-accent);
          }

          @media (max-width: 720px) {
            border-left: none;
            border-bottom: 2px solid
              ${$selected ? "var(--color-accent)" : "transparent"};
            padding: 0.45rem 0.85rem;
            font-size: 0.9375rem;
            flex-shrink: 0;
          }
        `
      : css`
          border: 1px solid ${$selected ? "var(--color-accent)" : "var(--color-border)"};
          border-radius: 999px;
          padding: 0.45rem 1rem;
          background: ${$selected ? "var(--color-accent)" : "transparent"};
          font-size: 0.8125rem;
          font-weight: ${$selected ? 600 : 500};
          letter-spacing: 0.03em;

          &:hover {
            border-color: var(--color-accent);
          }
        `}
`

const TabPanel = styled.div`
  min-width: 0;
  width: 100%;

  > * + * {
    margin-top: var(--space-md);
  }

  h2 {
    font-size: clamp(1.25rem, 2.5vw, 1.75rem);
    margin-bottom: var(--space-sm);
    padding-top: 0;
    border-top: none;
  }

  p {
    color: var(--color-muted);
    line-height: 1.7;
    max-width: 48rem;
  }

  ${({ $side }) =>
    $side &&
    css`
      p {
        max-width: none;
      }
    `}
`
