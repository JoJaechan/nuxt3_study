<script setup lang="ts">
const nuxt = useNuxtApp()

console.log(nuxt.$paypal?.version)
</script>


<!--<script setup lang="ts">-->
<!--const { data, error, execute, refresh } = await useFetch('/api/posts')-->
<!--</script>-->

<!--<template>-->
<!--  <div>-->
<!--    <p>{{ data }}</p>-->
<!--    <button @click="refresh">Refresh data</button>-->
<!--  </div>-->
<!--</template>-->
