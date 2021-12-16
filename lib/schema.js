const Joi = require('@hapi/joi')
const { DEFAULT_CONFIG } = require('./default-config')
const { SORT_BY, SORT_DIRECTIONS } = require('./sort-pull-requests')

const schema = () => {
    return Joi.object().keys(
        {
            template: Joi.string().allow('').default(
                DEFAULT_CONFIG['template']
            ),

            'category-template': Joi.string()
                .allow('')
                .default(DEFAULT_CONFIG['category-template']),

            'change-template': Joi.string().default(
                DEFAULT_CONFIG['change-template']
            ),

            'no-changes-template': Joi.string().default(
                DEFAULT_CONFIG['no-changes-template']
            ),

            'sort-by': Joi.string()
                .valid(SORT_BY.mergedAt, SORT_BY.title)
                .default(DEFAULT_CONFIG['sort-by']),

            'sort-direction': Joi.string()
                .valid(SORT_DIRECTIONS.ascending, SORT_DIRECTIONS.descending)
                .default(DEFAULT_CONFIG['sort-direction']),

            'filter-by-commitish': Joi.boolean().default(
                DEFAULT_CONFIG['filter-by-commitish']
            ),

            categories: Joi.array()
                .items(
                    Joi.object()
                        .keys({
                            title: Joi.string().required(),
                            label: Joi.string(),
                            labels: Joi.array().items(Joi.string()).single().default([]),
                        })
                        .rename('label', 'labels', {
                            ignoreUndefined: true,
                            override: true,
                        })
                )
                .default([]),
        }
    )
}

const validateSchema = (repoConfig) => {
    const { error, value: config } = schema().validate(repoConfig, {
        abortEarly: false,
        allowUnknown: true,
    })
    if (error) throw error
    return config
}

module.exports.validateSchema = validateSchema