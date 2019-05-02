# js-yaml-type-include

Use it like this:

```js
import { createType } from 'js-yaml-type-include'

const type = createType({
  relativeTo: './path', // is optional and defaults to the current directory
})
const schema = new yaml.Schema({
  include: [yaml.DEFAULT_SAFE_SCHEMA],
  explicit: [type],
})
const parsed = yaml.load(
  `
includedFile: !!data "file.txt"
`,
  { schema }
)
```
