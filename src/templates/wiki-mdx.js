import React from "react"
import { graphql } from "gatsby"
import { MDXProvider } from "@mdx-js/react"
import styled from "styled-components"
import WikiLayout from "../components/layout.js"
import Seo from "../components/seo.js"
import { mdxComponents } from "../components/mdx/wikiComponents.js"

const formatDate = (date) => {
  if (!date) return null
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed)
}

const WikiMdxTemplate = ({ data, children }) => {
  const { frontmatter } = data.mdx
  const owners = frontmatter.owners || []
  const updated = formatDate(frontmatter.updated)

  return (
    <WikiLayout pageTitle={frontmatter.title} sectionLabel={frontmatter.section}>
      <ArticleShell>
        {(frontmatter.description || owners.length > 0 || updated || frontmatter.status) && (
          <PageMeta aria-label="Page metadata">
            {frontmatter.description && <Description>{frontmatter.description}</Description>}
            <MetaRow>
              {frontmatter.status && <StatusBadge>{frontmatter.status}</StatusBadge>}
              {owners.length > 0 && <span>Maintained by {owners.join(", ")}</span>}
              {updated && <span>Updated {updated}</span>}
            </MetaRow>
          </PageMeta>
        )}
        <Article>
          <MDXProvider components={mdxComponents}>{children}</MDXProvider>
        </Article>
      </ArticleShell>
    </WikiLayout>
  )
}

export const query = graphql`
  query WikiMdxPage($id: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
        section
        path
        navTitle
        description
        owners
        updated
        status
      }
    }
  }
`

export const Head = ({ data }) => {
  const { frontmatter } = data.mdx
  return <Seo title={frontmatter.title} description={frontmatter.description} />
}

export default WikiMdxTemplate

const ArticleShell = styled.div`
  max-width: 54rem;
`

const PageMeta = styled.aside`
  margin-bottom: var(--space-xl);
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: color-mix(in srgb, var(--color-accent) 7%, transparent);
`

const Description = styled.p`
  color: var(--color-text);
  font-size: 1.05rem;
  line-height: 1.75;
  margin-bottom: var(--space-md);
`

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm) var(--space-md);
  color: var(--color-muted);
  font-size: 0.875rem;
`

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  padding: 0 0.625rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

const Article = styled.article`
  color: var(--color-text);
  font-size: 1rem;
  line-height: 1.75;

  > * + * {
    margin-top: var(--space-md);
  }

  h2,
  h3,
  h4 {
    color: var(--color-text);
    margin-top: var(--space-xl);
    max-width: 48rem;
  }

  h2 {
    padding-top: var(--space-lg);
    border-top: 1px solid var(--color-border);
    font-size: clamp(1.75rem, 4vw, 2.5rem);
  }

  h3 {
    font-size: clamp(1.35rem, 3vw, 1.75rem);
  }

  h4 {
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  p,
  li,
  blockquote {
    color: var(--color-muted);
  }

  p,
  ul,
  ol,
  blockquote,
  pre,
  table {
    max-width: 48rem;
  }

  strong {
    color: var(--color-text);
  }

  a:not(.heading-anchor) {
    color: var(--color-text);
    border-bottom: 1px solid var(--color-accent);
    text-decoration: none;
  }

  a:not(.heading-anchor):hover {
    background: color-mix(in srgb, var(--color-accent) 18%, transparent);
  }

  .heading-anchor {
    color: inherit;
    text-decoration: none;
  }

  ul,
  ol {
    padding-left: 1.4rem;
  }

  li + li {
    margin-top: 0.35rem;
  }

  blockquote {
    padding: var(--space-md) var(--space-lg);
    border-left: 4px solid var(--color-accent);
    background: rgba(255, 255, 255, 0.22);
  }

  code {
    font-family: var(--font-mono);
    font-size: 0.88em;
  }

  :not(pre) > code {
    padding: 0.1rem 0.35rem;
    border: 1px solid color-mix(in srgb, var(--color-border) 45%, transparent);
    border-radius: 4px;
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.32);
  }

  pre {
    overflow-x: auto;
    padding: var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: #111111;
    color: #f4f4f1;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
  }

  th,
  td {
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    vertical-align: top;
  }

  th {
    color: var(--color-text);
    background: color-mix(in srgb, var(--color-accent) 15%, transparent);
    text-align: left;
  }

  td {
    color: var(--color-muted);
  }

  img {
    border-radius: 6px;
  }
`
