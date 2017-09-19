import * as fs from 'fs'
import archiver = require('archiver')
import * as http from 'http'
import logs from '../src/util/logs'
import { initializeDefaultLogLevels } from '../src/util/logs'

// Set these for each release...
const versionParts = {
  major: 1,
  minor: 1,
  patch: 0,
}

// tslint:disable-next-line:max-line-length
// const url = `http://nebulous.pelco.org/artifactory/libs-releases/com/pelco/vxportal/${artifact}/${version}/${filename}`
const group = 'com.pelco.vxportal'
const branch = calculateBranchName()
const artifact = calculateArtifactName(branch)
const version = calculateVersion(branch, versionParts)
const filename = `${artifact}-${version}.zip`
const host = 'nebulous.pelco.org'
const groupPath = group.replace(new RegExp(/\./, 'g'), '/')
const zipPath = version.endsWith('-SNAPSHOT')
  ? `/artifactory/libs-snapshots-local/${groupPath}/${artifact}/${version}/${filename}`
  : `/artifactory/libs-releases-local/${groupPath}/${artifact}/${version}/${filename}`
const pomPath = zipPath.replace(/\.zip$/, '.pom')
const username = 'ravenbuild'
const password = process.env.PUBLISH_PASSWORD
if (!password) {
  throw new Error('The PUBLISH_PASSWORD environment variable was missing')
}

initializeDefaultLogLevels()

fs.writeFileSync('dist/webconfig/portal/version', `{"version": "${version}"}`)

logs.BUILD.info(`Creating archive at ${filename}...`)

const fileOutput = fs.createWriteStream(filename)

const archive = archiver('zip', {store: true})
archive.on('error', (err) => {throw err})
archive.directory('dist/webconfig/portal', '/')
archive.pipe(fileOutput)
archive.finalize()

fileOutput.on('close', () => {
  logs.BUILD.info(`...created`)

  logs.BUILD.info(`Uploading ZIP to http://${host}${zipPath}...`)
  const zipRequest = http.request({host, path: zipPath, auth: `${username}:${password}`, method: 'PUT'}, (response) => {
    const chunks = []
    response.on('data', (chunk) => {
      chunks.push(chunk)
    })
    response.on('end', () => {
      logs.BUILD.info('...uploaded')
      logs.BUILD.debug(`Server response: ${chunks.join()}`)
      if (response.statusCode >= 300) {
        throw new Error('Response status code: ' + response.statusCode)
      }
    })
    response.on('error', (err) => {
      throw err
    })
  })
  fs.createReadStream(filename).pipe(zipRequest).on('close', () => {
    zipRequest.end()
  })
})

logs.BUILD.info(`Uploading POM to http://${host}${pomPath}...`)
const pomRequest = http.request({host, path: pomPath, auth: `${username}:${password}`, method: 'PUT'}, (response) => {
  const chunks = []
  response.on('data', (chunk) => {
    chunks.push(chunk)
  })
  response.on('end', () => {
    logs.BUILD.info('...uploaded')
    logs.BUILD.debug(`Server response: ${chunks.join()}`)
    if (response.statusCode >= 300) {
      throw new Error('Response status code: ' + response.statusCode)
    }
  })
  response.on('error', (err) => {
    throw err
  })
})

// tslint:disable-next-line:max-line-length
pomRequest.write(`<?xml version="1.0" encoding="UTF-8"?>
<project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd" xmlns="http://maven.apache.org/POM/4.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <modelVersion>4.0.0</modelVersion>
  <groupId>${group}</groupId>
  <artifactId>${artifact}</artifactId>
  <version>${version}</version>
  <dependencies/>
</project>
`)
pomRequest.end()

// tslint:disable:no-shadowed-variable

function calculateBranchName() {
  const gitHeadText = fs.readFileSync('.git/HEAD').toString().trim()
  return gitHeadText.substr(16)
}

function calculateVersion(branch: string, versionParts: {major: number, minor: number, patch: number}) {
  if (branch.startsWith('release-')) {
    const buildNumber = process.env.BUILD_NUMBER
    if (!buildNumber) {
      throw new Error(`Could not find BUILD_NUMBER environment variable to build branch ${branch}`)
    }
    return `${versionParts.major}.${versionParts.minor}.${versionParts.patch}.${buildNumber}`
  } else {
    return `${versionParts.major}.${versionParts.minor}.${versionParts.patch}-SNAPSHOT`
  }
}

function calculateArtifactName(branch: string) {
  if (branch === 'master' || branch.startsWith('release-')) {
    return 'vxportal'
  } else {
    return `vxportal-${branch}`
  }
}
