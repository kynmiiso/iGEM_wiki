import React from "react"
import { Link } from "gatsby"
import styled from "styled-components"
import WikiLayout from "../components/layout.js"

const NotFoundPage = () => (
  <WikiLayout pageTitle="Page not found" sectionLabel="404">
    <NotFoundBody>
      <p>
        The page you requested does not exist or has moved. You can go back to the wiki home and
        browse from there.
      </p>
      <HomeLink to="/">Back to home</HomeLink>
    </NotFoundBody>
  </WikiLayout>
)

export default NotFoundPage

export const Head = () => <title>Page not found — iGEM Toronto 2026</title>

const NotFoundBody = styled.div`
  max-width: 36rem;
  color: var(--color-muted);
  font-size: 1rem;
  line-height: 1.65;

  p {
    margin-bottom: var(--space-md);
  }
`

const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-accent);
  border-radius: 999px;
  color: var(--color-text);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;

  &:hover {
    background: var(--color-accent);
  }
`
