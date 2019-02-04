const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')

const destDir = path.resolve('../aguasoft-backups')

const dbFile = path.resolve('./db.sqlite')

const dateString = (new Date()).toISOString().replace(/:/g, '.')
const destPath = path.join(destDir, `db.${dateString}.sqlite`)

if (!fs.existsSync(destDir))
    fs.mkdirSync(destDir)

console.log(`Making backup from ${dbFile} to ${destPath}`)

childProcess.spawn('sqlite3', [dbFile, `.backup ${destPath.replace(/\\/g, '\\\\')}`], { stdio: 'inherit' })
