var _ = require('lodash')

module.exports = {
  create: createPathRewriter
}

/**
 * Create rewrite function, to cache parsed rewrite rules.
 *
 * @param {Object} rewriteConfig
 * @return {Function} Function to rewrite paths; This function should accept `path` (request.url) as parameter
 */
function createPathRewriter (rewriteConfig) {
  var rulesCache
  if (!isValidRewriteConfig(rewriteConfig)) {
    return
  }

  if (_.isFunction(rewriteConfig)) {
    var customRewriteFn = rewriteConfig
    return customRewriteFn
  } else {
    rulesCache = parsePathRewriteRules(rewriteConfig)
    return rewritePath
  }

  function rewritePath (path) {
    var result = path

    _.forEach(rulesCache, function (rule) {
      if (rule.regex.test(path)) {
        result = result.replace(rule.regex, rule.value)
        return false
      }
    })

    return result
  }
}

function isValidRewriteConfig (rewriteConfig) {
  if (_.isFunction(rewriteConfig)) {
    return true
  } else if (!_.isEmpty(rewriteConfig) && _.isPlainObject(rewriteConfig)) {
    return true
  } else if (_.isUndefined(rewriteConfig) ||
               _.isNull(rewriteConfig) ||
               _.isEqual(rewriteConfig, {})) {
    return false
  } else {
    throw new Error("path rewrite error");
  }
}

function parsePathRewriteRules (rewriteConfig) {
  var rules = []

  if (_.isPlainObject(rewriteConfig)) {
    _.forIn(rewriteConfig, function (value, key) {
      rules.push({
        regex: new RegExp(key),
        value: rewriteConfig[key]
      })
    })
  }

  return rules
}


