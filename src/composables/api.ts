import { convertDates, useSingleton } from '@/composables/utils';
import { useFetch } from '@/composables/fetch';
import { Moment } from 'moment';

const fetch = useFetch();

export type User = {
  id: number;
  name: string;
  email: string;
  organization: string;
  createdAt: Moment;
  updatedAt: Moment;
  role: 'user' | 'admin';
};

export type UserResponse = {
  user: User;
  exp: number;
};

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  organization: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type Room = {
  id: number;
  category: number;
  name: string;
  channelId?: string,
  password?: string;
  createdAt: Moment;
  updatedAt: Moment;
};

export type CreateRoom = {
  name: string;
  password?: string;
  categoryId: string;
};

export type Category = {
  id: number;
  name: string;
  rooms: Room[];
  createdAt: Moment;
  updatedAt: Moment;
};

export type CreateCategory = {
  name: string;
};

export type UpdateCategory = CreateCategory;
export type UpdateRoom = CreateRoom;

const api = {
  async register(data: RegisterData): Promise<UserResponse> {
    return fetch.postOrFail<UserResponse>('/auth/register', data);
  },

  async login(data: LoginData): Promise<UserResponse> {
    return fetch.postOrFail<UserResponse>('/auth/login', data);
  },

  async logout(): Promise<void> {
    return fetch.postOrFail('/auth/logout');
  },

  async profile(): Promise<UserResponse> {
    return fetch.getOrFail<UserResponse>('/auth/profile');
  },

  async deleteAccount(): Promise<void> {
    return fetch.delete('/auth/delete');
  },

  async allCategories(): Promise<Category[]> {
    return fetch.getOrFail('/category');
  },

  async createCategory(data: CreateCategory): Promise<Category> {
    return fetch.postOrFail('/category', data);
  },

  async updateCategory(id: number, data: UpdateCategory): Promise<Category> {
    return fetch.putOrFail(`/category/${id}`, data);
  },

  async deleteCategory(id: number): Promise<void> {
    return fetch.delete(`/category/${id}`);
  },

  async createRoom(data: CreateRoom): Promise<Room & { category: Category }> {
    return fetch.postOrFail(`/category/${data.categoryId}/room`, {
      name: data.name,
      password: data.password,
    });
  },

  async updateRoom(
    id: number,
    categoryId: number,
    data: { name: string },
  ): Promise<Room> {
    return fetch.putOrFail(`/category/${categoryId}/room/${id}`, data);
  },

  async deleteRoom(id: number, categoryId: number): Promise<void> {
    return fetch.delete(`/category/${categoryId}/room/${id}`);
  },
};

export const useApi = useSingleton(decorateApi(api));

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
