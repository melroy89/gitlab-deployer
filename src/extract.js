const path = require('path')
const AdmZip = require('adm-zip')
const DESTINATION_PATH = process.env.DESTINATION_PATH || path.join(__dirname, '..', 'dest')

class Extract {
  /**
   * Extract Zip file
   * @param {String} sourceFilePath Full path to file
   */
  static extract (sourceFilePath) {
    const zip = new AdmZip(sourceFilePath)
    console.log('INFO: Extracting artifact zip...')
    // Extract zip; override target files + keep original permissions
    // User can mount this destination folder (/app/dest) to another location using Docker volume mount
    zip.extractAllTo(DESTINATION_PATH, true, true)
  }
}

module.exports = Extract.extract
