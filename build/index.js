'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var fs_1 = require('fs')
var path_1 = require('path')
var js_yaml_1 = __importDefault(require('js-yaml'))
var datauri_1 = require('datauri')
exports.constructors = {
  readFile: function(path) {
    return fs_1.readFileSync(path, 'utf8')
  },
  createDataURI: function(path) {
    return datauri_1.sync(path)
  },
}
function createIncludeType(_a) {
  var _b = _a === void 0 ? {} : _a,
    _c = _b.name,
    name = _c === void 0 ? 'tag:yaml.org,2002:include' : _c,
    _d = _b.relativeTo,
    relativeTo = _d === void 0 ? process.cwd() : _d,
    _e = _b.extensions,
    extensions = _e === void 0 ? [] : _e,
    _f = _b.createNestedSchema,
    createNestedSchema = _f === void 0 ? null : _f,
    _g = _b.ignoreMissingFiles,
    ignoreMissingFiles = _g === void 0 ? false : _g
  // Allow including other YAML files if we can create a nested schema
  if (createNestedSchema) {
    extensions.push({
      pattern: /\.ya?ml$/,
      construct: function(path) {
        var nestedType = createIncludeType({
          name: name,
          relativeTo: path_1.dirname(path),
          extensions: extensions,
        })
        var nestedSchema = createNestedSchema(nestedType)
        return js_yaml_1.default.load(exports.constructors.readFile(path), {
          schema: nestedSchema,
        })
      },
    })
  }
  var type = new js_yaml_1.default.Type(name, {
    kind: 'scalar',
    resolve: function(path) {
      var fullPath = path_1.resolve(relativeTo, path)
      return ignoreMissingFiles ? true : fs_1.existsSync(fullPath)
    },
    construct: function(path) {
      var fullPath = path_1.resolve(relativeTo, path)
      var fileExists = fs_1.existsSync(fullPath)
      // Return null for missing files
      if (!fileExists && ignoreMissingFiles) {
        return null
      }
      // Find extension
      var extension = extensions.find(function(extension) {
        return extension.pattern.test(fullPath)
      })
      return extension
        ? extension.construct(fullPath)
        : fs_1.readFileSync(fullPath, 'utf8')
    },
  })
  return type
}
exports.createIncludeType = createIncludeType
