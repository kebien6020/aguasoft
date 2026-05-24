import app from './app.js'

const portNum = Number(process.env.PORT)
const PORT = !isNaN(portNum) ? portNum : 3000
const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test')
    console.log('  App is running at http://localhost:%d', PORT)

})

export { server }
