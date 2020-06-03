# `buid`

```shell script
$ npm i -D buid
# or
$ yarn add -D buid
```

## Options

| Flag                         | Data type          | Description                                          | Default                                                                                         |
| ---------------------------- | ------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `-p`<br />`--path`           | `string or object` | Path to the JSON file with data or an object         |                                                                                                 |
| `-c`<br />`--chain`          | `string[]`         | Chain of keys corresponding to the arrays in objects | `['criteria', 'requirementGroups', 'requirements', 'optionDetails', 'optionGroups', 'options']` |
| `-f`<br />`--fix`            | `boolean`          | Fix and return data                                  | `false`                                                                                         |
| `-s`<br />`--skip`           | `string[]`         | Keys to skip while getting array in an object        | `['optionDetails']`                                                                             |
| `-l`<br />`--segment-length` | `number`           | Length of corresponding id segment                   | `2`                                                                                             |
| `-v`<br />`--verbose`        | `boolean`          | Enable verbose logging                               | `false`                                                                                         |
| `--config`                   | `string`           | Path to the JSON configuration file                  |                                                                                                 |

## CLI usage

```shell script
$ buid -f category.json -v
```

## Programmatic usage

```javascript
import buid from 'buid';

buid({ file: 'category.json' /* or an object itself */ });
```
