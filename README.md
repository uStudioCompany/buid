# `buid`

```shell script
$ npm i -D buid
# or
$ yarn add -D buid
```

## Options

| Flag                         | Data type   | Description                                          | Default                                                                                         |
|------------------------------|-------------|------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| `-f`<br />`--file`           | `string`    | Path to the JSON file with data                      |                                                                                                 |
| `-p`<br />`--path`           | `string[]`  | Chain of keys corresponding to the arrays in objects | `['criteria', 'requirementGroups', 'requirements', 'optionDetails', 'optionGroups', 'options']` |
| `-s`<br />`--skip`           | `string[]`  | Keys to skip while getting array in an object        | `['optionDetails']`                                                                             |
| `-l`<br />`--segment-length` | `number`    | Length of corresponding id segment                   | 2                                                                                               |
| `-v`<br /> `--verbose`       | `boolean`   | Enable verbose logging                               | false                                                                                           |

## CLI usage

```shell script
$ buid -f category.json -l 2 -v -p criteria requirementGroups requirements optionDetails optionGroups options -s optionDetails
```

## Programmatic usage

```javascript
import buid from 'buid';

buid({
    file: 'category.json' // or an object itself,
    segmentLength: 2,
    verbose: true,
    path: ['criteria', 'requirementGroups', 'requirements', 'optionDetails', 'optionGroups', 'options'],
    skip: ['optionDetails'] 
});
```
