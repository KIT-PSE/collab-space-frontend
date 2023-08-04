<template>
  <main
    class="container py-5 flex-grow-1 d-flex justify-content-center align-items-center"
  >
    <div class="col-md-6">
      <div class="d-flex justify-content-center">
        <router-link to="/">
          <img src="@/assets/logo.png" alt="CollabSpace" height="250" />
        </router-link>
      </div>
      <div class="mt-5">
        <slot></slot>
      </div>
    </div>
  </main>
</template>
