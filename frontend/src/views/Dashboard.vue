<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-600">Welcome back, {{ authStore.user?.firstName }}!</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <component :is="stat.icon" class="h-8 w-8" :class="stat.iconColor" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="card">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Recent Transactions</h3>
        <div class="flow-root">
          <ul class="-my-3 divide-y divide-gray-200">
            <li v-for="transaction in recentTransactions" :key="transaction.id" class="py-3 flex justify-between items-center">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ transaction.Product?.name }}</p>
                <p class="text-sm text-gray-500">{{ transaction.referenceNumber }} • {{ formatDate(transaction.transactionDate) }}</p>
              </div>
              <div class="flex items-center">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  transaction.type === 'inbound' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ transaction.type }}
                </span>
                <span class="ml-2 text-sm font-medium text-gray-900">{{ transaction.quantity }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  CubeIcon,
  ArchiveBoxIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()

const stats = ref([
  { label: 'Total Products', value: '0', icon: CubeIcon, iconColor: 'text-blue-500' },
  { label: 'Total Items', value: '0', icon: ArchiveBoxIcon, iconColor: 'text-green-500' },
  { label: 'Warehouses', value: '0', icon: ArrowTrendingUpIcon, iconColor: 'text-purple-500' },
  { label: 'Low Stock', value: '0', icon: ExclamationTriangleIcon, iconColor: 'text-red-500' },
])

const recentTransactions = ref([])

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const loadDashboardData = async () => {
  try {
    const [overviewResponse, transactionsResponse] = await Promise.all([
      api.get('/dashboard/overview'),
      api.get('/transactions?limit=5')
    ])

    const overview = overviewResponse.data.data.overview
    stats.value[0].value = overview.totalProducts.toString()
    stats.value[1].value = overview.totalItems.toString()
    stats.value[2].value = overview.totalWarehouses.toString()
    stats.value[3].value = overview.lowStockItems.toString()

    recentTransactions.value = transactionsResponse.data.data.transactions
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>