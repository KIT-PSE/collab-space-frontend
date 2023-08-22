import { createPinia, setActivePinia } from 'pinia';
import { useStore } from '@/composables/store';
import { vi } from 'vitest';
import { Category, Room, useApi } from '@/composables/api';
import { ValidationError } from '@/composables/fetch';

describe('store', () => {
  let store: ReturnType<typeof useStore>;
  let api: ReturnType<typeof useApi>;

  let TEST_CATEGORIES: Category[] = [];
  let TEST_ROOM: Room;

  beforeEach(() => {
    setActivePinia(createPinia());

    store = useStore();
    api = useApi();

    TEST_CATEGORIES = [
      {
        id: 1,
        name: 'Test Category 1',
        rooms: [],
      },
      {
        id: 2,
        name: 'Test Category 2',
        rooms: [],
      },
    ];

    TEST_ROOM = {
      id: 1,
      name: 'Test Room',
      password: 'password',
      whiteboardCanvas: '',
      channelId: '123456',
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('load', () => {
    it('should load categories', async () => {
      vi.spyOn(api, 'allCategories').mockResolvedValue(TEST_CATEGORIES);

      expect(store.categories).toHaveLength(0);
      expect(store.loaded).toBe(false);

      await store.load();

      expect(store.categories).toHaveLength(TEST_CATEGORIES.length);
      expect(store.loaded).toBe(true);
    });

    it('should not load categories if already loaded', async () => {
      vi.spyOn(api, 'allCategories').mockResolvedValue(TEST_CATEGORIES);

      await store.load();
      await store.load();

      expect(api.allCategories).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      vi.spyOn(api, 'allCategories').mockRejectedValue(new Error('Test Error'));

      await store.load();

      expect(store.categories).toHaveLength(0);
      expect(store.loaded).toBe(false);
    });
  });

  describe('unload', () => {
    it('should unload categories', async () => {
      vi.spyOn(api, 'allCategories').mockResolvedValue(TEST_CATEGORIES);

      await store.load();
      store.unload();

      expect(store.categories).toHaveLength(0);
      expect(store.loaded).toBe(false);
    });
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const category: Category = {
        id: 1,
        name: 'Test Category',
        rooms: [],
      };

      vi.spyOn(api, 'createCategory').mockResolvedValue(category);

      await store.createCategory({ name: 'Test Category' });

      expect(store.categories).toHaveLength(1);
      expect(store.categories[0]).toEqual(category);
    });

    it('should handle validation errors', async () => {
      const error = new ValidationError('Test Error');

      vi.spyOn(api, 'createCategory').mockRejectedValue(error);

      await expect(
        store.createCategory({ name: 'Test Category' }),
      ).rejects.toThrow(error);
    });

    it('should handle other errors', async () => {
      vi.spyOn(api, 'createCategory').mockRejectedValue(
        new Error('Test Error'),
      );

      await store.createCategory({ name: 'Test Category' });

      expect(store.categories).toHaveLength(0);
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const updatedCategory: Category = {
        ...TEST_CATEGORIES[0],
        name: 'Updated Test Category',
      };
      vi.spyOn(api, 'allCategories').mockResolvedValue(TEST_CATEGORIES);
      vi.spyOn(api, 'updateCategory').mockResolvedValue(updatedCategory);
      await store.load();

      await store.updateCategory(TEST_CATEGORIES[0], {
        name: 'Updated Test Category',
      });

      expect(store.categories).toHaveLength(TEST_CATEGORIES.length);
      expect(store.categories[0]).toEqual(updatedCategory);
    });

    it('should return null if the category is not found', async () => {
      vi.spyOn(api, 'allCategories').mockResolvedValue(TEST_CATEGORIES);
      await store.load();

      const updatedCategory = await store.updateCategory(
        {
          id: 3,
          name: 'Test Category 3',
          rooms: [],
        },
        {
          name: 'Updated Test Category',
        },
      );

      expect(updatedCategory).toBeNull();
    });

    it('should handle validation errors', async () => {
      const error = new ValidationError('Test Error');

      vi.spyOn(api, 'updateCategory').mockRejectedValue(error);

      await expect(
        store.updateCategory(TEST_CATEGORIES[0], {
          name: 'Updated Test Category',
        }),
      ).rejects.toThrow(error);
    });

    it('should handle other errors', async () => {
      vi.spyOn(api, 'updateCategory').mockRejectedValue(
        new Error('Test Error'),
      );

      await store.updateCategory(TEST_CATEGORIES[0], {
        name: 'Updated Test Category',
      });

      expect(store.categories).toHaveLength(0);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      vi.spyOn(api, 'allCategories').mockResolvedValue(TEST_CATEGORIES);
      vi.spyOn(api, 'deleteCategory').mockResolvedValue(undefined);
      await store.load();

      await store.deleteCategory(TEST_CATEGORIES[0]);

      expect(store.categories).toHaveLength(1);
      expect(store.categories).not.toContain(
        expect.objectContaining({ id: 1 }),
      );
    });

    it('should handle errors', async () => {
      vi.spyOn(api, 'allCategories').mockResolvedValue(TEST_CATEGORIES);
      vi.spyOn(api, 'deleteCategory').mockRejectedValue(
        new Error('Test Error'),
      );
      await store.load();

      await store.deleteCategory(TEST_CATEGORIES[0]);

      expect(store.categories).toHaveLength(TEST_CATEGORIES.length);
    });
  });

  describe('createRoom', () => {
    it('should create a room', async () => {
      vi.spyOn(api, 'allCategories').mockResolvedValue(TEST_CATEGORIES);
      vi.spyOn(api, 'createRoom').mockResolvedValue({
        ...TEST_ROOM,
        category: TEST_CATEGORIES[0],
      });
      await store.load();

      const createdRoom = await store.createRoom({
        name: 'Test Room',
        password: 'password',
        categoryId: TEST_CATEGORIES[0].id,
      });

      expect(store.categories[0].rooms).toHaveLength(1);
      expect(createdRoom?.name).toEqual('Test Room');
      expect(createdRoom?.category).toEqual(TEST_CATEGORIES[0].id);
    });

    it('should handle validation errors', async () => {
      const error = new ValidationError('Test Error');

      vi.spyOn(api, 'createRoom').mockRejectedValue(error);

      await expect(
        store.createRoom(TEST_CATEGORIES[0], {
          name: 'Test Room',
          password: 'password',
        }),
      ).rejects.toThrow(error);
    });

    it('should handle other errors', async () => {
      vi.spyOn(api, 'createRoom').mockRejectedValue(new Error('Test Error'));

      const result = await store.createRoom(TEST_CATEGORIES[0], {
        name: 'Test Room',
        password: 'password',
      });

      expect(result).toBeNull();
    });
  });

  describe('findRoom', () => {
    it('should find a room', async () => {
      TEST_CATEGORIES[0].rooms = [TEST_ROOM];
      vi.spyOn(api, 'allCategories').mockResolvedValue(TEST_CATEGORIES);
      await store.load();

      const foundRoom = await store.findRoom(TEST_ROOM.id);

      expect(foundRoom?.name).toEqual('Test Room');
    });

    it('should return null if the room is not found', async () => {
      vi.spyOn(api, 'allCategories').mockResolvedValue(TEST_CATEGORIES);
      await store.load();

      const foundRoom = await store.findRoom(3);

      expect(foundRoom).toBeNull();
    });
  });

  describe('updateRoom', () => {
    it('should update a room', async () => {
      TEST_CATEGORIES[0].rooms = [TEST_ROOM];
      const updatedRoom: Room = {
        ...TEST_ROOM,
        name: 'Updated Test Room',
      };
      vi.spyOn(api, 'allCategories').mockResolvedValue(TEST_CATEGORIES);
      vi.spyOn(api, 'updateRoom').mockResolvedValue(updatedRoom);
      await store.load();

      const result = await store.updateRoom(
        { ...TEST_ROOM, category: TEST_CATEGORIES[0].id },
        {
          name: 'Updated Test Room',
        },
      );

      console.log(result);

      expect(store.categories).toHaveLength(TEST_CATEGORIES.length);
      expect(store.categories[0].rooms).toHaveLength(1);
      expect(store.categories[0].rooms[0].name).toEqual(updatedRoom.name);
    });

    it('should return null if the room is not found', async () => {
      vi.spyOn(api, 'allCategories').mockResolvedValue(TEST_CATEGORIES);
      await store.load();

      const updatedRoom = await store.updateRoom(
        {
          id: 3,
          name: 'Test Room 3',
          password: 'password',
          whiteboardCanvas: '',
          channelId: '123456',
          category: 1,
        },
        {
          name: 'Updated Test Room',
        },
      );

      expect(updatedRoom).toBeNull();
    });

    it('should handle validation errors', async () => {
      const error = new ValidationError('Test Error');

      vi.spyOn(api, 'updateRoom').mockRejectedValue(error);

      await expect(
        store.updateRoom(TEST_ROOM, {
          name: 'Updated Test Room',
        }),
      ).rejects.toThrow(error);
    });

    it('should handle other errors', async () => {
      vi.spyOn(api, 'updateRoom').mockRejectedValue(new Error('Test Error'));

      const result = await store.updateRoom(TEST_ROOM, {
        name: 'Updated Test Room',
      });

      expect(result).toBeNull();
    });
  });

  describe('deleteRoom', () => {
    it('should delete a room', async () => {
      TEST_CATEGORIES[0].rooms = [TEST_ROOM];
      vi.spyOn(api, 'allCategories').mockResolvedValue(TEST_CATEGORIES);
      vi.spyOn(api, 'deleteRoom').mockResolvedValue(undefined);
      await store.load();

      await store.deleteRoom({ ...TEST_ROOM, category: TEST_CATEGORIES[0].id });

      expect(store.categories[0].rooms).toHaveLength(0);
    });

    it('should handle errors', async () => {
      TEST_CATEGORIES[0].rooms = [TEST_ROOM];
      vi.spyOn(api, 'allCategories').mockResolvedValue(TEST_CATEGORIES);
      vi.spyOn(api, 'deleteRoom').mockRejectedValue(new Error('Test Error'));
      await store.load();

      await store.deleteRoom({ ...TEST_ROOM, category: TEST_CATEGORIES[0].id });

      expect(store.categories[0].rooms).toHaveLength(1);
    });
  });
});
