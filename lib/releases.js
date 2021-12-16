const compareVersions = require('compare-versions')
const log = require('./log')
const template = require('./template')

const sortReleases = (releases) => {
    // For semver, we find the greatest release number
    // For non-semver, we use the most recently merged
    try {
        return releases.sort((r1, r2) => compareVersions(r1.tag_name, r2.tag_name))
    } catch (error) {
        return releases.sort(
            (r1, r2) => new Date(r1.created_at) - new Date(r2.created_at)
        )
    }
}

module.exports.findReleases = async ({ ref, context, config }) => {
    let releases = await context.octokit.paginate(
        context.octokit.repos.listReleases.endpoint.merge(
            context.repo({
                per_page: 100,
            })
        )
    )

    log({ context, message: `Found ${releases.length} releases` })

    const { 'filter-by-commitish': filterByCommitish } = config
    const filteredReleases = filterByCommitish
        ? releases.filter((r) => ref.match(`/${r.target_commitish}$`))
        : releases
    const sortedPublishedReleases = sortReleases(
        filteredReleases.filter((r) => !r.draft)
    )
    const draftRelease = filteredReleases.find((r) => r.draft)
    const lastRelease = sortedPublishedReleases[sortedPublishedReleases.length - 1]

    if (draftRelease) {
        log({ context, message: `Draft release: ${draftRelease.tag_name}` })
    } else {
        log({ context, message: `No draft release found` })
    }

    if (lastRelease) {
        log({ context, message: `Last release: ${lastRelease.tag_name}` })
    } else {
        log({ context, message: `No last release found` })
    }

    return { draftRelease, lastRelease }
}

const generateChangeLog = (mergedPullRequests, config) => {
    if (mergedPullRequests.length === 0) {
        return config['no-changes-template']
    }

    const [
        uncategorizedPullRequests,
        categorizedPullRequests,
    ] = categorizePullRequests(mergedPullRequests, config)

    const pullRequestToString = (pullRequests) =>
        pullRequests.map((pullRequest) =>
            template(config['change-template'], {
                $TITLE: pullRequest.title,
                $NUMBER: pullRequest.number,
                $AUTHOR: pullRequest.author ? pullRequest.author.login : 'ghost',
                $BODY: pullRequest.body,
                $URL: pullRequest.url,
                $BASE_REF_NAME: pullRequest.baseRefName,
                $HEAD_REF_NAME: pullRequest.headRefName,
            })
        ).join('\n')

    const changeLog = []

    if (uncategorizedPullRequests.length) {
        changeLog.push(pullRequestToString(uncategorizedPullRequests))
        changeLog.push('\n\n')
    }

    categorizedPullRequests.map((category, index) => {
        if (category.pullRequests.length) {
            changeLog.push(
                template(config['category-template'], { $TITLE: category.title })
            )
            changeLog.push('\n\n')

            changeLog.push(pullRequestToString(category.pullRequests))

            if (index + 1 !== categorizedPullRequests.length) changeLog.push('\n\n')
        }
    })

    return changeLog.join('').trim()
}

module.exports.generateChangeLog = generateChangeLog

const contributorsSentence = ({ commits, pullRequests, config }) => {
    const excludeContributors = []

    const contributors = new Set()

    commits.forEach((commit) => {
        if (commit.author.user) {
            if (!excludeContributors.includes(commit.author.user.login)) {
                contributors.add(`@${commit.author.user.login}`)
            }
        } else {
            contributors.add(commit.author.name)
        }
    })

    pullRequests.forEach((pullRequest) => {
        if (
            pullRequest.author &&
            !excludeContributors.includes(pullRequest.author.login)
        ) {
            contributors.add(`@${pullRequest.author.login}`)
        }
    })

    const sortedContributors = Array.from(contributors).sort()
    if (sortedContributors.length > 1) {
        return (
            sortedContributors.slice(0, sortedContributors.length - 1).join(', ') +
            ' and ' +
            sortedContributors.slice(-1)
        )
    } else if (sortedContributors.length === 1) {
        return sortedContributors[0]
    } else {
        return 'No contributors'
    }
}

module.exports.generateBody = ({
    config,
    lastRelease,
    mergedPullRequests,
}) => {
    let body = config.template
    body = template(
        body,
        {
            $PREVIOUS_TAG: lastRelease ? lastRelease.tag_name : '',
            $CHANGES: generateChangeLog(mergedPullRequests, config),
            $CONTRIBUTORS: contributorsSentence({
                commits,
                pullRequests: mergedPullRequests,
                config,
            }),
        },
        []
    )
    return body
}