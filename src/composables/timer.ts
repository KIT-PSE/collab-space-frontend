import { reactive, watch } from 'vue';

export class Timer {
  private handler = () => {};

  public state = reactive({
    time: 0,
    enabled: true,
  });

  constructor(amount: number) {
    this.state.time = amount;

    watch(
      () => this.state.enabled,
      (enabled) => {
        if (enabled) {
          this.decrease();
        }
      },
    );

    watch(
      () => this.state.time,
      (time) => {
        if (time === 0) {
          this.handler();
        }

        if (time > 0 && this.state.enabled) {
          this.decrease();
        }
      },
    );
  }

  public start(): void {
    this.state.enabled = true;
    this.decrease();
  }

  public stop(): void {
    this.state.enabled = false;
  }

  public decrease(): void {
    setTimeout(() => this.state.time--, 1000);
  }

  public onFinished(handler: () => void): void {
    this.handler = handler;
  }
}

export const useTimer = (amount: number) => new Timer(amount);
