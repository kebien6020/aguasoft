const fs = require('fs')
const path = require('path')

// https://stackoverflow.com/a/30405105/4992717
function copyFile(source, target) {
    return new Promise((resolve, reject) => {
        const rd = fs.createReadStream(source)
        rd.on('error', rejectCleanup)

        const wr = fs.createWriteStream(target)
        wr.on('error', rejectCleanup)

        function rejectCleanup(err) {
            rd.destroy()
            wr.end()
            reject(err)
        }
        wr.on('finish', resolve)
        rd.pipe(wr)
    })
}

const destDir = './backups'

const dbFile = path.resolve('./db.sqlite')

const dateString = (new Date()).toISOString().replace(/:/g, '.')
const dest = path.resolve(`${destDir}/db.${dateString}.sqlite`)

if (!fs.existsSync(destDir))
    fs.mkdirSync(destDir)

console.log(`Making backup from ${dbFile} to ${dest}`)
copyFile(dbFile, dest)
