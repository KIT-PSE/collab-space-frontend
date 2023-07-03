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
  private async refreshToken(): Promise<void> {
    const refreshTokenResponse = await fetch(toFullPath('/auth/refresh'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
    });

    // Check if response is ok
    if (!refreshTokenResponse.ok) {
      throw new Error('Failed to refresh token');
      // Log user out
    }
  }

  private async performRequest(
    method: string,
    path: string,
    body: any = {},
    headers = {},
    refreshed = false,
  ): Promise<Response> {
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      credentials: 'include',
    };

    if (method !== 'GET' && method !== 'HEAD') {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(toFullPath(path), requestOptions);

    if (response.status === 401 && !refreshed) {
      // Token expired, initiate token refresh
      await this.refreshToken();
      // Retry the original request
      return await this.performRequest(method, path, body, headers, true);
    }

    if (refreshed && response.status === 401) {
      // Token refresh failed
      throw new Error('Failed to refresh token');
    }

    return response;
  }

  public async getRaw(path: string, headers = {}): Promise<Response> {
    return this.performRequest('GET', path, undefined, headers);
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
    return this.performRequest('POST', path, body, headers);
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
    return this.performRequest('PUT', path, body, headers);
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

  public async delete(path: string, headers = {}): Promise<void> {
    const response = await this.performRequest(
      'DELETE',
      path,
      undefined,
      headers,
    );

    if (!response.ok) {
      await throwHttpError(response);
    }
  }
}

export const useFetch = useSingleton(new Fetch());
