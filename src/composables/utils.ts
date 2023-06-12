import moment from 'moment';

export function useSingleton<T>(obj: T): () => T {
  return () => obj;
}

/*
 * Converts all createdAt and updatedAt properties to moment objects.
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
