import cluster from 'node:cluster'
import os from 'node:os'
import process from 'node:process'

const numCPUs = os.availableParallelism()

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`)

  // Fork workers.
  for (let i = 0; i < numCPUs; i++)
    cluster.fork()


  cluster.on('exit', (worker, _code, _signal) => {
    console.log(`worker ${worker.process.pid} died`)
    const workerCount = Object.keys(cluster?.workers ?? {}).length
    if (workerCount < (numCPUs / 2)) {
      console.log('Too many workers died, exiting primary process')
      process.exit(1)
    }
  })
} else {
  await import('./index.js')
  console.log(`Worker ${process.pid} started`)
}
