import yaml from 'js-yaml'

type Options = {
  relativeTo?: string
}

export default function createType(options: Options): yaml.Type
