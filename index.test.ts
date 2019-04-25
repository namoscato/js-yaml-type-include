import fs from 'fs'
import yaml from 'js-yaml'
import createType from './index'

const fixture = fs.readFileSync('./fixtures/include.txt', 'utf8')

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
  expect(content.includedFile).toEqual(fixture)
  expect(content).toMatchSnapshot('load')
  expect(yaml.dump(content)).toMatchSnapshot('dump')
})

test('includes content of existing file with custom path', () => {
  const type = createType({ relativeTo: './fixtures' })
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
  expect(content.includedFile).toEqual(fixture)
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
