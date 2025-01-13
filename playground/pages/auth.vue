<script setup lang="ts">
const { signIn, user } = useAuth()
</script>

<template>
  <AuthGate>
    <div>
      <h1>Authenticated Route</h1>
      <b>Username: {{ user?.username }}</b>
      <p>Email: {{ user?.email }}</p>
      <p>Name: {{ user?.first_name }}</p>
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
