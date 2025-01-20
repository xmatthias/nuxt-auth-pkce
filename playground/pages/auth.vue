<script setup lang="ts">
const { signIn, user, fetchAuth } = useAuth()

async function onClick() {
  const data = await fetchAuth('http://localhost:5073/api/test')
  // const data = await fetchAuth('https://graph.microsoft.com/v1.0/me')
  console.log(data)
}
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

      <button @click="onClick()">
        Request Data
      </button>
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
