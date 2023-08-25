import { useAuth } from '@/composables/auth';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useApi, User } from '@/composables/api';
import { createPinia, setActivePinia } from 'pinia';
import { ValidationError } from '@/composables/fetch';

describe('auth', () => {
  let auth: ReturnType<typeof useAuth>;
  let api: ReturnType<typeof useApi>;

  beforeEach(() => {
    setActivePinia(createPinia());

    auth = useAuth();
    api = useApi();
  });

  describe('login', () => {
    it('should log in a user with the provided credentials', async () => {
      vi.spyOn(api, 'login').mockResolvedValueOnce({
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        } as User,
        exp: Date.now() + 1000 * 60 * 60,
      });

      await auth.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(auth.state.user).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      });
      expect(auth.state.loggedIn).toBe(true);
      expect(auth.state.loaded).toBe(true);
    });

    it('should throw a ValidationError if the provided credentials are invalid', async () => {
      vi.spyOn(api, 'login').mockRejectedValueOnce(
        new ValidationError({} as Response, {}),
      );

      await expect(
        auth.login({
          email: 'wrong@example.com',
          password: 'password',
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('register', () => {
    it('should register a new user with the provided registration data', async () => {
      vi.spyOn(api, 'register').mockResolvedValueOnce({
        user: {
          id: 1,
          organization: 'Test Organization',
          name: 'Test User',
          email: 'newuser@example.com',
          role: 'user',
        } as User,
        exp: Date.now() + 1000 * 60 * 60,
      });

      await auth.register({
        organization: 'Test Organization',
        name: 'Test User',
        email: 'newuser@example.com',
        password: 'password',
        confirmPassword: 'password',
      });

      expect(auth.state.user).toEqual({
        id: 1,
        organization: 'Test Organization',
        name: 'Test User',
        email: 'newuser@example.com',
        role: 'user',
      });
      expect(auth.state.loggedIn).toBe(true);
    });

    it('should throw a ValidationError if the provided registration data is invalid', async () => {
      vi.spyOn(api, 'register').mockRejectedValueOnce(
        new ValidationError({} as Response, {}),
      );

      await expect(
        auth.register({
          organization: 'Test Organization',
          name: 'Test User',
          email: 'newuser@example.com',
          password: 'password',
          confirmPassword: 'password',
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('logout', () => {
    it('should log out the current user', async () => {
      vi.spyOn(api, 'logout').mockResolvedValueOnce();

      auth.state.user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      } as User;
      auth.state.loggedIn = true;
      auth.state.loaded = true;

      await auth.logout();

      expect(auth.state.user).toBe(null);
      expect(auth.state.loggedIn).toBe(false);
    });
  });

  describe('deleteFunction', () => {
    it('should delete the account of the current user', async () => {
      vi.spyOn(api, 'deleteAccount').mockResolvedValueOnce();

      auth.state.user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      } as User;
      auth.state.loggedIn = true;
      auth.state.loaded = true;

      await auth.delete();

      expect(auth.state.user).toBe(null);
      expect(auth.state.loggedIn).toBe(false);
    });
  });
});
