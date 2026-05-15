import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

const rootDir = process.cwd()
const useWindowsShell = process.platform === 'win32'

const services = [
  {
    name: 'backend',
    cwd: path.join(rootDir, 'Backend'),
    command: useWindowsShell ? 'npm run dev' : 'npm',
    args: useWindowsShell ? [] : ['run', 'dev'],
  },
  {
    name: 'frontend',
    cwd: path.join(rootDir, 'Frontend'),
    command: useWindowsShell ? 'npm run dev' : 'npm',
    args: useWindowsShell ? [] : ['run', 'dev'],
  },
]

const children = []

const shutdown = (signal = 'SIGINT') => {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal)
    }
  }
}

for (const service of services) {
  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    stdio: 'pipe',
    env: process.env,
    shell: useWindowsShell,
  })

  const prefix = `[${service.name}]`

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`${prefix} ${chunk}`)
  })

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`${prefix} ${chunk}`)
  })

  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code
    }
  })

  child.on('error', (error) => {
    process.stderr.write(`${prefix} Failed to start: ${error.message}\n`)
    process.exitCode = 1
  })

  children.push(child)
}

process.on('SIGINT', () => {
  shutdown('SIGINT')
  process.exit()
})

process.on('SIGTERM', () => {
  shutdown('SIGTERM')
  process.exit()
})
