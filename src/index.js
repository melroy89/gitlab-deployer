require('dotenv').config()
const port = process.env.PORT || 3042
const secretToken = process.env.GITLAB_SECRET_TOKEN
const createError = require('http-errors')
const express = require('express')
const routes = require('./routes')
global.ErrorState = false

if ((typeof secretToken === 'undefined') || secretToken === null || secretToken === '') {
  console.error('ERROR: GitLab Secret Token not provided but is required. Setup an .env file!')
  process.exit(1)
}

// Create the Express app
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', routes)

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// Error handler
app.use((error, req, res, next) => {
  // Only print errors in development
  if (req.app.get('env') === 'development') {
    console.error(error)
  }
  // Render the error page
  res.status(error.status || 500).json()
})

// Start server
app.listen(port, () => {
  console.log(`INFO: GitLab Deployer service is now listening at http://localhost:${port}`)
})
