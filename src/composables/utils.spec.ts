import moment from 'moment';
import { useSingleton, convertDates } from '@/composables/utils';
import { describe, it, expect } from 'vitest';

describe('useSingleton', () => {
  it('should return a function that returns the provided object', () => {
    const obj = { key: 'value' };
    const singletonFn = useSingleton(obj);
    expect(singletonFn()).toBe(obj);
  });
});

describe('convertDates', () => {
  it('should convert createdAt and updatedAt properties to moment objects', () => {
    const input = {
      createdAt: '2023-08-22T12:34:56Z',
      updatedAt: '2023-08-23T10:11:12Z',
      nested: {
        createdAt: '2023-08-24T09:08:07Z',
      },
      array: [
        { createdAt: '2023-08-25T06:05:04Z' },
        { updatedAt: '2023-08-26T03:02:01Z' },
      ],
    };

    const expectedOutput = {
      createdAt: moment('2023-08-22T12:34:56Z'),
      updatedAt: moment('2023-08-23T10:11:12Z'),
      nested: {
        createdAt: moment('2023-08-24T09:08:07Z'),
      },
      array: [
        { createdAt: moment('2023-08-25T06:05:04Z') },
        { updatedAt: moment('2023-08-26T03:02:01Z') },
      ],
    };

    const converted = convertDates(input);
    expect(converted).toEqual(expectedOutput);
  });

  it('should not modify non-date properties', () => {
    const input = {
      name: 'John Doe',
      age: 30,
    };

    expect(convertDates(input)).toEqual(input);
  });
});
