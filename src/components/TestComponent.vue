<template>
  <h1>
    Test {{ name }}
  </h1>

  <p>
    Hier steht noch mehr
  </p>

  <slot></slot>
</template>

<script setup lang="ts">

  defineProps<{
    name: string
  }>()

</script>