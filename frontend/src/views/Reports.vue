<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Reports</h1>
      <p class="text-gray-600">Generate and download reports</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Inventory Report -->
      <div class="card">
        <div class="card-body">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Inventory Report</h3>
          <p class="text-sm text-gray-600 mb-4">Generate a detailed inventory report for all products across warehouses.</p>
          
          <div class="space-y-4">
            <div>
              <label class="form-label">Warehouse</label>
              <select v-model="inventoryFilters.warehouseId" class="form-input">
                <option value="">All Warehouses</option>
                <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="form-label">Category</label>
              <select v-model="inventoryFilters.categoryId" class="form-input">
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="mt-6 flex space-x-3">
            <button @click="generateInventoryReport('json')" class="btn-primary">
              View Report
            </button>
            <button @click="generateInventoryReport('excel')" class="btn-secondary">
              Download Excel
            </button>
          </div>
        </div>
      </div>

      <!-- Transaction Report -->
      <div class="card">
        <div class="card-body">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Transaction Report</h3>
          <p class="text-sm text-gray-600 mb-4">Generate transaction reports for specific date ranges.</p>
          
          <div class="space-y-4">
            <div>
              <label class="form-label">Start Date</label>
              <input v-model="transactionFilters.startDate" type="date" class="form-input" />
            </div>
            <div>
              <label class="form-label">End Date</label>
              <input v-model="transactionFilters.endDate" type="date" class="form-input" />
            </div>
            <div>
              <label class="form-label">Transaction Type</label>
              <select v-model="transactionFilters.type" class="form-input">
                <option value="">All Types</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="transfer">Transfer</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
          </div>
          
          <div class="mt-6 flex space-x-3">
            <button @click="generateTransactionReport('json')" class="btn-primary">
              View Report
            </button>
            <button @click="generateTransactionReport('excel')" class="btn-secondary">
              Download Excel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Results Modal -->
    <div v-if="showResults" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">Report Results</h3>
          <button @click="showResults = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="max-h-96 overflow-y-auto">
          <pre class="text-sm bg-gray-100 p-4 rounded">{{ JSON.stringify(reportData, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const warehouses = ref([])
const categories = ref([])
const showResults = ref(false)
const reportData = ref(null)

const inventoryFilters = ref({
  warehouseId: '',
  categoryId: ''
})

const transactionFilters = ref({
  startDate: '',
  endDate: '',
  type: ''
})

const generateInventoryReport = async (format) => {
  try {
    const params = new URLSearchParams()
    if (inventoryFilters.value.warehouseId) params.append('warehouseId', inventoryFilters.value.warehouseId)
    if (inventoryFilters.value.categoryId) params.append('categoryId', inventoryFilters.value.categoryId)
    params.append('format', format)

    if (format === 'excel') {
      const response = await api.get(`/reports/inventory?${params}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `inventory-report-${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } else {
      const response = await api.get(`/reports/inventory?${params}`)
      reportData.value = response.data.data
      showResults.value = true
    }
  } catch (error) {
    console.error('Failed to generate inventory report:', error)
  }
}

const generateTransactionReport = async (format) => {
  try {
    const params = new URLSearchParams()
    if (transactionFilters.value.startDate) params.append('startDate', transactionFilters.value.startDate)
    if (transactionFilters.value.endDate) params.append('endDate', transactionFilters.value.endDate)
    if (transactionFilters.value.type) params.append('type', transactionFilters.value.type)
    params.append('format', format)

    if (format === 'excel') {
      const response = await api.get(`/reports/transactions?${params}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transaction-report-${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } else {
      const response = await api.get(`/reports/transactions?${params}`)
      reportData.value = response.data.data
      showResults.value = true
    }
  } catch (error) {
    console.error('Failed to generate transaction report:', error)
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

const loadCategories = async () => {
  try {
    const response = await api.get('/categories')
    categories.value = response.data.data.categories
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

onMounted(() => {
  loadWarehouses()
  loadCategories()
})
</script>