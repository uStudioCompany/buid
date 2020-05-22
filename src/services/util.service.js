export class UtilService {
  isArray = (element) => Array.isArray(element);

  isObject = (element) => {
    return (
      typeof element === 'object' && element !== null && !this.isArray(element)
    );
  };

  inArray = (array, element) => this.isArray(array) && array.includes(element);
}
