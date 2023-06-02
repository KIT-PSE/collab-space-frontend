import { reactive } from 'vue';
import { ValidationError } from '@/composables/fetch';

// inspired by how inertia handles forms: https://inertiajs.com/forms

export type Form<T extends Record<string, any>> = {
  errors: Record<keyof T, string>;
  data(): T;
  clearErrors(): void;
  setErrors(error: ValidationError): void;
  submit<U>(action: (data: T) => Promise<U>): Promise<U | null>;
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
      ) as T;
    },

    clearErrors() {
      Object.keys(this.errors).forEach((key: keyof T) => {
        this.errors[key] = '';
      });
    },

    setErrors(error: ValidationError) {
      const emptyErrors = Object.fromEntries(
        Object.keys(defaults).map((key) => [key, '']),
      );

      Object.assign(this.errors, {
        ...emptyErrors,
        ...error.errors,
      });
    },

    async submit<U>(action: (data: T) => Promise<U>): Promise<U | null> {
      try {
        const result = await action(this.data());
        this.clearErrors();
        return result;
      } catch (err) {
        if (err instanceof ValidationError) {
          this.setErrors(err);
        }

        return null;
      }
    },
  }) as Form<T>;
}
