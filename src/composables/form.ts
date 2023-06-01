import { reactive } from 'vue';
import { HttpError, useFetch } from '@/composables/fetch';

const fetch = useFetch();

export class ValidationError extends Error {
  constructor(public readonly errors: Record<string, string>) {
    super('Validation failed');
  }
}

// inspired by how inertia handles forms: https://inertiajs.com/forms

export type Form<T extends Record<string, any>> = {
  errors: Record<keyof T, string>;
  data(): T;
  clearErrors(): void;
  setErrors(errors: Record<string, string>): void;
  post(path: string): Promise<any>;
} & T;

export function useForm<T extends Record<string, any>>(defaults: T): Form<T> {
  const errors = Object.fromEntries(
    Object.keys(defaults).map((key) => [key, '']),
  ) as Record<keyof T, string>;

  return reactive({
    ...defaults,
    errors,

    data() {
      return Object.fromEntries(
        Object.keys(defaults).map((key) => [key, this[key]]),
      );
    },

    clearErrors() {
      Object.keys(this.errors).forEach((key: keyof T) => {
        this.errors[key] = '';
      });
    },

    setErrors(errors: Record<string, string>) {
      const emptyErrors = Object.fromEntries(
        Object.keys(defaults).map((key) => [key, '']),
      );

      Object.assign(this.errors, {
        ...emptyErrors,
        ...errors,
      });
    },

    async post(url: string): Promise<any> {
      const response = await fetch.postRaw(url, this.data());

      if (!response.ok && response.status === 422) {
        const { message: errors } = await response.json();
        this.setErrors(Object.fromEntries(errors));
        throw new ValidationError(this.errors);
      }

      this.clearErrors();
      if (!response.ok) {
        throw new HttpError(response);
      }

      return await response.json();
    },
  }) as Form<T>;
}
