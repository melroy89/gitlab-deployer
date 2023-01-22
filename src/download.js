const gitlabHost = process.env.GITLAB_HOSTNAME || 'gitlab.com'
const repoBranch = process.env.REPO_BRANCH || 'main'
const jobName = process.env.JOB_NAME || 'deploy'
const accessToken = process.env.ACCESS_TOKEN
const GITLAB_API_PREFIX = '/api/v4'
const fs = require('fs')
const https = require('https')
const path = require('path')
const extract = require('./extract')
const TEMP_FOLDER = process.env.TEMP_FOLDER || path.join(__dirname, '..', 'tmp')

class Download {
  /**
   * Download latest GitLab artifact using the branch (main) and job name (deploy) by default.
   * Or when providing a job ID, we will use the job ID to download the latest artifact.
   *
   * Important: When it's a private repository please also set the ACCESS_TOKEN environment var.
   * @param {Number} projectId GitLab Project ID
   * @param {Number} jobId (Optionally) GitLab Job ID, if job ID is missing the artifact will be downloaded using branch + job name
   */
  static download (projectId, jobId = null) {
    // Using job name by default (if jobId is empty)
    let apiArtifactPath = `/projects/${projectId}/jobs/artifacts/${repoBranch}/download?job=${jobName}`
    if (jobId) {
      // Using job ID
      apiArtifactPath = `/projects/${projectId}/jobs/${jobId}/artifacts`
    }

    const options = {
      hostname: gitlabHost,
      path: GITLAB_API_PREFIX.concat(apiArtifactPath)
    }
    if (accessToken) {
      options.headers = {
        'PRIVATE-TOKEN': accessToken
      }
    }

    https.get(options, (res) => {
      if (res.statusCode && res.statusCode === 200) {
        // Download to '../tmp' folder with filename 'artifact.zip' by default
        const absolutePath = path.join(TEMP_FOLDER, 'artifact.zip')
        const filePath = fs.createWriteStream(absolutePath)
        res.pipe(filePath)
        filePath.on('finish', () => {
          filePath.close()
          console.log('INFO: Download Completed')
          // Unzip artifact.zip
          try {
            extract(absolutePath)
          } catch (err) {
            if ('message' in err) {
              console.error('ERROR: Failed to extract artifact zip file: ' + err.message)
            }
            if ('stack' in err) {
              console.error(err.stack)
            } else {
              console.error(err)
            }
          }
        })
      } else {
        console.warn('WARN: Artifact not found!')
        console.log(`INFO: Path URL: ${options.path}`)
      }
    }).on('error', (err) => {
      console.error('ERROR: Download Failed!')
      console.log(`INFO: Path URL: ${options.path}`)
      console.error(err)
    })
  }
}

module.exports = Download.download
