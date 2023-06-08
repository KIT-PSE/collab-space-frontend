<template>
  <Layout title="Admin" :buttons="['back']">
    <div class="row my-5">
      <div class="col-md-7">
        <h2>Users</h2>
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
              <td>{{ user.name }} <span v-if="user.role === 'admin'" class="badge text-bg-danger ms-1">Admin</span></td>
              <td>{{ user.email }}</td>
              <td>{{ user.organization }}</td>
              <td class="d-flex justify-content-end">
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
  import { useAdmin } from '@/composables/admin';

  const admin = useAdmin();
  admin.load();
</script>
