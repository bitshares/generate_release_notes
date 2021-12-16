/**
 * replaces all uppercase dollar templates with their string representation from obj
 * if replacement is undefined in obj the dollar template string is left untouched
 */

const template = (string, obj, customReplacers) => {
    let str = string.replace(/(\$[A-Z_]+)/g, (_, k) => {
        let result
        if (obj[k] === undefined || obj[k] === null) {
            result = k
        } else if (typeof obj[k] === 'object') {
            result = template(obj[k].template, obj[k])
        } else {
            result = `${obj[k]}`
        }
        return result
    })
    if (customReplacers) {
        customReplacers.forEach(({ search, replace }) => {
            str = str.replace(search, replace)
        })
    }
    return str
}

module.exports.template = template