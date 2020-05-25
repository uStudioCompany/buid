export function UtilService() {
  const isArray = (element) => Array.isArray(element);

  const isObject = (element) => {
    return typeof element === 'object' && element !== null && !isArray(element);
  };

  const inArray = (array, element) => isArray(array) && array.includes(element);

  return {
    isArray,
    inArray,
    isObject
  };
}
