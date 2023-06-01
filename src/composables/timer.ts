import { ref, watch } from 'vue';

export class Timer {
  public time = ref(0);
  private enabled = ref(true);
  private handler = () => {};

  constructor(amount: number) {
    this.time.value = amount;

    watch(this.enabled, (enabled) => {
      if (enabled) {
        this.decrease();
      }
    });

    watch(this.time, (time) => {
      if (time === 0) {
        this.handler();
      }

      if (time > 0 && this.enabled.value) {
        this.decrease();
      }
    });
  }

  public start(): void {
    this.enabled.value = true;
    this.decrease();
  }

  public stop(): void {
    this.enabled.value = false;
  }

  public decrease(): void {
    setTimeout(() => this.time.value--, 1000);
  }

  public onFinished(handler: () => void): void {
    this.handler = handler;
  }
}

export const useTimer = (amount: number) => new Timer(amount);
