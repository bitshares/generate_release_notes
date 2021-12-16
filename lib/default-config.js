const { SORT_BY, SORT_DIRECTIONS } = require('./sort-pull-requests')

const DEFAULT_CONFIG = Object.freeze({
    'template': ' $CHANGES ',
    'change-template': `* $TITLE (#$NUMBER) @$AUTHOR`,
    'category-template': `## $TITLE`,
    categories: [],
    'sort-by': SORT_BY.mergedAt,
    'sort-direction': SORT_DIRECTIONS.descending,
    'filter-by-commitish': false,
    'no-changes-template': `* No changes`,
})

module.exports.DEFAULT_CONFIG = DEFAULT_CONFIG