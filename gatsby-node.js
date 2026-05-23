/**
 * Gatsby Node API — debug lifecycle instrumentation (session dc9351)
 */

const fs = require('fs')
const path = require('path')

const agentDebugLogPath = path.join(__dirname, '.cursor', 'debug-dc9351.log')

const debugLog = (location, message, hypothesisId, data = {}) => {
  // #region agent log
  const payload = {
    sessionId: 'dc9351',
    runId: process.env.DEBUG_RUN_ID || 'pre-fix',
    hypothesisId,
    location,
    message,
    data: { ...data, node: process.version, cwd: process.cwd(), command: process.argv.slice(1, 4).join(' ') },
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
    fs.mkdirSync(path.dirname(agentDebugLogPath), { recursive: true })
    fs.appendFileSync(agentDebugLogPath, `${JSON.stringify(payload)}\n`)
  } catch (_) {}
  // #endregion
}

/** @type {import('gatsby').GatsbyNode['onPreBootstrap']} */
exports.onPreBootstrap = () => {
  // #region agent log
  debugLog('gatsby-node.js:onPreBootstrap', 'onPreBootstrap entered', 'H2')
  // #endregion
}

/** @type {import('gatsby').GatsbyNode['onPostBootstrap']} */
exports.onPostBootstrap = () => {
  // #region agent log
  debugLog('gatsby-node.js:onPostBootstrap', 'onPostBootstrap entered', 'H3')
  // #endregion
}

/** @type {import('gatsby').GatsbyNode['onCreateDevServer']} */
exports.onCreateDevServer = ({ app }) => {
  // #region agent log
  debugLog('gatsby-node.js:onCreateDevServer', 'onCreateDevServer (dev server wiring)', 'H4', {
    hasApp: Boolean(app),
  })
  // #endregion
}
