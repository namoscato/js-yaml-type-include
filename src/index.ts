import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import yaml from 'js-yaml'

type Extension = {
  pattern: RegExp
  construct: (path: string) => any
}
type Extensions = Extension[]

export interface Options {
  name?: string
  relativeTo?: string
  extensions?: Extensions
}

export function createType({
  name = 'tag:yaml.org,2002:include',
  relativeTo = process.cwd(),
  extensions = [],
}: Options = {}) {
  return new yaml.Type(name, {
    kind: 'scalar',
    resolve: (path: string) => {
      const fullPath = resolve(relativeTo, path)
      return existsSync(fullPath)
    },
    construct: (path: string) => {
      const fullPath = resolve(relativeTo, path)

      // Find extension
      const extension = extensions.find(extension => {
        return extension.pattern.test(fullPath)
      })

      return extension
        ? extension.construct(fullPath)
        : readFileSync(fullPath, 'utf8')
    },
  })
}
