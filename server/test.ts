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

const baseArgs = [
  ...['--import', 'tsx'], // Support typescript
  '--test',
  ...flags, // Pass custom flags like --test-only or --test-update-snapshots
]

// Run each file individually. Slower but nicer with the DB setup
for (const file of testFiles) {
  const args = [...baseArgs, file]
  console.log('+', 'node', args.join(' '))

  spawnSync('node', args, {
    stdio: 'inherit',
    env,
  })
}
