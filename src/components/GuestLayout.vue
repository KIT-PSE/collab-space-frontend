<template>
  <main class="container">
    <div class="row justify-content-center">
      <div class="col-md-6 mt-5">
        <div class="d-flex justify-content-center">
          <router-link to="/">
            <img src="@/assets/logo.png" alt="CollabSpace" height="250" />
          </router-link>
        </div>
        <div class="mt-5">
          <slot></slot>
        </div>
      </div>
    </div>
  </main>
</template>
