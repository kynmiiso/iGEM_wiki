import path from "path"

const wikiTemplate = path.resolve(`./src/templates/wiki-mdx.js`)

export async function createPages({ actions, graphql, reporter }) {
  const { createPage } = actions

  const result = await graphql(`
    query WikiMdxPages {
      allMdx(
        filter: {
          internal: { contentFilePath: { regex: "/src/content/wiki/" } }
          frontmatter: { path: { ne: null } }
        }
      ) {
        nodes {
          id
          frontmatter {
            path
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`Unable to load MDX wiki pages`, result.errors)
    return
  }

  const seenPaths = new Set()

  for (const node of result.data.allMdx.nodes) {
    if (path.basename(node.internal.contentFilePath).startsWith(`_`)) {
      continue
    }

    const pagePath = node.frontmatter.path

    if (seenPaths.has(pagePath)) {
      reporter.panicOnBuild(`Duplicate MDX wiki path found: ${pagePath}`)
      return
    }

    seenPaths.add(pagePath)

    createPage({
      path: pagePath,
      component: `${wikiTemplate}?__contentFilePath=${node.internal.contentFilePath}`,
      context: {
        id: node.id,
      },
    })
  }
}
