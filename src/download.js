const gitlabHost = process.env.GITLAB_HOSTNAME || 'gitlab.com'
const repoBranch = process.env.REPO_BRANCH || 'main'
const jobName = process.env.JOB_NAME || 'deploy'
const accessToken = process.env.ACCESS_TOKEN
const fs = require('fs')
const https = require('https')
const path = require('path')

class Download {
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
        // TODO: Unzip..
        // TODO: deployment directory: /var/www/moneytips.nl/html (using Docker volume mount)
        // Download to 'download' folder
        const absolutePath = path.join(__dirname, '..', 'download', 'artifact.zip')
        const filePath = fs.createWriteStream(absolutePath)
        res.pipe(filePath)
        filePath.on('finish', () => {
          filePath.close()
          console.log('INFO: Download Completed')
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
