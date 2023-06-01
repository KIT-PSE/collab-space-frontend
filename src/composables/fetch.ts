import { useSingleton } from '@/composables/utils';

function toFullPath(path: string) {
  return `${import.meta.env.VITE_BACKEND_URL}${path}`;
}

export class HttpError extends Error {
  constructor(public readonly response: Response) {
    const prefix = response.status ? response.status + ' ' : '';
    super(prefix + response.statusText);
  }
}

class Fetch {
  public async getRaw(path: string, headers = {}): Promise<Response> {
    return await fetch(toFullPath(path), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      credentials: 'include',
    });
  }

  public async getOrFail<T>(path: string, headers = {}): Promise<T> {
    const response = await this.getRaw(path, headers);

    if (!response.ok) {
      throw new HttpError(response);
    }

    return await response.json();
  }

  public async postRaw(
    path: string,
    body: any = {},
    headers = {},
  ): Promise<Response> {
    return await fetch(toFullPath(path), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });
  }

  public async postOrFail<T>(
    path: string,
    body: any = {},
    headers = {},
  ): Promise<T> {
    const response = await this.postRaw(path, body, headers);

    if (!response.ok) {
      throw new HttpError(response);
    }

    return await response.json();
  }
}

export const useFetch = useSingleton(new Fetch());
