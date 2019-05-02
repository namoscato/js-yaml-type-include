import fs from 'fs'
import yaml from 'js-yaml'
import { createType } from './index'

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
  test('includes content of existing file with custom extension', () => {
    const type = createType({
      extensions: [
        {
          pattern: /(.yml)$/,
          construct: path => {
            const content = fs.readFileSync(path, 'utf8')
            return yaml.load(content)
          },
        },
      ],
    })
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    const content = yaml.load(
      `
includedFile: !!include "fixtures/include.yml"
  `,
      { schema }
    )

    expect(content).not.toBeNull()
    expect(content.includedFile).not.toBeNull()
    expect(content.includedFile).toMatchObject(yaml.load(yamlFixture))
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
