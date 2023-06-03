import { useFetch } from '@/composables/fetch';
import { Moment } from 'moment';

const fetch = useFetch();

export type Category = {
  id: number;
  name: string;
  createdAt: Moment;
  updatedAt: Moment;
};

export type CreateCategory = {
  name: string;
};

export type UpdateCategory = CreateCategory;

export const category = {
  async all(): Promise<Category[]> {
    return fetch.getOrFail('/category');
  },

  async create(data: CreateCategory): Promise<Category> {
    return fetch.postOrFail('/category', data);
  },

  async update(id: number, data: UpdateCategory): Promise<Category> {
    return fetch.putOrFail(`/category/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return fetch.delete(`/category/${id}`);
  },
};
