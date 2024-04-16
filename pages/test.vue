<template>
  <div>
    <table>
      <tr>
        <th>Company</th>
        <th>Contact</th>
        <th>Country</th>
      </tr>
      <tr>
        <td>Alfreds Futterkiste</td>
        <td>Maria Anders</td>
        <td>Germany</td>
      </tr>
      <tr>
        <td>Centro comercial Moctezuma</td>
        <td>Francisco Chang</td>
        <td>Mexico</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
const nuxt = useNuxtApp()
console.log(nuxt.$paypal?.version)

// const result = await useFetch('/api/user/info', {
//   method: 'GET'
// });
//
// console.log('User Info:', result.data);

</script>
