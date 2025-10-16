<template>
  <div>
    <div class="sm:flex sm:items-center mb-6">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-bold text-gray-900">Transactions</h1>
        <p class="text-gray-600">Track all inventory movements</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          v-if="canManage"
          type="button"
          class="btn-primary"
          @click="showAddModal = true"
        >
          New Transaction
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <select v-model="filters.type" class="form-input" @change="loadTransactions">
            <option value="">All Types</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>
        <div>
          <input
            v-model="filters.startDate"
            type="date"
            class="form-input"
            @change="loadTransactions"
          />
        </div>
        <div>
          <input
            v-model="filters.endDate"
            type="date"
            class="form-input"
            @change="loadTransactions"
          />
        </div>
        <div>
          <select v-model="filters.warehouseId" class="form-input" @change="loadTransactions">
            <option value="">All Warehouses</option>
            <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="card">
      <div class="card-body overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in transactions" :key="transaction.id">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ transaction.referenceNumber }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ formatDate(transaction.transactionDate) }}
              </td>
              <td class="px-6 py-4">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  getTypeColor(transaction.type)
                ]">
                  {{ transaction.type }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ transaction.Product?.name }}</div>
                  <div class="text-sm text-gray-500">{{ transaction.Product?.code }}</div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ transaction.Warehouse?.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ transaction.quantity }} {{ transaction.Product?.unit }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ transaction.User?.firstName }} {{ transaction.User?.lastName }}
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="transactions.length === 0" class="text-center py-8 text-gray-500">
          No transactions found
        </div>
      </div>
    </div>

    <!-- Transaction Modal -->
    <TransactionModal
      :is-open="showAddModal"
      @close="closeModal"
      @saved="handleTransactionSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import TransactionModal from '@/components/TransactionModal.vue'

const authStore = useAuthStore()

const transactions = ref([])
const warehouses = ref([])
const loading = ref(false)
const showAddModal = ref(false)

const filters = ref({
  type: '',
  startDate: '',
  endDate: '',
  warehouseId: ''
})

const canManage = computed(() => {
  return ['admin', 'warehouse_manager'].includes(authStore.user?.role)
})

const getTypeColor = (type) => {
  const colors = {
    inbound: 'bg-green-100 text-green-800',
    outbound: 'bg-red-100 text-red-800',
    transfer: 'bg-blue-100 text-blue-800',
    adjustment: 'bg-yellow-100 text-yellow-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const loadTransactions = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.type) params.append('type', filters.value.type)
    if (filters.value.startDate) params.append('startDate', filters.value.startDate)
    if (filters.value.endDate) params.append('endDate', filters.value.endDate)
    if (filters.value.warehouseId) params.append('warehouseId', filters.value.warehouseId)

    const response = await api.get(`/transactions?${params}`)
    transactions.value = response.data.data.transactions
  } catch (error) {
    console.error('Failed to load transactions:', error)
  } finally {
    loading.value = false
  }
}

const loadWarehouses = async () => {
  try {
    const response = await api.get('/warehouses')
    warehouses.value = response.data.data.warehouses
  } catch (error) {
    console.error('Failed to load warehouses:', error)
  }
}

const closeModal = () => {
  showAddModal.value = false
}

const handleTransactionSaved = () => {
  loadTransactions()
}

onMounted(() => {
  loadTransactions()
  loadWarehouses()
})
</script>