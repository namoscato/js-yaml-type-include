import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export interface Options {
  relativeTo?: string
}

export default function createType({
  relativeTo = process.cwd(),
}: Options = {}) {
  return new yaml.Type('tag:yaml.org,2002:include', {
    kind: 'scalar',
    resolve: (includePath: string) => {
      return fs.existsSync(path.resolve(relativeTo, includePath))
    },
    construct: (includePath: string) => {
      return fs.readFileSync(path.resolve(relativeTo, includePath), 'utf8')
    },
  })
}
