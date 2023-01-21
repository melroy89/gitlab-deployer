const gitlabHost = process.env.GITLAB_HOSTNAME || 'gitlab.com'
const repoBranch = process.env.REPO_BRANCH || 'main'
const jobName = process.env.JOB_NAME || 'deploy'
const accessToken = process.env.ACCESS_TOKEN
const fs = require('fs')
const https = require('https')
const path = require('path')
const extract = require('./extract')
const TEMP_FOLDER = process.env.TEMP_FOLDER || path.join(__dirname, '..', 'tmp')

class Download {
  /**
   * Download latest artifact from specific branch and job name (default branch: main and default job name is: deploy)
   * When the repository is private, please also set ACCESS_TOKEN.
   * @param {Number} projectId GitLab Project ID
   */
  static download (projectId) {
    const options = {
      hostname: gitlabHost,
      path: `/api/v4/projects/${projectId}/jobs/artifacts/${repoBranch}/download?job=${jobName}`
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
