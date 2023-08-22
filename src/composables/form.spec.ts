import { useForm } from '@/composables/form';
import { vi } from 'vitest';

describe('useForm', () => {
  it('should initialize form with default values and empty errors', () => {
    const defaults = { username: '', email: '' };
    const form = useForm(defaults);

    expect(form.username).toBe('');
    expect(form.email).toBe('');
    expect(form.errors.username).toBe('');
    expect(form.errors.email).toBe('');
  });

  it('should correctly update and retrieve form data', () => {
    const defaults = { username: '', email: '' };
    const form = useForm(defaults);

    form.username = 'john';
    form.email = 'john@example.com';

    expect(form.data()).toEqual({
      username: 'john',
      email: 'john@example.com',
    });
  });

  it('should clear form data and errors', () => {
    const defaults = { username: 'john', email: 'john@example.com' };
    const form = useForm(defaults);

    form.username = 'updated';
    form.email = 'updated@example.com';
    form.errors.username = 'Username error';
    form.errors.email = 'Email error';

    form.clear();

    expect(form.username).toBe('john');
    expect(form.email).toBe('john@example.com');
    expect(form.errors.username).toBe('');
    expect(form.errors.email).toBe('');
  });

  it('should clear all errors', () => {
    const defaults = { username: '', email: '' };
    const form = useForm(defaults);

    form.errors.username = 'Username error';
    form.errors.email = 'Email error';

    form.clearErrors();

    expect(form.errors.username).toBe('');
    expect(form.errors.email).toBe('');
  });

  it('should submit form data and clear errors on success', async () => {
    const defaults = { username: '', email: '' };
    const form = useForm(defaults);

    const action = vi.fn().mockResolvedValue('success');

    form.username = 'john';
    form.email = 'john@example.com';
    form.errors.username = 'Username error';
    form.errors.email = 'Email error';

    const result = await form.submit(action);

    expect(action).toHaveBeenCalledWith({
      username: 'john',
      email: 'john@example.com',
    });
    expect(form.errors.username).toBe('');
    expect(form.errors.email).toBe('');
    expect(result).toBe('success');
  });
});
