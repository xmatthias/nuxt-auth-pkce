<script lang="ts" setup>
import { watch } from 'vue'
import { useAuth } from '../composables/auth'

const props = withDefaults(defineProps<
  {
    autoLogin?: boolean
  }
>(), {
  // default props
  autoLogin: false,
})

const { isAuthenticated, signIn } = useAuth()

watch(isAuthenticated, (value) => {
  if (props.autoLogin) {
    if (value === false) {
      signIn()
    }
  }
}, { immediate: true })
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
