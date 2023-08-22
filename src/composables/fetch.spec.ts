import {
  Fetch,
  HttpError,
  ValidationError,
  throwHttpError,
  useFetch,
} from '@/composables/fetch';
import { vi } from 'vitest';
import { Response } from 'node-fetch';

describe('Fetch class', () => {
  let fetchInstance: ReturnType<typeof useFetch>;
  let originalFetch: typeof fetch;
  let fetchMock: vi.Mock;

  beforeAll(() => {
    originalFetch = global.fetch;
    fetchMock = vi.fn();

    // Mock the global fetch function
    global.fetch = fetchMock;
    fetchInstance = useFetch();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    fetchMock.mockReset();
  });

  describe('getRaw', () => {
    it('makes a raw GET request and returns the response', async () => {
      const fakeResponse = new Response('{"data": "example"}');
      fetchMock.mockResolvedValue(fakeResponse);

      const response = await fetchInstance.getRaw('/api/data');

      expect(fetchMock).toHaveBeenCalledWith(expect.anything(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
      });
      expect(response).toBe(fakeResponse);
    });
  });

  describe('getOrFail', () => {
    it('makes a GET request and returns the parsed JSON response', async () => {
      const fakeResponse = new Response('{"data": "example"}');
      fetchMock.mockResolvedValue(fakeResponse);

      const response = await fetchInstance.getOrFail('/api/data');

      expect(fetchMock).toHaveBeenCalledWith(expect.anything(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
      });
      expect(response).toEqual({ data: 'example' });
    });

    it('throws an error if the response status is not OK', async () => {
      const fakeResponse = new Response('{"data": "example"}', {
        status: 404,
      });
      fetchMock.mockResolvedValue(fakeResponse);

      await expect(fetchInstance.getOrFail('/api/data')).rejects.toThrow(
        HttpError,
      );
    });
  });

  describe('postRaw', () => {
    it('makes a raw POST request and returns the response', async () => {
      const fakeResponse = new Response('{"data": "example"}');
      fetchMock.mockResolvedValue(fakeResponse);

      const response = await fetchInstance.postRaw('/api/data', {
        data: 'example',
      });

      expect(fetchMock).toHaveBeenCalledWith(expect.anything(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: '{"data":"example"}',
        credentials: 'include',
      });
      expect(response).toBe(fakeResponse);
    });
  });

  describe('postOrFail', () => {
    it('makes a POST request and returns the parsed JSON response', async () => {
      const fakeResponse = new Response('{"data": "example"}');
      fetchMock.mockResolvedValue(fakeResponse);

      const response = await fetchInstance.postOrFail('/api/data', {
        data: 'example',
      });

      expect(fetchMock).toHaveBeenCalledWith(expect.anything(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: '{"data":"example"}',
        credentials: 'include',
      });
      expect(response).toEqual({ data: 'example' });
    });

    it('throws an error if the response status is not OK', async () => {
      const fakeResponse = new Response('{"data": "example"}', {
        status: 404,
      });
      fetchMock.mockResolvedValue(fakeResponse);

      await expect(
        fetchInstance.postOrFail('/api/data', {
          data: 'example',
        }),
      ).rejects.toThrow(HttpError);
    });
  });

  describe('putRaw', () => {
    it('makes a raw PUT request and returns the response', async () => {
      const fakeResponse = new Response('{"data": "example"}');
      fetchMock.mockResolvedValue(fakeResponse);

      const response = await fetchInstance.putRaw('/api/data', {
        data: 'example',
      });

      expect(fetchMock).toHaveBeenCalledWith(expect.anything(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: '{"data":"example"}',
        credentials: 'include',
      });
      expect(response).toBe(fakeResponse);
    });
  });

  describe('putOrFail', () => {
    it('makes a PUT request and returns the parsed JSON response', async () => {
      const fakeResponse = new Response('{"data": "example"}');
      fetchMock.mockResolvedValue(fakeResponse);

      const response = await fetchInstance.putOrFail('/api/data', {
        data: 'example',
      });

      expect(fetchMock).toHaveBeenCalledWith(expect.anything(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: '{"data":"example"}',
        credentials: 'include',
      });
      expect(response).toEqual({ data: 'example' });
    });

    it('throws an error if the response status is not OK', async () => {
      const fakeResponse = new Response('{"data": "example"}', {
        status: 404,
      });
      fetchMock.mockResolvedValue(fakeResponse);

      await expect(
        fetchInstance.putOrFail('/api/data', {
          data: 'example',
        }),
      ).rejects.toThrow(HttpError);
    });
  });

  describe('delete', () => {
    it('makes a DELETE request and returns the parsed JSON response', async () => {
      const fakeResponse = new Response('{"data": "example"}');
      fetchMock.mockResolvedValue(fakeResponse);

      const response = await fetchInstance.delete('/api/data');

      expect(fetchMock).toHaveBeenCalledWith(expect.anything(), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
      });
      expect(response).toEqual({ data: 'example' });
    });

    it('throws an error if the response status is not OK', async () => {
      const fakeResponse = new Response('{"data": "example"}', {
        status: 404,
      });
      fetchMock.mockResolvedValue(fakeResponse);

      await expect(fetchInstance.delete('/api/data')).rejects.toThrow(
        HttpError,
      );
    });
  });
});
