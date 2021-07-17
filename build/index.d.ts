import yaml from 'js-yaml'
declare type Constructor = (path: string) => any
declare type Extension = {
  pattern: RegExp
  construct: Constructor
}
declare type Extensions = Extension[]
export interface Options {
  name?: string
  relativeTo?: string
  extensions?: Extensions
  createNestedSchema?: ((type: yaml.Type) => yaml.Schema) | null
  ignoreMissingFiles?: boolean
}
export declare const constructors: {
  readFile: (path: string) => string
  createDataURI: (path: string) => string
}
export declare function createIncludeType({
  name,
  relativeTo,
  extensions,
  createNestedSchema,
  ignoreMissingFiles,
}?: Options): yaml.Type
export {}
