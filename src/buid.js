import { readFileSync } from 'fs';

import { UtilService, LoggerService } from './services';

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

const buid = (options) => {
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
    verbose = defaults.verbose
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

  const errors = [];

  systemLog(`\nReading ${file}.\n`);

  const getNextPath = (pathSegment) => {
    return path?.[path.indexOf(pathSegment) + 1] || null;
  };

  const validate = ({ node, prevPath = null, currentPath, index, parent }) => {
    return new Promise((resolve) => {
      const nextPath = getNextPath(currentPath);

      if (isArray(node)) {
        resolve(
          node.forEach((element, elementIndex) => {
            validate({
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
        // Skipping current path
        if (inArray(skip, currentPath)) {
          // Current path may be optional in the current node
          if (currentPath in node) {
            verboseLog(`Skipping ${currentPath}.\n`);

            if (isArray(node[currentPath])) {
              resolve(
                node[currentPath].forEach((element) => {
                  validate({
                    node: element[currentPath][nextPath],
                    prevPath,
                    currentPath: nextPath,
                    parent: node
                  });
                })
              );
            }

            resolve(
              validate({
                node: node[currentPath][nextPath],
                prevPath,
                currentPath: nextPath,
                parent: node
              })
            );
          }
        }

        // Validating ids
        if (currentPath !== path[0] && 'id' in node) {
          verboseLog(`Validating element ${node.id} identificator.`);

          if (node.id.length !== idLength) {
            errors.push(
              `Element id ${node.id} should be of length ${idLength}.`
            );
          }

          const depth =
            nonSkippablePaths.indexOf(pathMap[currentPath || prevPath]) *
              segmentLength -
            (currentPath ? segmentLength : 0);
          const nodeId = node.id.slice(depth, depth + segmentLength);

          // Validating current node's id
          if (+nodeId !== index) {
            errors.push(
              `Element id ${node.id} at position [${
                depth / segmentLength + 1
              }, ${nodeId}] should be equal to ${
                index < 10 ? `0${index}` : index
              }.`
            );
          }

          const rest = node.id.slice(depth + segmentLength);

          // Validating absence of excess symbols
          if (rest.split('').some((symbol) => symbol !== '0')) {
            errors.push(`Element id ${node.id} contains excess symbols.`);
          }

          // Validating node's id with parent's id
          if ('id' in parent) {
            verboseLog(
              `Validating ${node.id} parent's ${parent.id} identificator.`
            );

            const nodeIdSegment = node.id.slice(0, depth);
            const parentIdSegment = parent.id.slice(0, depth);

            if (nodeIdSegment !== parentIdSegment) {
              errors.push(
                `Element id ${node.id} should correctly inherit parent id ${parent.id}.`
              );
            }

            verboseLog('\n');
          }
        }

        // Finish
        if (!currentPath) {
          resolve();
        }

        // Iterate over children of the current path
        if (isArray(node[currentPath])) {
          resolve(
            node[currentPath].forEach((element, elementIndex) => {
              validate({
                node: element,
                prevPath: currentPath,
                currentPath: nextPath,
                index: elementIndex + 1,
                parent: node
              });
            })
          );
        }
      }
    }).catch(({ message }) => errorLog(message));
  };

  systemLog(`Starting validation process...\n`);

  validate({
    node: content,
    currentPath: path[0]
  })
    .then(() => {
      if (errors.length) {
        errors.forEach((error) => errorLog(error));
      }

      systemLog(`\nFinished validation process.`);

      process.exit(0);
    })
    .catch(({ message }) => {
      errorLog(message);

      process.exit(1);
    });
};

export default buid;
