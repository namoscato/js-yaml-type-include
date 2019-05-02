import fs from 'fs'
import yaml from 'js-yaml'
import { createIncludeType, constructors } from './index'

const textFixture = fs.readFileSync('fixtures/include.txt', 'utf8')

describe('createType', () => {
  test('includes content of existing file', () => {
    const type = createIncludeType()
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
    const type = createIncludeType({
      extensions: [
        {
          pattern: /\.png$/,
          construct: constructors.createDataURI,
        },
      ],
      createNestedSchema: nestedType =>
        new yaml.Schema({
          include: [yaml.DEFAULT_SAFE_SCHEMA],
          explicit: [nestedType],
        }),
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
    const type = createIncludeType({ relativeTo: 'fixtures/' })
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
    const type = createIncludeType()
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
