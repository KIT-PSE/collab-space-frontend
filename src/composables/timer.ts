import { reactive, watch } from 'vue';

/**
 * Represents a timer that counts down from a specified amount of time.
 */
export class Timer {
  private handler = () => {};

  public state = reactive({
    time: 0,
    enabled: true,
  });

  /**
   * Creates a new Timer instance.
   * @param amount - The amount of time to count down from (in seconds).
   */
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

  /**
   * Starts the timer.
   */
  public start(): void {
    this.state.enabled = true;
    this.decrease();
  }

  /**
   * Stops the timer.
   */
  public stop(): void {
    this.state.enabled = false;
  }

  /**
   * Decreases the remaining time on the timer.
   */
  public decrease(): void {
    setTimeout(() => this.state.time--, 1000);
  }

  /**
   * Sets a handler function to be called when the timer finishes.
   * @param handler - The handler function to be called when the timer finishes.
   */
  public onFinished(handler: () => void): void {
    this.handler = handler;
  }
}

/**
 * A composable function that creates and returns a Timer instance with the specified amount of time.
 * @param amount - The amount of time to count down from (in seconds).
 * @returns The Timer instance.
 */
export const useTimer = (amount: number) => new Timer(amount);
