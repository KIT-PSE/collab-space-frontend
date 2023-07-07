<template>
  <Layout title="Account Einstellungen" :buttons="['back']">
    <div class="row mt-5">
      <div class="col-md-6">
        <Input
          label="Schule / Universität oder Organisation"
          v-model="user.organization"
          :disabled="disabled"
        >
          <button class="btn btn-secondary ms-2" @click="edit()">{{ setting }}</button>
        </Input>

        <Input label="Name"
               v-model="user.name"
               :disabledName="disabled"
        >
          <button class="btn btn-secondary ms-2" @click="editName()">{{settingName}}</button>
        </Input>

        <EmailInput
            label="E-Mail Adresse"
            v-model="user.email"
            :disabledEMail="disabled"
        >
          <button class="btn btn-secondary ms-2" @click="editEMail()">{{settingEMail}}</button>
        </EmailInput>

        <PasswordInput label="Passwort" model-value="12345678" disabled>
          <button class="btn btn-secondary ms-2" @click="editPassword()"> Ändern </button>
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
  import {useAuth, useUser} from '@/composables/auth';
  import { ask } from "@/composables/prompt";
  import {ref} from "vue";

  const user = useUser();
  const auth = useAuth();

  const disabled = ref(true);
  const disabledName = ref(true);
  const disabledEMail = ref(true);

  const setting  = ref("Ändern");
  const settingName  = ref("Ändern");
  const settingEMail  = ref("Ändern");

  async function deleteAccount() {
    const shouldDelete = await ask(
        'Account löschen',
        `Bist du sicher, dass du deinen Account löschen möchtest? Diese Aktion kann <b>nicht rückgängig</b> gemacht werden.`,
        'Löschen',
    );

    if (!shouldDelete) return;

    await auth.delete();
  }

  function edit() {
      if(setting.value === "Ändern") {
        setting.value = "Speichern";
        disabledOrganization.value = false;
      }
      else{
        setting.value = "Ändern";
        disabledOrganization.value = true;
      }
  }

  function editName() {
    if(settingName.value === "Ändern") {
      settingName.value = "Speichern";
      disabledName.value = false;
    }
    else{
      settingName.value = "Ändern";
      disabledName.value = true;
    }
  }

  function editEMail() {
    if(settingEMail.value === "Ändern") {
      settingEMail.value = "Speichern";
      disabledEMail.value = false;
    }
    else{
      settingEMail.value = "Ändern";
      disabledEMail.value = true;
    }
  }
</script>
