<template>
  <Layout title="Admin" :buttons="['back']">
    <div class="row my-5">
      <div class="col">
        <h2>Users</h2>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>
                <button class="btn btn-sm btn-secondary me-2">
                  <i class="fa fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-secondary">
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
  import { User } from '@/composables/api';
  import { ref, onMounted } from 'vue';
  import { useAdmin } from '@/composables/admin';

  const admin = useAdmin();
  const users = ref<User[]>([]);

  onMounted(async () => {
    users.value = await admin.getUsers;
  });
</script>
