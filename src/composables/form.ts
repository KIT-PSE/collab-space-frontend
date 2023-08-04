import { reactive } from 'vue';
import { ValidationError } from '@/composables/fetch';

// inspired by how inertia handles forms: https://inertiajs.com/forms

/**
 * A generic form utility to handle form data, errors, and form submissions.
 *
 * @typeparam T - The type of data object the form will handle.
 */
export type Form<T extends Record<string, any>> = {
  errors: Record<keyof T, string>;
  data(): T;
  clear(): void;
  clearErrors(): void;
  setErrors(error: ValidationError): void;
  submit<U>(action: (data: T) => Promise<U>): Promise<U | null>;
} & T;

/**
 * Creates a reactive form that handles form data, errors, and submissions.
 *
 * @typeparam T - The type of data object the form will handle.
 * @param defaults - The initial default values of the form data.
 * @returns A reactive form object with the provided default data and form handling methods.
 */
export function useForm<T extends Record<string, any>>(defaults: T): Form<T> {
  const errors = Object.fromEntries(
    Object.keys(defaults).map((key) => [key, '']),
  ) as Record<keyof T, string>;

  return reactive({
    ...defaults,
    errors,

    /**
     * Returns the current form data object `T`.
     *
     * @returns The current data object of type `T`.
     */
    data() {
      return Object.fromEntries(
        Object.keys(defaults).map((key) => [key, this[key]]),
      ) as T;
    },

    /**
     * Clears the form data, resetting it to its initial default values,
     * and clears any existing errors.
     */
    clear() {
      Object.keys(defaults).forEach((key: keyof T) => {
        // @ts-ignore
        this[key] = defaults[key];
      });
      this.clearErrors();
    },

    /**
     * Clears all errors in the form.
     */
    clearErrors() {
      Object.keys(this.errors).forEach((key: keyof T) => {
        this.errors[key] = '';
      });
    },

    /**
     * Sets the form errors based on the provided `ValidationError` object.
     * It associates each error with its corresponding property in the form data object.
     *
     * @param error - The `ValidationError` object containing errors to be set in the form.
     */
    setErrors(error: ValidationError) {
      const emptyErrors = Object.fromEntries(
        Object.keys(defaults).map((key) => [key, '']),
      );

      Object.assign(this.errors, {
        ...emptyErrors,
        ...error.errors,
      });
    },

    /**
     * Submits the form data by calling the provided `action` function, passing the current data object as an argument.
     * If there are errors during form submission, the errors will be set in the form and the function will return `null`.
     *
     * @typeparam U - The type of the result returned by the `action` function.
     * @param action - The async function that processes the form data and returns a result of type `U`.
     * @returns A promise that resolves to the result of the `action` function or `null` if there is an error.
     */
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
