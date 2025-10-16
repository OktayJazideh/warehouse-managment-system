<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Users</h1>
      <p class="text-gray-600">Manage system users and permissions</p>
    </div>

    <div class="card">
      <div class="card-body overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</div>
                  <div class="text-sm text-gray-500">{{ user.username }}</div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  getRoleColor(user.role)
                ]">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ user.lastLogin ? formatDate(user.lastLogin) : 'Never' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const users = ref([])

const getRoleColor = (role) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-800',
    warehouse_manager: 'bg-blue-100 text-blue-800',
    viewer: 'bg-gray-100 text-gray-800'
  }
  return colors[role] || 'bg-gray-100 text-gray-800'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const loadUsers = async () => {
  try {
    const response = await api.get('/users')
    users.value = response.data.data.users
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

onMounted(() => {
  loadUsers()
})
</script>