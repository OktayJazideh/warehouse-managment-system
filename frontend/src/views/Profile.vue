<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Profile</h1>
      <p class="text-gray-600">Manage your account settings</p>
    </div>

    <div class="max-w-2xl">
      <div class="card">
        <div class="card-body">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">First Name</label>
                <input
                  v-model="form.firstName"
                  type="text"
                  class="form-input"
                  required
                />
              </div>
              <div>
                <label class="form-label">Last Name</label>
                <input
                  v-model="form.lastName"
                  type="text"
                  class="form-input"
                  required
                />
              </div>
            </div>
            
            <div>
              <label class="form-label">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="form-input"
                required
              />
            </div>
            
            <div>
              <label class="form-label">Username</label>
              <input
                :value="authStore.user?.username"
                type="text"
                class="form-input bg-gray-100"
                readonly
              />
              <p class="text-sm text-gray-500 mt-1">Username cannot be changed</p>
            </div>
            
            <div>
              <label class="form-label">Role</label>
              <input
                :value="authStore.user?.role"
                type="text"
                class="form-input bg-gray-100"
                readonly
              />
            </div>
            
            <div v-if="message" :class="[
              'p-4 rounded-md',
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            ]">
              {{ message.text }}
            </div>
            
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="loading"
                class="btn-primary"
              >
                {{ loading ? 'Updating...' : 'Update Profile' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const loading = ref(false)
const message = ref(null)

const form = reactive({
  firstName: '',
  lastName: '',
  email: ''
})

const updateProfile = async () => {
  loading.value = true
  message.value = null
  
  const result = await authStore.updateProfile(form)
  
  if (result.success) {
    message.value = { type: 'success', text: 'Profile updated successfully!' }
  } else {
    message.value = { type: 'error', text: result.message }
  }
  
  loading.value = false
  
  setTimeout(() => {
    message.value = null
  }, 3000)
}

onMounted(() => {
  if (authStore.user) {
    form.firstName = authStore.user.firstName
    form.lastName = authStore.user.lastName
    form.email = authStore.user.email
  }
})
</script>