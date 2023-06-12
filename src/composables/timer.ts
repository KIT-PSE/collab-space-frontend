import { ref, watch } from 'vue';
import { defineStore } from 'pinia';

export const useTimer = defineStore('timer', () => {
  const time = ref(0);
  const startValue = ref(0);
  const enabled = ref(true);
  const handler = ref<() => void>(() => {});

  function initialise(amount: number) {
    startValue.value = amount;
    time.value = amount;

    watch(
      () => enabled.value,
      (enabled) => {
        if (enabled) {
          decrease();
        }
      },
    );

    watch(
      () => time.value,
      (time) => {
        if (time === 0) {
          handler.value();
        }

        if (time > 0 && enabled.value) {
          decrease();
        }
      },
    );
  }

  function start(): void {
    enabled.value = true;
    decrease();
  }

  function stop(): void {
    enabled.value = false;
  }

  function reset(): void {
    time.value = startValue.value;
  }

  function decrease(): void {
    setTimeout(() => time.value--, 1000);
  }

  function onFinished(_handler: () => void): void {
    handler.value = _handler;
  }

  return {
    initialise,
    time,
    start,
    stop,
    reset,
    onFinished,
  };
});
