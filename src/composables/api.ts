import { useFetch } from '@/composables/fetch';
import { useSingleton } from '@/composables/utils';

const fetch = useFetch();

export type UserResponse = {
  user: User;
};

export type LoginData = {
  email: string;
  password: string;
};

class Api {
  public async login(data: LoginData): Promise<UserResponse> {
    return fetch.postOrFail<UserResponse>('/auth/login', data);
  }

  public async logout(): Promise<void> {
    return fetch.postOrFail('/auth/logout');
  }

  public async profile(): Promise<UserResponse> {
    return fetch.getOrFail<UserResponse>('/auth/profile');
  }
}

export const useApi = useSingleton(new Api());
