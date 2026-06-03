import { spawn } from "child_process"
import process from "process"

const steps = [
  ["npm", ["run", "payload:export"]],
  ["npm", ["run", "validate:content"]],
]

for (const [command, args] of steps) {
  await run(command, args)
}

async function run(command, args) {
  const executable = process.platform === "win32" && command === "npm" ? "npm.cmd" : command

  await new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: process.cwd(),
      shell: true,
      stdio: "inherit",
    })

    child.on("exit", (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${executable} ${args.join(" ")} failed with exit code ${code}`))
      }
    })
  })
}
