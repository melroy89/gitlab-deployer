const secretToken = process.env.GITLAB_SECRET_TOKEN
const express = require('express')
const download = require('../download')
const router = express.Router()

// Handle GitLab web hook POST call(s)
router.post('/', (req, res) => {
  res.sendStatus(200)

  const gitlabToken = req.header('X-Gitlab-Token')
  if (gitlabToken && gitlabToken === secretToken) {
    const body = req.body
    if (Object.prototype.hasOwnProperty.call(body, 'object_kind')) {
      switch (body.object_kind) {
        // In case of a deployment job
        case 'deployment': {
          const projectId = body.project.id
          if (projectId) {
            console.log(`INFO: Deployment triggered (Project ID: ${projectId})`)
            download(projectId)
          }
        }
          break
      }
    }
  } else {
    console.log('WARN: GitLab Secret Token mismatch!')
  }
})

module.exports = router
