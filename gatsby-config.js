/**
 * @type {import('gatsby').GatsbyConfig}
 */
// #region agent log
;(() => {
  const fs = require('fs')
  const path = require('path')
  const payload = {
    sessionId: 'dc9351',
    runId: process.env.DEBUG_RUN_ID || 'pre-fix',
    hypothesisId: 'H1',
    location: 'gatsby-config.js:load',
    message: 'gatsby-config module evaluating',
    data: {
      node: process.version,
      cwd: process.cwd(),
      dirname: __dirname,
    },
    timestamp: Date.now(),
  }
  fetch('http://127.0.0.1:7655/ingest/5721da10-a9c8-4ca3-8976-132a37bf6757', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': 'dc9351',
    },
    body: JSON.stringify(payload),
  }).catch(() => {})
  try {
    fs.mkdirSync(path.join(__dirname, '.cursor'), { recursive: true })
    fs.appendFileSync(path.join(__dirname, '.cursor', 'debug-dc9351.log'), `${JSON.stringify(payload)}\n`)
  } catch (_) {}
})()
// #endregion

module.exports = {
  siteMetadata: {
    title: `iGEM Toronto 2026`,
    description: `iGEM Toronto 2026 Wiki`,
    author: `iGEM Toronto`,
    siteUrl: `https://github.com/petadex/iGEM_wiki.git`,
  },
  plugins: [
    `gatsby-plugin-styled-components`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `team`,
        path: `${__dirname}/src/data/team`,
      },
    },
    `gatsby-transformer-csv`,
  ],
}
