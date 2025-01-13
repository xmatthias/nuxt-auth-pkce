<script lang="ts" setup>
import { useAuth } from '../composables/auth'

const { isAuthenticated, signIn } = useAuth()
</script>

<template>
  <template v-if="isAuthenticated">
    <slot />
  </template>
  <slot
    v-else
    name="unauthenticated"
  >
    <p>
      You are not authenticated.

      <button @click="signIn">
        Sign in
      </button>
    </p>
  </slot>
</template>
