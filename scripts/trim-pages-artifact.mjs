import fs from "fs/promises"
import path from "path"
import sharp from "sharp"

const root = process.cwd()
const publicRoot = path.join(root, "public")

const removeGlobs = [
  [publicRoot, (file) => file.endsWith(".map")],
  [path.join(publicRoot, "~partytown", "debug"), () => true],
]

const imageJobs = [
  {
    file: "hardware-notebook/requirements/image3.png",
    format: "png",
    options: { compressionLevel: 9, palette: true, quality: 72 },
  },
  {
    file: "wiki-mockup/wiki-front-front.png",
    format: "png",
    options: { compressionLevel: 9, palette: true, quality: 72 },
  },
  {
    file: "wiki-mockup/wiki-front-back.jpg",
    format: "jpeg",
    options: { quality: 72, progressive: true, mozjpeg: true },
  },
]

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function walk(dir, visitor) {
  if (!(await exists(dir))) return
  const entries = await fs.readdir(dir, { withFileTypes: true })
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(entryPath, visitor)
        return
      }
      await visitor(entryPath)
    })
  )
}

for (const [dir, shouldRemove] of removeGlobs) {
  await walk(dir, async (filePath) => {
    if (shouldRemove(filePath)) {
      await fs.rm(filePath, { force: true })
    }
  })
}

await fs.rm(path.join(publicRoot, "webpack.stats.json"), { force: true })

for (const job of imageJobs) {
  const filePath = path.join(publicRoot, job.file)
  if (!(await exists(filePath))) continue

  const tempPath = `${filePath}.tmp`
  const pipeline = sharp(filePath)

  if (job.format === "png") {
    await pipeline.png(job.options).toFile(tempPath)
  } else {
    await pipeline.jpeg(job.options).toFile(tempPath)
  }

  const [before, after] = await Promise.all([fs.stat(filePath), fs.stat(tempPath)])
  if (after.size < before.size) {
    await fs.rename(tempPath, filePath)
  } else {
    await fs.rm(tempPath, { force: true })
  }
}
