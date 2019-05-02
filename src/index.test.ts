import fs from 'fs'
import yaml from 'js-yaml'
import { createType, constructors } from './index'

const textFixture = fs.readFileSync('fixtures/include.txt', 'utf8')
const yamlFixture = fs.readFileSync('fixtures/include.yml', 'utf8')

describe('createType', () => {
  test('includes content of existing file', () => {
    const type = createType()
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    const content = yaml.load(
      `
includedFile: !!include "fixtures/include.txt"
  `,
      { schema }
    )

    expect(content).not.toBeNull()
    expect(content.includedFile).not.toBeNull()
    expect(content.includedFile).toEqual(textFixture)
    expect(content).toMatchSnapshot('load')
    expect(yaml.dump(content)).toMatchSnapshot('dump')
  })
  test('includes content of existing file with custom extensions', () => {
    const type = createType({
      extensions: [
        {
          pattern: /\.yml$/,
          construct: path => {
            const innerSchema = new yaml.Schema({
              include: [yaml.DEFAULT_SAFE_SCHEMA],
              explicit: [type.relativeTo(path)],
            })

            return yaml.load(constructors.readFile(path), {
              schema: innerSchema,
            })
          },
        },
        {
          pattern: /\.png$/,
          construct: constructors.createDataURI,
        },
      ],
    })
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    const content = yaml.load(
      `
includedYAML: !!include "fixtures/include.yml"
includedPNG: !!include "fixtures/include.png"
  `,
      { schema }
    )

    expect(content).not.toBeNull()
    expect(content.includedYAML).not.toBeNull()
    expect(content.includedYAML.deepInclude.deep).toEqual(true)
    expect(content.includedPNG).not.toBeNull()
    expect(content).toMatchSnapshot('load')
    expect(yaml.dump(content)).toMatchSnapshot('dump')
  })

  test('includes content of existing file with custom path', () => {
    const type = createType({ relativeTo: 'fixtures/' })
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    const content = yaml.load(
      `
includedFile: !!include "include.txt"
  `,
      { schema }
    )

    expect(content).not.toBeNull()
    expect(content.includedFile).not.toBeNull()
    expect(content.includedFile).toEqual(textFixture)
    expect(content).toMatchSnapshot('load')
    expect(yaml.dump(content)).toMatchSnapshot('dump')
  })

  test('throw error for non-existing file', () => {
    const type = createType()
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })

    expect(() => {
      yaml.load(
        `
includedFile: !!include "fixtures/nonExistant.txt"
  `,
        { schema }
      )
    }).toThrowErrorMatchingSnapshot()
  })
})
