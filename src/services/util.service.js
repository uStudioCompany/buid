export function Util() {
  const isArray = (element) => Array.isArray(element);

  const isObject = (element) => {
    return typeof element === 'object' && element !== null && !isArray(element);
  };

  const inArray = (array, element) => isArray(array) && array.includes(element);

  const pastZero = (number) => (number < 0 ? 0 : number);

  return {
    isArray,
    inArray,
    isObject,
    pastZero
  };
}
