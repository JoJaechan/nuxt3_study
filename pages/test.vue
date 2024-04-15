<template>
  <div>
  </div>
</template>

<script setup lang="ts">
const nuxt = useNuxtApp()
console.log(nuxt.$paypal?.version)

const result = await useFetch('/api/user/info', {
  method: 'GET'
});

console.log('User Info:', result.data);

</script>
