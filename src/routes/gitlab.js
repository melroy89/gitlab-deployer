const secretToken = process.env.GITLAB_SECRET_TOKEN
const projectIdOverride = process.env.PROJECT_ID
const useJobName = process.env.USE_JOB_NAME || 'no'
const express = require('express')
const downloadArtifact = require('../download')
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
          // If the user set PROJECT_ID env variable, we override the project ID and use that one instead,
          // could be useful from security standpoint.
          const projectId = projectIdOverride || body.project.id
          const jobId = body.deployable_id
          if (status) {
            switch (status) {
              case 'running':
                console.log(`INFO: Deployment job is running (Project ID: ${projectId})`)
                break
              case 'failed':
                console.log(`INFO: Deployment job failed (Project ID: ${projectId})`)
                break
              case 'canceled':
                console.log(`INFO: Deployment job is canceled (Project ID: ${projectId})`)
                break
              case 'success': {
                // If we want to use the job name & branch name to download the artifact, we omit the Job ID
                if (useJobName === 'yes') {
                  console.log(`INFO: Deployment job is successful (Project ID: ${projectId}), starting download`)
                  downloadArtifact(projectId)
                } else {
                  // By default we use the Job ID to fetch the GitLab Artifact
                  console.log(`INFO: Deployment job is successful (Project ID: ${projectId}, Job ID: ${jobId}), starting download`)
                  downloadArtifact(projectId, jobId)
                }
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
