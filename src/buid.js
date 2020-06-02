import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import { Util, Logger } from './services';

export const defaults = {
  path: [
    'criteria',
    'requirementGroups',
    'requirements',
    'optionDetails',
    'optionGroups',
    'options'
  ],
  skip: ['optionDetails'],
  segmentLength: 2,
  verbose: false
};

const buid = async (options) => {
  if (!options || !('file' in options)) {
    throw new ReferenceError(
      'You must specify a path to the file or an object to be validated.'
    );
  }

  const {
    file,
    path = defaults.path,
    skip = defaults.skip,
    segmentLength = defaults.segmentLength,
    verbose = defaults.verbose,
    write
  } = options;

  const {
    inArray,
    isObject,
    isArray,
    normalizeIndex,
    pastZero,
    modifyId
  } = new Util(segmentLength);
  const { verboseLog, systemLog, errorLog } = new Logger(verbose);

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

  const errors = [];

  systemLog(`\nReading ${file}.\n`);

  const getNextPath = (pathSegment) => {
    return path?.[path.indexOf(pathSegment) + 1] || null;
  };

  const validate = async ({
    node,
    prevPath = null,
    currentPath,
    index,
    parent
  }) => {
    const nextPath = getNextPath(currentPath);

    if (isArray(node)) {
      return Promise.all(
        node.map((element, elementIndex) => {
          return validate({
            node: element,
            prevPath: currentPath,
            currentPath: nextPath,
            index: elementIndex + 1,
            parent
          });
        })
      );
    }

    if (isObject(node)) {
      const depth = pastZero(
        nonSkippablePaths.indexOf(pathMap[currentPath || prevPath]) *
          segmentLength -
          (currentPath ? segmentLength : 0)
      );
      let fixedId = node.id;

      // Validating ids
      if (currentPath !== path[0] && 'id' in node) {
        verboseLog(`Validating element ${node.id} identificator.`);

        // Validating id length
        if (node.id.length !== idLength) {
          fixedId = modifyId(node.id, depth, () => index);

          errors.push(`Element id ${node.id} should be of length ${idLength}.`);
        }

        const nodeId = node.id.slice(depth, depth + segmentLength);

        // Validating correct index
        if (+nodeId !== index) {
          fixedId = modifyId(node.id, depth, () => index);

          errors.push(
            `Element id ${node.id} at position [${
              depth / segmentLength + 1
            }, ${nodeId}] should be equal to ${normalizeIndex(index)}.`
          );
        }

        const rest = node.id.slice(depth + segmentLength);

        // Validating absence of excess symbols
        if (rest.split('').some((symbol) => symbol !== '0')) {
          fixedId = `${node.id.slice(0, depth)}${normalizeIndex(
            index
          )}${'0'.repeat(node.id.slice(depth + segmentLength).length)}`;

          errors.push(`Element id ${node.id} contains excess symbols.`);
        }

        // Validating parent id inheritance
        if ('id' in parent) {
          const nodeIdSegment = node.id.slice(0, depth);
          const parentIdSegment = parent.id.slice(0, depth);

          if (nodeIdSegment !== parentIdSegment) {
            fixedId = `${parent.id.slice(0, depth)}${normalizeIndex(
              index
            )}${'0'.repeat(node.id.slice(depth + segmentLength).length)}`;

            errors.push(
              `Element id ${node.id} should correctly inherit parent id ${parent.id}.`
            );
          }
        }
      }

      if (fixedId !== node.id && write) {
        systemLog(`Fixed element id ${node.id} -> ${fixedId}.`);
      }

      const newNode = { ...node, id: fixedId };

      // Finish
      if (!currentPath) {
        return newNode;
      }

      // Skipping current path
      if (inArray(skip, currentPath)) {
        // Current path may be optional in the current node
        if (currentPath in node) {
          verboseLog(`Skipping ${currentPath}.\n`);

          if (isArray(node[currentPath])) {
            return {
              ...newNode,
              [currentPath]: await Promise.all(
                node[currentPath].map((element) => {
                  return validate({
                    node: element[currentPath][nextPath],
                    prevPath,
                    currentPath: nextPath,
                    parent: newNode
                  });
                })
              )
            };
          }

          return {
            ...newNode,
            [currentPath]: {
              ...node[currentPath],
              [nextPath]: await validate({
                node: node[currentPath][nextPath],
                prevPath,
                currentPath: nextPath,
                parent: newNode
              })
            }
          };
        }

        return newNode;
      }

      // Iterate over children of the current path
      if (isArray(node[currentPath])) {
        return {
          ...newNode,
          [currentPath]: await Promise.all(
            node[currentPath].map((element, elementIndex) => {
              return validate({
                node: element,
                prevPath: currentPath,
                currentPath: nextPath,
                index: elementIndex + 1,
                parent: newNode
              });
            })
          )
        };
      }
    }
  };

  systemLog(`Starting validation process...\n`);

  try {
    const validatedContent = await validate({
      node: content,
      currentPath: path[0]
    });

    if (errors.length) {
      errors.forEach((error) => errorLog(error));
    }

    if (write !== undefined) {
      if (write.length) {
        writeFileSync(
          resolve(__dirname, write),
          JSON.stringify(validatedContent, null, 2)
        );

        systemLog(`\nWrote fixed result to a file ${__dirname}/${write}.`);
      }

      return validatedContent;
    }

    systemLog(`\nFinished validation process.`);

    process.exit(0);
  } catch ({ message }) {
    errorLog(message);

    process.exit(1);
  }
};

export default buid;
