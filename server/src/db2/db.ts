import configs from '../db/config.js'
import { env } from '../utils/env.js'
import sqlite3 from 'better-sqlite3'
import debug from 'debug'
import { time as utilTime } from '../utils/benckmark.js'

const config = configs[env]
const log = debug('db2:general')
const timeLog = debug('db2:timing')

export const db = sqlite3(config.storage, { verbose: (msg, ...args) => log((msg as string).replace(/\s+/g, ' ') + ` [${args.join(', ')}]`) })

export const time = utilTime(timeLog)

