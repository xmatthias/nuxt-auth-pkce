<script setup lang="ts">
</script>

<template>
  <div>
    <ul>
      <li><NuxtLink to="/auth">Authenticated Route</NuxtLink></li>
      <li><NuxtLink to="/auth-autologin">Authenticated Route with Autologin</NuxtLink></li>
      <li><NuxtLink to="/noauth">No Auth Route</NuxtLink></li>
    </ul>
  </div>
</template>
