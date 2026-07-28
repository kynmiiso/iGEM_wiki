import { spawn } from "child_process"
import fs from "fs"
import path from "path"
import process from "process"

// Exit code 2 from payload:export means the Payload CMS was unreachable
// (down, paused database, etc.). In that case we fall back to the committed
// export in src/content/wiki/_payload-export instead of failing the build.
// Set PAYLOAD_SYNC_STRICT=1 to make an unreachable CMS fatal again.
const EXIT_CMS_UNREACHABLE = 2
const strict = process.env.PAYLOAD_SYNC_STRICT === "1"
const committedExportRoot = path.join(process.cwd(), "src", "content", "wiki", "_payload-export")

const exportCode = await run("npm", ["run", "payload:export"], { allowFailure: true })

if (exportCode !== 0) {
  const canFallBack =
    !strict && exportCode === EXIT_CMS_UNREACHABLE && hasCommittedExport(committedExportRoot)

  if (!canFallBack) {
    console.error(`npm run payload:export failed with exit code ${exportCode}`)
    process.exit(exportCode)
  }

  console.warn("")
  console.warn("WARNING: Payload CMS is unreachable. Falling back to the committed export in")
  console.warn(`         ${path.relative(process.cwd(), committedExportRoot)}.`)
  console.warn("         The build will use possibly stale CMS content. Restore the CMS and")
  console.warn("         redeploy to pick up the latest published pages.")
  console.warn("")
}

await run("npm", ["run", "validate:content"])

function hasCommittedExport(root) {
  if (!fs.existsSync(root)) return false
  return findMdxFiles(root).length > 0
}

function findMdxFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return findMdxFiles(entryPath)
    if (entry.isFile() && entry.name.endsWith(".mdx")) return [entryPath]
    return []
  })
}

async function run(command, args, { allowFailure = false } = {}) {
  const executable = process.platform === "win32" && command === "npm" ? "npm.cmd" : command

  return await new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: process.cwd(),
      shell: true,
      stdio: "inherit",
    })

    child.on("exit", (code) => {
      if (code === 0 || allowFailure) {
        resolve(code ?? 1)
      } else {
        reject(new Error(`${executable} ${args.join(" ")} failed with exit code ${code}`))
      }
    })
  })
}
