const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

module.exports = function createType({ relativeTo = process.cwd() } = {}) {
  return new yaml.Type('tag:yaml.org,2002:include', {
    kind: 'scalar',
    resolve: includePath => {
      return fs.existsSync(path.resolve(relativeTo, includePath))
    },
    construct: includePath => {
      return fs.readFileSync(path.resolve(relativeTo, includePath), 'utf8')
    },
  })
}
