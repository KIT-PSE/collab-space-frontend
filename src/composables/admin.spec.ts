import { useAdmin } from '@/composables/admin';
import { createPinia, setActivePinia } from 'pinia';
import { expect, vi } from 'vitest';
import { useApi, User } from '@/composables/api';
import { ValidationError } from '@/composables/fetch';

describe('admin', () => {
  let admin: ReturnType<typeof useAdmin>;
  let api: ReturnType<typeof useApi>;

  let TEST_USERS: User[] = [];

  beforeEach(() => {
    setActivePinia(createPinia());

    admin = useAdmin();
    api = useApi();

    TEST_USERS = [
      {
        id: 1,
        name: 'Test User 1',
        email: 'test@example.com',
        role: 'admin',
      },
      {
        id: 2,
        name: 'Test User 2',
        email: 'test2@example.com',
        role: 'user',
      },
    ];
  });

  describe('load', () => {
    it('should load users', async () => {
      vi.spyOn(api, 'allUsers').mockResolvedValue(TEST_USERS);

      expect(admin.users).toHaveLength(0);

      await admin.load();

      expect(admin.users).toHaveLength(2);
    });

    it('should handle errors', async () => {
      vi.spyOn(api, 'allUsers').mockRejectedValue(new Error());

      await admin.load();

      expect(admin.users).toHaveLength(0);
    });
  });

  describe('changeUserRole', () => {
    it('should change the user role', async () => {
      vi.spyOn(api, 'allUsers').mockResolvedValue(TEST_USERS);
      vi.spyOn(api, 'changeUserRole').mockResolvedValue({
        ...TEST_USERS[0],
        role: TEST_USERS[0].role === 'admin' ? 'user' : 'admin',
      });
      await admin.load();

      expect(admin.users[0].role).toBe('admin');
      await admin.changeUserRole(1);
      expect(admin.users[0].role).toBe('user');
    });

    it('should handle validation errors', async () => {
      vi.spyOn(api, 'allUsers').mockResolvedValue(TEST_USERS);
      vi.spyOn(api, 'changeUserRole').mockRejectedValue(
        new ValidationError('Test Error'),
      );
      await admin.load();

      await expect(admin.changeUserRole(1)).rejects.toThrow();
      expect(admin.users[0].role).toBe('admin');
    });
  });

  describe('deleteAccount', () => {
    it('should delete the user account', async () => {
      vi.spyOn(api, 'allUsers').mockResolvedValue(TEST_USERS);
      vi.spyOn(api, 'deleteUserAccount').mockResolvedValue();
      await admin.load();

      expect(admin.users).toHaveLength(2);
      await admin.deleteAccount(1);
      expect(admin.users).toHaveLength(1);
    });
  });
});
