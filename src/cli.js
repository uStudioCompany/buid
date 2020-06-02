#!/usr/bin/env node

import * as yargs from 'yargs';
import buid, { defaults } from './buid';

const {
  argv: { f: file, p: path, s: skip, l: segmentLength, v: verbose, w: write }
} = yargs
  .options({
    f: {
      alias: 'file',
      demandOption: true,
      type: 'string',
      describe: 'Path to the JSON file with data'
    },
    p: {
      alias: 'path',
      type: 'array',
      describe: 'Chain of keys corresponding to the arrays in objects',
      default: defaults.path
    },
    s: {
      alias: 'skip',
      type: 'array',
      describe: 'Keys to skip while getting array in an object',
      default: defaults.skip
    },
    l: {
      alias: 'segmentLength',
      type: 'number',
      default: defaults.segmentLength,
      describe: 'Length of corresponding id segment'
    },
    v: {
      alias: 'verbose',
      type: 'boolean',
      describe: 'Enable verbose logging',
      default: defaults.verbose
    },
    w: {
      alias: 'write',
      type: 'string',
      describe: 'Fix and return to a json file/object'
    }
  })
  .config();

buid({
  file,
  path,
  skip,
  segmentLength,
  verbose,
  write
});
