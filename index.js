const core = require('@actions/core')
const github = require("@actions/github");
const { runnerIsActions } = require('./lib/utils')
const { validateSchema } = require('./lib/schema')
const { findCommitsWithAssociatedPullRequests } = require('./lib/commits')
const { sortPullRequests } = require('./lib/sort-pull-requests')
const { findReleases, generateBody } = require('./lib/releases');

function getConfig({ context }) {
    var config = { template: "" }
    if (core.getInput('template') !== "")
        config.template = core.getInput('template')
    if (core.getInput('categories') !== "")
        config.categories = parseCategories({ context })
    if (core.getInput('filter-by-commitish') !== "")
        config.filterByCommitish = core.getInput('filter-by-commitish')
    if (core.getInput('change-template') !== "")
        config['change-template'] = core.getInput('change-template')
    if (core.getInput('category-template') !== "")
        config['category-template'] = core.getInput('category-template')
    if (core.getInput('sort-by') !== "")
        config['sort-by'] = core.getInput('sort-by')
    if (core.getInput('sort-direction') !== "")
        config['sort-direction'] = core.getInput('sort-direction')
    if (core.getInput('no-changes-template') !== "")
        config['no-changes-template'] = core.getInput('no-changes-template')

    return validateSchema(config)
}

function parseCategories({ context }) {
    try {
        return JSON.parse(core.getInput('categories'))
    } catch (error) {
        log({ context, error, message: 'Invalid config file' })

        if (runnerIsActions()) {
            core.setFailed('Invalid config file')
        }
        return null
    }
}

async function run() {
    try {
        const context = github.context
        const octokit = github.getOctokit(GITHUB_TOKEN)
        console.log(octokit.rest)
        const config = getConfig({ context })
        if (config === null) return
        // GitHub Actions merge payloads slightly differ, in that their ref points
        // to the PR branch instead of refs/heads/master
        const ref = process.env['GITHUB_REF'] || context.payload.ref

        const { draftRelease, lastRelease } = await findReleases({
            ref,
            context,
            octokit,
            config,
        })
        const {
            commits,
            pullRequests: mergedPullRequests,
        } = await findCommitsWithAssociatedPullRequests({
            context,
            octokit,
            ref,
            lastRelease,
            config,
        })

        const sortedMergedPullRequests = sortPullRequests(
            mergedPullRequests,
            config['sort-by'],
            config['sort-direction']
        )

        let body = generateBody({ config, lastRelease, mergedPullRequests: sortedMergedPullRequests })
        core.setOutput('body', body);
    } catch (error) {
        console.log(error)
        core.setFailed(error.message);
    }
}

const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')

run();