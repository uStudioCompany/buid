#!/usr/bin/env node

import * as yargs from 'yargs';
import buid, { defaults } from './buid';

const {
  argv: { p: path, c: chain, f: fix, s: skip, l: segmentLength, v: verbose }
} = yargs
  .options({
    p: {
      alias: 'path',
      demandOption: true,
      type: 'string',
      describe: 'Path to the JSON file with data'
    },
    c: {
      alias: 'chain',
      type: 'array',
      describe: 'Chain of keys corresponding to the arrays in objects',
      default: defaults.path
    },
    f: {
      alias: 'fix',
      type: 'string',
      describe: 'Fix and return to a json file/object'
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
    }
  })
  .config();

buid({
  path,
  chain,
  fix,
  skip,
  segmentLength,
  verbose,
  cli: true
});

process.exit(0);
