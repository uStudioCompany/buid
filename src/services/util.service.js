export function Util(segmentLength) {
  const isArray = (element) => Array.isArray(element);

  const isObject = (element) => {
    return typeof element === 'object' && element !== null && !isArray(element);
  };

  const inArray = (array, element) => isArray(array) && array.includes(element);

  const normalizeIndex = (index) => {
    return index < 10 ? `${'0'.repeat(segmentLength - 1)}${index}` : index;
  };

  const pastZero = (number) => (number < 0 ? 0 : number);

  const modifyId = (id, position, modifyCallback) => {
    const modifiedId = modifyCallback(
      +id.slice(position, position + segmentLength)
    );

    return `${id.slice(0, position)}${normalizeIndex(modifiedId)}${id.slice(
      position + segmentLength
    )}`;
  };

  return {
    isArray,
    inArray,
    isObject,
    normalizeIndex,
    pastZero,
    modifyId
  };
}
