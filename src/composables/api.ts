import { convertDates, useSingleton } from '@/composables/utils';
import { useFetch } from '@/composables/fetch';
import { Moment } from 'moment';
import { Note } from '@/composables/channel/notes';

const fetch = useFetch();

/**
 * Represents a user in the application.
 * @property id - The ID of the user.
 * @property name - The name of the user.
 * @property email - The email of the user.
 * @property organization - The organization of the user.
 * @property createdAt - The date and time when the user was created.
 * @property updatedAt - The date and time when the user was last updated.
 * @property role - The role of the user.
 */
export type User = {
  id: number;
  name: string;
  email: string;
  organization: string;
  createdAt: Moment;
  updatedAt: Moment;
  role: 'user' | 'admin';
};

/**
 * Represents the response returned when a user-related action is performed.
 * It includes the user object and an expiration time (exp) for the response.
 * @property user - The user object.
 * @property exp - The expiration time for the response.
 */
export type UserResponse = {
  user: User;
  exp: number;
};

/**
 * Represents the data required for user login.
 * @property email - The email of the user.
 * @property password - The password of the user.
 */
export type LoginData = {
  email: string;
  password: string;
};

/**
 * Represents the data required for user registration.
 * @property organization - The organization of the user.
 * @property name - The name of the user.
 */
export type RegisterData = {
  organization: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

/**
 * Represents a room in the application.
 * @property id - The ID of the room.
 * @property category - The category ID of the room.
 * @property name - The name of the room.
 * @property channelId - The channel ID of the room.
 * @property password - The password of the room.
 * @property createdAt - The date and time when the room was created.
 * @property updatedAt - The date and time when the room was last updated.
 * @property whiteboardCanvas - The whiteboard canvas of the room.
 */
export type Room = {
  id: number;
  category: number;
  name: string;
  channelId?: string;
  password?: string;
  createdAt: Moment;
  updatedAt: Moment;
  whiteboardCanvas: string;
};

/**
 * Represents the data required to create a new room.
 * @property name - The name of the room.
 * @property password - The password of the room.
 * @property categoryId - The category ID of the room.
 */
export type CreateRoom = {
  name: string;
  password?: string;
  categoryId: string;
};

/**
 * Represents a category in the application.
 * @property id - The ID of the category.
 * @property name - The name of the category.
 * @property rooms - The rooms in the category.
 * @property createdAt - The date and time when the category was created.
 * @property updatedAt - The date and time when the category was last updated.
 */
export type Category = {
  id: number;
  name: string;
  rooms: Room[];
  createdAt: Moment;
  updatedAt: Moment;
};

/**
 * Represents the data required to create a new category.
 * @property name - The name of the category.
 */
export type CreateCategory = {
  name: string;
};

/**
 * Represents the data required to change a user's password.
 * @property currentPassword - The current password of the user.
 * @property newPassword - The new password of the user.
 * @property confirmNewPassword - The confirmation of the new password of the user.
 */
export type ChangePassword = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type UpdateCategory = CreateCategory;
export type UpdateRoom = CreateRoom;

/**
 * An object containing async functions to interact with the server API.
 */
const api = {
  /**
   * Registers a new user with the provided registration data.
   *
   * @param data - The registration data for the new user.
   * @returns A Promise that resolves to the response containing user information.
   */
  async register(data: RegisterData): Promise<UserResponse> {
    return fetch.postOrFail<UserResponse>('/auth/register', data);
  },

  /**
   * Logs in a user with the provided login data.
   *
   * @param data - The login data for the user.
   * @returns A Promise that resolves to the response containing user information.
   */
  async login(data: LoginData): Promise<UserResponse> {
    return fetch.postOrFail<UserResponse>('/auth/login', data);
  },

  /**
   * Logs out the currently logged-in user.
   *
   * @returns A Promise that resolves when the logout process is completed.
   */
  async logout(): Promise<void> {
    return fetch.postOrFail('/auth/logout');
  },

  /**
   * Fetches the profile data of the currently logged-in user.
   *
   * @returns A Promise that resolves to the response containing user information.
   */
  async profile(): Promise<UserResponse> {
    return fetch.getOrFail<UserResponse>('/auth/profile');
  },

  /**
   * Fetches all users from the server.
   *
   * @returns A Promise that resolves to an array of users.
   */
  async allUsers(): Promise<User[]> {
    return fetch.getOrFail('/user/findAll');
  },

  /**
   * Changes the role of a user with the specified ID.
   *
   * @param data - The data containing the user ID whose role needs to be changed.
   * @returns A Promise that resolves to the updated user information after role change.
   * @throws If there is a validation error during the role change.
   */
  async changeUserRole(data: { id: number }): Promise<User> {
    return fetch.postOrFail<User>('/user/changeRole', data);
  },

  /**
   * Deletes the user account of the currently logged-in user.
   *
   * @returns A Promise that resolves when the user account is successfully deleted.
   */
  async deleteAccount(): Promise<void> {
    return fetch.delete('/auth/delete');
  },

  /**
   * Deletes the user account with the specified ID.
   *
   * @param id - The ID of the user account to be deleted.
   * @returns A Promise that resolves when the user account is successfully deleted.
   */
  async deleteUserAccount(id: number): Promise<void> {
    return fetch.delete(`/user/${id}`);
  },

  /**
   * Fetches all categories from the server.
   *
   * @returns A Promise that resolves to an array of categories.
   */
  async allCategories(): Promise<Category[]> {
    return fetch.getOrFail('/category');
  },

  /**
   * Creates a new category.
   *
   * @param data - The data for creating the category.
   * @returns A Promise that resolves to the created category.
   */
  async createCategory(data: CreateCategory): Promise<Category> {
    return fetch.postOrFail('/category', data);
  },

  /**
   * Updates an existing category with the specified ID.
   *
   * @param id - The ID of the category to be updated.
   * @param data - The data containing the new category information.
   * @returns A Promise that resolves to the updated category.
   */
  async updateCategory(id: number, data: UpdateCategory): Promise<Category> {
    return fetch.putOrFail(`/category/${id}`, data);
  },

  /**
   * Deletes the category with the specified ID.
   *
   * @param id - The ID of the category to be deleted.
   * @returns A Promise that resolves when the category is successfully deleted.
   */
  async deleteCategory(id: number): Promise<void> {
    return fetch.delete(`/category/${id}`);
  },

  /**
   * Creates a new room under the specified category.
   *
   * @param data - The data for creating the room.
   * @returns A Promise that resolves to the created room along with its category.
   */
  async createRoom(
    data: CreateRoom,
  ): Promise<Omit<Room, 'category'> & { category: Category }> {
    return fetch.postOrFail(`/category/${data.categoryId}/room`, {
      name: data.name,
      password: data.password,
    });
  },

  /**
   * Updates an existing room with the specified ID and category ID.
   *
   * @param id - The ID of the room to be updated.
   * @param categoryId - The ID of the category to which the room belongs.
   * @param data - The data containing the new room information.
   * @returns A Promise that resolves to the updated room.
   */
  async updateRoom(
    id: number,
    categoryId: number,
    data: { name: string },
  ): Promise<Room> {
    return fetch.putOrFail(`/category/${categoryId}/room/${id}`, data);
  },

  /**
   * Deletes the room with the specified ID and category ID.
   *
   * @param id - The ID of the room to be deleted.
   * @param categoryId - The ID of the category to which the room belongs.
   * @returns A Promise that resolves when the room is successfully deleted.
   */
  async deleteRoom(id: number, categoryId: number): Promise<void> {
    return fetch.delete(`/category/${categoryId}/room/${id}`);
  },

  /**
   * Retrieves the notes for a specific room and category.
   *
   * @param roomId - The ID of the room.
   * @param categoryId - The ID of the category to which the room belongs.
   * @returns A Promise that resolves to an array of notes for the specified room and category.
   */
  async getNotes(roomId: number, categoryId: number): Promise<Note[]> {
    return fetch.getOrFail(`/category/${categoryId}/room/${roomId}/notes`);
  },

  /**
   * Updates the account data of a user.
   *
   * @param user - The user object containing the updated account data.
   * @returns A Promise that resolves to a boolean indicating if the update was successful.
   */
  async changeAccountData(user: User): Promise<boolean> {
    return fetch.putOrFail('/user/changeUserData', {
      id: user.id,
      organization: user.organization,
      name: user.name,
      email: user.email,
    });
  },

  /**
   * Updates the password of a user.
   *
   * @param data - The data containing the new password information.
   * @returns A Promise that resolves to a boolean indicating if the password update was successful.
   */
  async updatePassword(data: ChangePassword): Promise<boolean> {
    return fetch.postOrFail('/user/changePassword', data);
  },
};

/**
 * A custom hook that wraps the decorated API object with a singleton instance.
 * This ensures that the API object is only created once and reused throughout the application.
 *
 * @returns A singleton instance of the API object.
 */
export const useApi = useSingleton(decorateApi(api));

/**
 * Decorates all functions of the given object to convert all createdAt and updatedAt
 * properties of the returned object to moment objects.
 *
 * This helps to avoid the repetitive call of convertDates() in every API function.
 *
 * @param obj - The object whose functions need to be decorated.
 * @returns The decorated object with functions that return moment objects for 'createdAt' and 'updatedAt'.
 */
function decorateApi<T>(obj: T): T {
  for (const key in obj) {
    (obj as any)[key] = decorate((obj as any)[key]);
  }

  return obj;
}

/**
 * Transforms a provided function to return an output where 'createdAt'
 * and 'updatedAt' properties are converted into moment.js objects.
 *
 * @param func - The function that needs to be decorated.
 * @returns The decorated function that returns moment objects for 'createdAt' and 'updatedAt'.
 */
function decorate(func: () => any): () => any {
  return async function (...args) {
    // @ts-ignore
    const result = await func.apply(this, args);
    return convertDates(result);
  };
}
