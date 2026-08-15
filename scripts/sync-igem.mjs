import { spawnSync } from "node:child_process"

function git(args, options = {}) {
  const result = spawnSync("git", args, {
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  })

  if (result.status !== 0) {
    process.exit(result.status || 1)
  }

  return result.stdout?.trim()
}

const status = git(["status", "--porcelain"], { capture: true })

if (status) {
  console.error("Working tree is not clean. Commit or stash your changes first.")
  process.exit(1)
}

const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14)
const syncBranch = `igem-sync-${timestamp}`

git(["switch", "main"])
git(["pull", "--ff-only", "origin", "main"])
git(["fetch", "igem", "main"])
git(["switch", "-c", syncBranch, "igem/main"])

const merge = spawnSync("git", ["merge", "--no-edit", "origin/main"], {
  stdio: "inherit",
})

if (merge.status !== 0) {
  console.error(
    `Merge stopped. Resolve the conflicts on ${syncBranch}, then push it to GitLab.`,
  )
  process.exit(merge.status || 1)
}

git(["push", "-u", "igem", syncBranch])
git(["switch", "main"])

console.log(`GitLab sync branch pushed: ${syncBranch}`)
