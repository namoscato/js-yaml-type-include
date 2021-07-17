'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var fs_1 = __importDefault(require('fs'))
var js_yaml_1 = __importDefault(require('js-yaml'))
var index_1 = require('./index')
var textFixture = fs_1.default.readFileSync('fixtures/include.txt', 'utf8')
describe('createType', function() {
  test('includes content of existing file', function() {
    var type = index_1.createIncludeType()
    var schema = new js_yaml_1.default.Schema({
      include: [js_yaml_1.default.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    var content = js_yaml_1.default.load(
      '\nincludedFile: !!include "fixtures/include.txt"\n  ',
      { schema: schema }
    )
    expect(content).not.toBeNull()
    expect(content.includedFile).not.toBeNull()
    expect(content.includedFile).toEqual(textFixture)
    expect(content).toMatchSnapshot('load')
    expect(js_yaml_1.default.dump(content)).toMatchSnapshot('dump')
  })
  test('includes content of existing file with custom extensions', function() {
    var type = index_1.createIncludeType({
      extensions: [
        {
          pattern: /\.png$/,
          construct: index_1.constructors.createDataURI,
        },
      ],
      createNestedSchema: function(nestedType) {
        return new js_yaml_1.default.Schema({
          include: [js_yaml_1.default.DEFAULT_SAFE_SCHEMA],
          explicit: [nestedType],
        })
      },
    })
    var schema = new js_yaml_1.default.Schema({
      include: [js_yaml_1.default.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    var content = js_yaml_1.default.load(
      '\nincludedYAML: !!include "fixtures/include.yml"\nincludedPNG: !!include "fixtures/include.png"\n  ',
      { schema: schema }
    )
    expect(content).not.toBeNull()
    expect(content.includedYAML).not.toBeNull()
    expect(content.includedYAML.deepInclude.deep).toEqual(true)
    expect(content.includedPNG).not.toBeNull()
    expect(content).toMatchSnapshot('load')
    expect(js_yaml_1.default.dump(content)).toMatchSnapshot('dump')
  })
  test('includes content of existing file with custom path', function() {
    var type = index_1.createIncludeType({ relativeTo: 'fixtures/' })
    var schema = new js_yaml_1.default.Schema({
      include: [js_yaml_1.default.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    var content = js_yaml_1.default.load(
      '\nincludedFile: !!include "include.txt"\n  ',
      { schema: schema }
    )
    expect(content).not.toBeNull()
    expect(content.includedFile).not.toBeNull()
    expect(content.includedFile).toEqual(textFixture)
    expect(content).toMatchSnapshot('load')
    expect(js_yaml_1.default.dump(content)).toMatchSnapshot('dump')
  })
  test('throw error for non-existing file', function() {
    var type = index_1.createIncludeType()
    var schema = new js_yaml_1.default.Schema({
      include: [js_yaml_1.default.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    expect(function() {
      js_yaml_1.default.load(
        '\nincludedFile: !!include "fixtures/nonExistant.txt"\n  ',
        { schema: schema }
      )
    }).toThrowErrorMatchingSnapshot()
  })
})
