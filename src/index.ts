import { existsSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import yaml from 'js-yaml'
import { sync as createDataURI } from 'datauri'

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
  createNestedSchema?: ((type: yaml.Type) => yaml.Schema) | null
  ignoreMissingFiles?: boolean
}

export const constructors = {
  readFile: (path: string) => readFileSync(path, 'utf8'),
  createDataURI: (path: string): string => createDataURI(path),
}

export function createIncludeType({
  name = 'tag:yaml.org,2002:include',
  relativeTo = process.cwd(),
  extensions = [],
  createNestedSchema = null,
  ignoreMissingFiles = false,
}: Options = {}) {
  // Allow including other YAML files if we can create a nested schema
  if (createNestedSchema) {
    extensions.push({
      pattern: /\.ya?ml$/,
      construct: path => {
        const nestedType = createIncludeType({
          name,
          relativeTo: dirname(path),
          extensions,
        })
        const nestedSchema = createNestedSchema(nestedType)

        return yaml.load(constructors.readFile(path), {
          schema: nestedSchema,
        })
      },
    })
  }

  const type = new yaml.Type(name, {
    kind: 'scalar',
    resolve: (path: string) => {
      const fullPath = resolve(relativeTo, path)
      return ignoreMissingFiles ? true : existsSync(fullPath)
    },
    construct: (path: string) => {
      const fullPath = resolve(relativeTo, path)
      const fileExists = existsSync(fullPath)

      // Return null for missing files
      if (!fileExists && ignoreMissingFiles) {
        return null
      }

      // Find extension
      const extension = extensions.find(extension => {
        return extension.pattern.test(fullPath)
      })

      return extension
        ? extension.construct(fullPath)
        : readFileSync(fullPath, 'utf8')
    },
  })

  return type
}
