<template>
  <Layout title="Account Einstellungen" :buttons="['back']">
    <div class="row mt-5">
      <div class="col-md-6">
        <Input
            label="Schule / Universität oder Organisation"
            v-model="user.organization"
            :disabled="disabledInputs[0].value"
        >
          <button class="btn btn-secondary ms-2" @click="edit(0)">{{ settings[0].value }}</button>
        </Input>

        <Input
            label="Name"
            v-model="user.name"
            :disabled="disabledInputs[1].value"
        >
          <button class="btn btn-secondary ms-2" @click="edit(1)">{{ settings[1].value }}</button>
        </Input>

        <EmailInput
            label="E-Mail Adresse"
            v-model="user.email"
            :disabled="disabledInputs[2].value"
        >
          <button class="btn btn-secondary ms-2" @click="edit(2)">{{ settings[2].value }}</button>
        </EmailInput>

        <PasswordInput label="Passwort" model-value="12345678" disabled>
          <button class="btn btn-secondary ms-2" @click="editPassword()">Ändern</button>
        </PasswordInput>

        <button class="btn btn-danger mt-3" @click="deleteAccount">Account löschen</button>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '@/components/Layout.vue';
import Input from '@/components/inputs/Input.vue';
import EmailInput from '@/components/inputs/EmailInput.vue';
import PasswordInput from '@/components/inputs/PasswordInput.vue';
import { useAuth, useUser } from '@/composables/auth';
import { ask } from "@/composables/prompt";
import { ref } from "vue";

const user = useUser();
const auth = useAuth();

const disabledInputs = [
  ref(true),
  ref(true),
  ref(true)
];

const settings = [
  ref("Ändern"),
  ref("Ändern"),
  ref("Ändern")
];

async function deleteAccount() {
  const shouldDelete = await ask(
      'Account löschen',
      `Bist du sicher, dass du deinen Account löschen möchtest? Diese Aktion kann <b>nicht rückgängig</b> gemacht werden.`,
      'Löschen',
  );

  if (!shouldDelete) return;

  await auth.delete();
}

function edit(index) {
  if (settings[index].value === "Ändern") {
    settings[index].value = "Speichern";
    disabledInputs[index].value = false;
  } else {
    settings[index].value = "Ändern";
    disabledInputs[index].value = true;
  }
}

</script>
