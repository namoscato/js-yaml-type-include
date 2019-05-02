import { existsSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import yaml from 'js-yaml'
import { sync as createDataURI } from 'datauri'

export interface IncludeType extends yaml.Type {
  relativeTo: (path: string) => IncludeType
}

type Constructor = (path: string) => any

type Extension = {
  pattern: RegExp
  construct: Constructor
}
type Extensions = Extension[]

export interface Options {
  name?: string
  relativeTo?: string
  extensions?: Extensions
}

export const constructors = {
  readFile: (path: string) => readFileSync(path, 'utf8'),
  createDataURI: createDataURI,
}

export function createIncludeType({
  name = 'tag:yaml.org,2002:include',
  relativeTo = process.cwd(),
  extensions = [],
}: Options = {}): IncludeType {
  const type = new yaml.Type(name, {
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

  // Make type extensible
  const includeType: IncludeType = Object.assign({}, type, {
    relativeTo: (path: string) => {
      return createIncludeType({
        name,
        relativeTo: dirname(path),
        extensions,
      })
    },
  })

  return includeType
}
