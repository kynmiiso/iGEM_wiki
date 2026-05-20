/**
 * Spawn `gatsby develop` with an explicit cwd and pre-start debug line (session dc9351).
 */
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

const root = path.join(__dirname, '..')
const logPath = path.join(root, '.cursor', 'debug-dc9351.log')

function agentLog(location, message, hypothesisId, data = {}) {
  // #region agent log
  const payload = {
    sessionId: 'dc9351',
    runId: process.env.DEBUG_RUN_ID || 'pre-fix',
    hypothesisId,
    location,
    message,
    data: { ...data, node: process.version, role: 'develop-wrapper' },
    timestamp: Date.now(),
  }
  fetch('http://127.0.0.1:7655/ingest/5721da10-a9c8-4ca3-8976-132a37bf6757', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'dc9351' },
    body: JSON.stringify(payload),
  }).catch(() => {})
  try {
    fs.mkdirSync(path.dirname(logPath), { recursive: true })
    fs.appendFileSync(logPath, `${JSON.stringify(payload)}\n`)
  } catch (_) {}
  // #endregion
}

process.chdir(root)
agentLog('scripts/run-develop.cjs', 'wrapper spawning gatsby cli', 'H0')

const cli = path.join(root, 'node_modules', 'gatsby', 'cli.js')
const extraArgs = process.argv.slice(2).filter(a => a.length > 0)
const child = spawn(process.execPath, [cli, 'develop', ...extraArgs], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
})

child.on('error', err => {
  agentLog('scripts/run-develop.cjs', 'spawn error', 'H0', { err: String(err) })
  process.exit(1)
})

child.on('exit', (code, signal) => {
  agentLog('scripts/run-develop.cjs', 'gatsby child exit', 'H0', { code, signal })
  process.exit(code ?? 1)
})
