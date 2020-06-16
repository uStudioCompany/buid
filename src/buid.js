import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import { Util, Logger, Generator } from './services';

export const defaults = {
  chain: [
    'criteria',
    'requirementGroups',
    'requirements',
    'optionDetails',
    'optionGroups',
    'options'
  ],
  fix: false,
  skip: ['optionDetails'],
  segmentLength: 2,
  verbose: false
};

const buid = async (options) => {
  if (!options || !('path' in options)) {
    throw new ReferenceError(
      'You must specify a path to the file or an object to be validated.'
    );
  }

  const {
    path,
    chain = defaults.chain,
    fix = defaults.fix,
    skip = defaults.skip,
    segmentLength = defaults.segmentLength,
    verbose = defaults.verbose,
    cli = false
  } = options;

  const { inArray, isObject, isArray, pastZero } = new Util();
  const { verboseLog, systemLog } = new Logger(verbose);

  const pathMap = chain.reduce((map, currentPath, currentPathIndex) => {
    return Object.assign(map, {
      [currentPath]: inArray(skip, currentPath)
        ? chain[currentPathIndex + 1]
        : currentPath
    });
  }, {});

  const nonSkippablePaths = Array.from(new Set(Object.values(pathMap)));
  const idLength = nonSkippablePaths.length * segmentLength;

  const content =
    typeof path === 'object' ? path : JSON.parse(readFileSync(path).toString());

  const errors = [];

  systemLog(`\nReading ${path}.\n`);

  const getNextPath = (chainSegment) => {
    return chain?.[chain.indexOf(chainSegment) + 1] || null;
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

      const { insertIndexAt, modifyId, normalizeIndex } = new Generator({
        depth,
        segmentLength
      });

      // Validating ids
      if (currentPath !== chain[0] && 'id' in node && node.id.length) {
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
          fixedId = insertIndexAt({
            start: node.id,
            end: node.id,
            index
          });

          errors.push(`Element id ${node.id} contains excess symbols.`);
        }

        // Validating parent id inheritance
        if ('id' in parent) {
          if (node.id.slice(0, depth) !== parent.id.slice(0, depth)) {
            fixedId = insertIndexAt({
              start: parent.id,
              end: node.id,
              index
            });

            errors.push(
              `Element id ${node.id} should correctly inherit parent id ${parent.id}.`
            );
          }
        }
      }

      // Creating an id
      if (!('id' in node) || !node.id.length) {
        if (parent && 'id' in parent && prevPath !== chain[0]) {
          fixedId = modifyId(parent.id, depth, () => index);
        } else {
          fixedId = modifyId('0'.repeat(idLength), 0, () => index);
        }

        if (fix) {
          systemLog(`Generated an id for element ${fixedId}.`);
        } else {
          errors.push(
            `Encountered missing or empty id at ${currentPath}${
              parent?.id ? ` ${parent.id}` : ''
            }.`
          );
        }
      }

      if (node?.id && node.id.length && fixedId !== node.id && fix) {
        systemLog(`Fixed element id ${node.id} -> ${fixedId}.`);
      }

      const newNode = { ...node, id: fixedId };

      // Finish
      if (!currentPath) {
        return newNode;
      }

      // Skipping current chain
      if (inArray(skip, currentPath)) {
        // Current chain may be optional in the current node
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

      // Iterate over children of the current chain
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

    console.log('\n');
  };

  systemLog(`Starting validation process...\n`);

  const validatedContent = await validate({
    node: content,
    currentPath: chain[0]
  });

  if (fix) {
    if (cli) {
      const fixedPath = `fixed${path.slice(path.lastIndexOf('.'))}`;

      writeFileSync(
        resolve(__dirname, fixedPath),
        JSON.stringify(validatedContent, null, 2)
      );

      systemLog(`\nWrote fixed result to a file ${__dirname}/${fixedPath}.`);
    }

    systemLog(`\nFinished validation process.`);

    return validatedContent;
  }

  if (errors.length) {
    throw new SyntaxError(JSON.stringify(errors, null, 2));
  } else {
    systemLog(`No errors found.\n`);
  }

  systemLog(`\nFinished validation process.`);
};

export default buid;
