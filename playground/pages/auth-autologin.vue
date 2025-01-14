<script setup lang="ts">
const { user } = useAuth()
</script>

<template>
  <AuthGate auto-login>
    <div>
      <h1>Authenticated Route</h1>
      <b>Username: {{ user?.username }}</b>
      <p>Name: {{ user?.name }}</p>
      <p>Roles: {{ user?.roles }}</p>

      <pre>{{ user }}</pre>
      <hr>
    </div>
    <template #unauthenticated>
      <p>
        You are not authenticated.
        Redirecting to sign in...
      </p>
    </template>
  </AuthGate>
</template>
