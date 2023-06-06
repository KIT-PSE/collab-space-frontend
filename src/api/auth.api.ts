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

export const auth = {
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

  async delete(): Promise<void> {
    return fetch.delete('/auth/delete');
  }
};
