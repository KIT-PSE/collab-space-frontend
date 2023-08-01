import { useSingleton } from '@/composables/utils';

function toFullPath(path: string) {
  return `${import.meta.env.VITE_BACKEND_URL}${
    import.meta.env.VITE_API_PATH
  }${path}`;
}

export class HttpError extends Error {
  constructor(public readonly response: Response) {
    const prefix = response.status ? response.status + ' ' : '';
    super(prefix + response.statusText);
  }
}

export class ValidationError extends HttpError {
  constructor(
    response: Response,
    public readonly errors: Record<string, string>,
  ) {
    super(response);
  }
}

async function throwHttpError(response: Response): Promise<never> {
  if (response.status === 422) {
    const { message } = await response.json();
    throw new ValidationError(response, Object.fromEntries(message));
  }

  throw new HttpError(response);
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
      await throwHttpError(response);
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
      await throwHttpError(response);
    }

    return await response.json();
  }

  public async putRaw(
    path: string,
    body: any = {},
    headers = {},
  ): Promise<Response> {
    return await fetch(toFullPath(path), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });
  }

  public async putOrFail<T>(
    path: string,
    body: any = {},
    headers = {},
  ): Promise<T> {
    const response = await this.putRaw(path, body, headers);

    if (!response.ok) {
      await throwHttpError(response);
    }

    return await response.json();
  }

  public async delete(path: string, body: any = {}, headers = {}): Promise<void> {
    const response = await fetch(toFullPath(path), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      await throwHttpError(response);
    }
  }
}

export const useFetch = useSingleton(new Fetch());
