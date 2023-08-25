import { useSingleton } from '@/composables/utils';

/**
 * Converts a relative API path to a full API URL.
 *
 * @param path - The relative path of the API.
 * @returns The full URL of the API.
 */
function toFullPath(path: string) {
  return `${import.meta.env.VITE_BACKEND_URL}${
    import.meta.env.VITE_API_PATH
  }${path}`;
}

/**
 * Represents an HTTP error response with status and status text information.
 */
export class HttpError extends Error {
  constructor(public readonly response: Response) {
    const prefix = response.status ? response.status + ' ' : '';
    super(prefix + response.statusText);
  }
}

/**
 * Represents a validation error response with status, status text, and error message information.
 */
export class ValidationError extends HttpError {
  constructor(
    response: Response,
    public readonly errors: Record<string, string>,
  ) {
    super(response);
  }
}

/**
 * Throws an HTTP error based on the response status.
 *
 * @param response - The HTTP response.
 * @returns A promise that rejects with the appropriate error based on the response status.
 */
async function throwHttpError(response: Response): Promise<never> {
  if (response.status === 422) {
    const { message } = await response.json();
    throw new ValidationError(response, Object.fromEntries(message));
  }

  throw new HttpError(response);
}

/**
 * A class that handles making HTTP requests using the Fetch API.
 */
class Fetch {
  /**
   * Makes a raw GET request to the specified path with optional headers.
   *
   * @param path - The API path to send the GET request to.
   * @param headers - Optional headers to include in the request.
   * @returns A promise that resolves to the HTTP response.
   */
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

  /**
   * Makes a GET request to the specified path and returns the parsed JSON response.
   *
   * @param path - The API path to send the GET request to.
   * @param headers - Optional headers to include in the request.
   * @returns A promise that resolves to the parsed JSON response.
   */
  public async getOrFail<T>(path: string, headers = {}): Promise<T> {
    const response = await this.getRaw(path, headers);

    if (!response.ok) {
      await throwHttpError(response);
    }

    return await response.json();
  }

  /**
   * Makes a raw POST request to the specified path with optional headers and request body.
   *
   * @param path - The API path to send the POST request to.
   * @param body - The request body to include in the POST request.
   * @param headers - Optional headers to include in the request.
   * @returns A promise that resolves to the HTTP response.
   */
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

  /**
   * Makes a POST request to the specified path and returns the parsed JSON response.
   *
   * @param path - The API path to send the POST request to.
   * @param body - The request body to include in the POST request.
   * @param headers - Optional headers to include in the request.
   * @returns A promise that resolves to the parsed JSON response.
   */
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

  /**
   * Makes a raw PUT request to the specified path with optional headers and body data.
   *
   * @param path - The API path to send the PUT request to.
   * @param body - Optional data to include in the request body.
   * @param headers - Optional headers to include in the request.
   * @returns A promise that resolves to the HTTP response.
   */
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

  /**
   * Makes a PUT request to the specified path with optional headers and body data,
   * and returns the parsed JSON response.
   *
   * @param path - The API path to send the PUT request to.
   * @param body - Optional data to include in the request body.
   * @param headers - Optional headers to include in the request.
   * @returns A promise that resolves to the parsed JSON response.
   * @throws HttpError if the response status is not OK.
   * @throws ValidationError if the response status is 422 (Unprocessable Entity).
   */
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

  /**
   * Makes a DELETE request to the specified path with optional headers.
   *
   * @param path - The API path to send the DELETE request to.
   * @param headers - Optional headers to include in the request.
   * @returns A promise that resolves when the request is successful.
   * @throws HttpError if the response status is not OK.
   * @throws ValidationError if the response status is 422 (Unprocessable Entity).
   */
  public async delete(path: string, headers = {}): Promise<void> {
    const response = await fetch(toFullPath(path), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      await throwHttpError(response);
    }

    return await response.json();
  }
}

/**
 * Provides a singleton instance of the Fetch class for making HTTP requests.
 * This ensures that the same instance is used across the application.
 */
export const useFetch = useSingleton(new Fetch());
