const express = require('express')
const router = express.Router()

// Handle GitLab web hook POST calls
router.post('/', (req, res) => {
  res.sendStatus(200)

  // TODO: Check gitlab secret token
  const body = req.body
  if (Object.prototype.hasOwnProperty.call(body, 'object_kind')) {
    switch (body.object_kind) {
      // In case of a deployment job
      case 'deployment': {
        const environment = body.environment
        const id = body.project.id
        const name = body.project.name
        console.log(`Env ${environment}, ID: ${id}, name: ${name}.`)
      }
        break
    }
  }
})

module.exports = router
