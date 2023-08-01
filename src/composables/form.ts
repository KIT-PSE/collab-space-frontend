import { reactive } from 'vue';
import { ValidationError } from '@/composables/fetch';

export type Form<T extends Record<string, any>> = {
  errors: Record<keyof T, string>;
  data: T;
  clear: () => void;
  clearErrors: () => void;
  setErrors: (error: ValidationError) => void;
  submit: <U>(action: (data: T) => Promise<U>) => Promise<U | null>;
} & T;

export function useForm<T extends Record<string, any>>(defaults: T): Form<T> {
  const errors = reactive(
      Object.fromEntries(Object.keys(defaults).map((key) => [key, ''])) as Record<
          keyof T,
          string
      >
  );

  const data = reactive(defaults);

  const clear = () => {
    Object.assign(data, defaults);
    clearErrors();
  };

  const clearErrors = () => {
    Object.keys(errors).forEach((key: keyof T) => {
      errors[key] = '';
    });
  };

  const setErrors = (error: ValidationError) => {
    const emptyErrors = Object.fromEntries(
        Object.keys(defaults).map((key) => [key, ''])
    );

    Object.assign(errors, {
      ...emptyErrors,
      ...error.errors,
    });
  };

  const submit = async <U>(action: (data: T) => Promise<U>): Promise<U | null> => {
    try {
      const result = await action(data);
      clearErrors();
      return result;
    } catch (err) {
      if (err instanceof ValidationError) {
        setErrors(err);
      }

      return null;
    }
  };

  return {
    data,
    errors,
    clear,
    clearErrors,
    setErrors,
    submit,
  };
}
