import moment from 'moment';

/**
 * Returns a function that always returns the same object.
 * This is useful for creating singletons to be used in Vue composable functions.
 *
 * @param obj - The object to be used as a singleton.
 * @returns A function that returns the provided object.
 */
export function useSingleton<T>(obj: T): () => T {
  return () => obj;
}

/**
 * Converts all 'createdAt' and 'updatedAt' properties to moment objects in the provided object.
 * This function is typically used to convert API response data to moment.js objects for easier handling.
 *
 * @param obj - The object to be converted.
 * @returns The object with 'createdAt' and 'updatedAt' properties converted to moment.js objects.
 */
export function convertDates(obj: any): any {
  if (obj instanceof Array) {
    return obj.map(convertDates);
  }

  if (obj instanceof Object) {
    for (const key in obj) {
      if (obj[key] instanceof Object || obj[key] instanceof Array) {
        obj[key] = convertDates(obj[key]);
      }

      if (key === 'createdAt' || key === 'updatedAt') {
        obj[key] = moment(obj[key]);
      }
    }
  }

  return obj;
}
