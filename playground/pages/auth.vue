<script setup lang="ts">
const { signIn, user } = useAuth()
</script>

<template>
  <AuthGate>
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
        <button @click="signIn">
          Sign in
        </button>
      </p>
    </template>
  </AuthGate>
</template>
