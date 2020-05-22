#!/usr/bin/env node

import { readFileSync } from 'fs';
import * as yargs from 'yargs';

import { UtilService, LoggerService } from './services';

const bid = (options = {}) => {
  const {
    argv: { f, p, s, l, v }
  } = yargs.options({
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
      default: [
        'criteria',
        'requirementGroups',
        'requirements',
        'optionDetails',
        'optionGroups',
        'options'
      ]
    },
    s: {
      alias: 'skip',
      type: 'array',
      describe: 'Keys to skip while getting array in an object',
      default: ['optionDetails']
    },
    l: {
      alias: 'segmentLength',
      type: 'number',
      default: 2,
      describe: 'Length of corresponding id segment'
    },
    v: {
      alias: 'verbose',
      type: 'boolean',
      describe: 'Enable verboseLog logging',
      default: false
    }
  });

  const {
    file = f,
    path = p,
    skip = s,
    segmentLength = l,
    verbose = v
  } = options;

  const { inArray, isObject, isArray } = new UtilService();
  const { verboseLog, systemLog, errorLog } = new LoggerService(verbose);

  const pathMap = path.reduce((map, currentPath, currentPathIndex) => {
    return Object.assign(map, {
      [currentPath]: inArray(skip, currentPath)
        ? path[currentPathIndex + 1]
        : currentPath
    });
  }, {});

  const nonSkippablePaths = Array.from(new Set(Object.values(pathMap)));
  const idLength = nonSkippablePaths.length * segmentLength;

  const content =
    typeof file === 'object' ? file : JSON.parse(readFileSync(file).toString());

  systemLog(`\nReading ${file}.\n`);

  const getNextPath = (pathSegment) => {
    return path?.[path.indexOf(pathSegment) + 1] || null;
  };

  const validate = ({ node, prevPath = null, currentPath, index, parent }) => {
    const nextPath = getNextPath(currentPath);

    if (isArray(node)) {
      return node.forEach((element, elementIndex) => {
        validate({
          node: element,
          prevPath: currentPath,
          currentPath: nextPath,
          index: elementIndex + 1,
          parent
        });
      });
    }

    if (isObject(node)) {
      // Skipping current path
      if (inArray(skip, currentPath)) {
        // Current path may be optional in the current node
        if (currentPath in node) {
          verboseLog(`Skipping ${currentPath}.\n`);

          if (isArray(node[currentPath])) {
            return node[currentPath].forEach((element) => {
              validate({
                node: element[currentPath][nextPath],
                prevPath,
                currentPath: nextPath,
                parent: node
              });
            });
          }

          return validate({
            node: node[currentPath][nextPath],
            prevPath,
            currentPath: nextPath,
            parent: node
          });
        }
      }

      // Validating ids
      if (currentPath !== path[0] && 'id' in node) {
        verboseLog(`Validating element ${node.id} identificator.`);

        if (node.id.length !== idLength) {
          errorLog(`Element id ${node.id} should be of length ${idLength}.`);
        }

        const depth =
          nonSkippablePaths.indexOf(pathMap[currentPath || prevPath]) *
            segmentLength -
          (currentPath ? segmentLength : 0);
        const nodeId = node.id.slice(depth, depth + segmentLength);

        // Validating current node's id
        if (+nodeId !== index) {
          errorLog(
            `Element id ${node.id} at position [${
              depth / segmentLength + 1
            }, ${nodeId}] should be equal to ${
              index < 10 ? `0${index}` : index
            }.`
          );
        }

        // Validating node's id with parent's id
        if ('id' in parent) {
          verboseLog(
            `Validating ${node.id} parent's ${parent.id} identificator.`
          );

          const nodeIdSegment = node.id.slice(0, depth);
          const parentIdSegment = parent.id.slice(0, depth);

          if (nodeIdSegment !== parentIdSegment) {
            errorLog(
              `Element id ${node.id} should correctly inherit parent id ${parent.id}.`
            );
          }

          verboseLog('\n');
        }
      }

      // Finish
      if (!currentPath) {
        return;
      }

      // Iterate over children of the current path
      if (isArray(node[currentPath])) {
        return node[currentPath].forEach((element, elementIndex) => {
          validate({
            node: element,
            prevPath: currentPath,
            currentPath: nextPath,
            index: elementIndex + 1,
            parent: node
          });
        });
      }
    }
  };

  systemLog(`Starting validation process...`);

  validate({
    node: content,
    currentPath: path[0]
  });

  systemLog(`\nFinished validation process.`);
};

bid();

export default bid;
