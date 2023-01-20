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
          const status = body.status
          const projectId = body.project.id
          if (status) {
            switch (status) {
              case 'running':
                console.log(`INFO: Deployment is running (Project ID: ${projectId})`)
                break
              case 'success': {
                console.log(`INFO: Deployment is successful (Project ID: ${projectId}), starting download`)
                download(projectId)
                break
              }
            }
          } else {
            console.warn('WARN: Missing deployment status?')
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
