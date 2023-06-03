import moment from 'moment';
import { auth } from '@/api/auth.api';
import { category } from '@/api/category.api';
import { useSingleton } from '@/composables/utils';

class Api {
  public auth = decorateApi(auth);
  public category = decorateApi(category);
}

export const useApi = useSingleton(new Api());

/*
 * Decorates all functions of the given object to convert all createdAt
 * and updatedAt properties of the returned object to moment objects.
 *
 * This helps to avoid the repetitive call of convertDates() in every API function.
 */
function decorateApi<T>(obj: T): T {
  for (const key in obj) {
    (obj as any)[key] = decorate((obj as any)[key]);
  }

  return obj;
}

/*
 * Transforms a provided function to return an output where 'createdAt'
 * and 'updatedAt' properties are converted into moment.js objects.
 */
function decorate(func: () => any): () => any {
  return async function (...args) {
    // @ts-ignore
    const result = await func.apply(this, args);
    return convertDates(result);
  };
}

/*
 * Converts all createdAt and updatedAt properties to moment objects.
 */
function convertDates(obj: any): any {
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
