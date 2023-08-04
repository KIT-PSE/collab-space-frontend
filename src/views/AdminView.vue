<template>
  <Layout title="Admin-Panel" :buttons="['back']">
    <div class="row">
      <div class="col">
        <h2>Nutzer</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Organization</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in admin.users" :key="user.id" class="align-middle">
              <td>
                {{ user.name }}
                <span
                  v-if="user.role === 'admin'"
                  class="badge text-bg-danger ms-1"
                >
                  Admin
                </span>
              </td>
              <td>{{ user.email }}</td>
              <td>{{ user.organization }}</td>
              <td class="d-flex justify-content-end">
                <button
                  @click="changeUserRole(user)"
                  class="btn btn-sm btn-secondary me-2"
                  :disabled="user.id === auth.state.user?.id"
                >
                  <i
                    class="fa"
                    :class="{
                      'fa-user-shield': user.role === 'admin',
                      'fa-shield': user.role !== 'admin',
                    }"
                  ></i>
                </button>
                <button
                  @click="deleteAccount(user)"
                  class="btn btn-sm btn-secondary"
                  :disabled="user.id === auth.state.user?.id"
                >
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
  import Layout from '@/components/Layout.vue';
  import { useAdmin } from '@/composables/admin';
  import { useAuth } from '@/composables/auth';
  import { ask } from '@/composables/prompt';
  import { User } from '@/composables/api';

  const auth = useAuth();
  const admin = useAdmin();
  admin.load();

  /**
   * Asynchronous function that prompts the user to confirm changing the role of the provided 'user'.
   * If confirmed, it changes the user's role to either 'Nutzer' (if the current role is 'admin')
   * or 'Admin' (if the current role is 'Nutzer').
   * @param user - The user whose role is to be changed.
   */
  async function changeUserRole(user: User) {
    const shouldChange = await ask(
      'Rolle ändern',
      `Soll die Rolle des Benutzers <b>${
        user.name
      }</b> wirklich geändert zu <b>${
        user.role === 'admin' ? 'Nutzer' : 'Admin'
      }</b> werden?`,
      'Ändern',
    );

    if (!shouldChange) {
      return;
    }

    await admin.changeUserRole(user.id);
  }

  /**
   * Asynchronous function that prompts the user to confirm deleting the account of the provided 'user'.
   * If confirmed, it deletes the user's account using the 'admin.deleteAccount()' function.
   * @param user - The user whose account is to be deleted.
   */
  async function deleteAccount(user: User) {
    const shouldDelete = await ask(
      'Account löschen',
      `Soll das Account des Benutzers <b>${user.name}</b> wirklich gelöscht werden?`,
      'Löschen',
    );

    if (!shouldDelete) {
      return;
    }

    await admin.deleteAccount(user.id);
  }
</script>
