import app from './app'
import { io } from './io'

const PORT = process.env.PORT || 3000

export const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test')
    console.log('  App is running at http://localhost:%d', PORT)

})

io.listen(server)
