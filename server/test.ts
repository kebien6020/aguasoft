import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import process from 'node:process'
import { globSync } from 'glob'
import { rmSync } from 'node:fs'

const env = { ...process.env, NODE_ENV: 'test' }

// Prepare test db
rmSync(join(import.meta.dirname, 'db.test.sqlite'), { force: true })

const sqArgs = ['run', 'migrate', '--', '--env', 'test']
console.log('+', 'npm', sqArgs.join(' '))

spawnSync('npm', sqArgs, {
  stdio: 'inherit',
  env,
})

// Run tests
const flags = process.argv.slice(2)
const testFiles = globSync('src/**/*.test.ts').concat(globSync('src/__tests__/**/*.ts'))

const args = [
  ...['--import', 'tsx'], // Support typescript
  '--test',
  ...['--test-isolation', 'none'], // Run tests serially to avoid DB races
  ...flags, // Pass custom flags like --test-only or --test-update-snapshots
  ...testFiles,
]

console.log('+', 'node', args.join(' '))

const res = spawnSync('node', args, {
  stdio: 'inherit',
  env,
})

if (res.status !== 0) {
  console.error('Tests failed')
  process.exit(res.status)
}
