import express from 'express'
import { setSwaggerDocs } from './config/swagger/swagger-set.js'
import users from './routes/users.routes.js'

const app = express()
app.use(express.json())

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  next()
})

setSwaggerDocs(app)
app.use('/api', users)

app.use((req, res, next) => {
  res.status(404).json({ message: 'End point not found' })
})

export default app
