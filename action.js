const core = require('@actions/core')
const { run } = require('@probot/adapter-github-actions')
const app = require('./index')

run(app).catch((err) => {
    core.setFailed(`💥 Generate release notes failed with error: ${err.message}`)
})