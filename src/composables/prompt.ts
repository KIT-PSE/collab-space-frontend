import { defineStore } from 'pinia';
import { ref, Ref, watch } from 'vue';
import { openModal } from '@/utils';

/**
 * Represents the possible states of the prompt dialog.
 */
export enum State {
  /**
   * The prompt dialog is resolved and not waiting for any response.
   */
  RESOLVED,
  /**
   * The prompt dialog is waiting for a user response.
   */
  WAITING,
  /**
   * The user has selected the "Yes" option in the prompt dialog.
   */
  YES,
  /**
   * The user has selected the "No" option in the prompt dialog.
   */
  NO,
}

/**
 * Pinia store to manage the prompt dialog state.
 */
export const usePrompt = defineStore('prompt', () => {
  const title: Ref<string> = ref('');
  const message: Ref<string> = ref('');
  const submitText: Ref<string> = ref('');
  const state: Ref<State> = ref(State.RESOLVED);

  return {
    title,
    message,
    submitText,
    state,
  };
});

/**
 * Asks the user a yes or no question in a prompt dialog.
 *
 * @param title - The title of the prompt dialog.
 * @param message - The message content of the prompt dialog.
 * @param submitText - The text displayed on the submit button of the prompt dialog.
 * @returns A Promise that resolves to `true` if the user selects "Yes", or `false` if the user selects "No".
 */
export async function ask(
  title: string,
  message: string,
  submitText: string,
): Promise<boolean> {
  const prompt = usePrompt();

  prompt.title = title;
  prompt.message = message;
  prompt.submitText = submitText;
  prompt.state = State.WAITING;

  openModal('prompt-modal');

  return new Promise((resolve) => {
    const stop = watch(
      () => prompt.state,
      (state) => {
        if (state === State.YES) {
          resolve(true);
          stop();
          prompt.state = State.RESOLVED;
        } else if (state === State.NO) {
          resolve(false);
          stop();
          prompt.state = State.RESOLVED;
        }
      },
    );
  });
}
