import { defineStore } from 'pinia';
import { ref, Ref, watch } from 'vue';
import { openModal } from '@/utils';

export enum State {
  RESOLVED,
  WAITING,
  YES,
  NO,
}

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
