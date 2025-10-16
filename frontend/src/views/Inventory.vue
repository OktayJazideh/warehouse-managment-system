<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Inventory</h1>
      <p class="text-gray-600">Track your stock levels across all warehouses</p>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <select v-model="filters.warehouseId" class="form-input" @change="loadInventory">
            <option value="">All Warehouses</option>
            <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
              {{ warehouse.name }}
            </option>
          </select>
        </div>
        <div>
          <select v-model="filters.categoryId" class="form-input" @change="loadInventory">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="flex items-center">
            <input
              v-model="filters.lowStock"
              type="checkbox"
              class="h-4 w-4 text-primary-600 border-gray-300 rounded"
              @change="loadInventory"
            />
            <span class="ml-2 text-sm text-gray-700">Low Stock Only</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Inventory Table -->
    <div class="card">
      <div class="card-body overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in inventory" :key="`${item.productId}-${item.warehouseId}`">
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ item.Product?.name }}</div>
                  <div class="text-sm text-gray-500">{{ item.Product?.code }}</div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ item.Warehouse?.name }}</td>
              <td class="px-6 py-4">
                <span class="text-sm font-medium text-gray-900">{{ item.quantity }}</span>
                <span class="text-xs text-gray-500 ml-1">{{ item.Product?.unit }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ item.Product?.minStockLevel }}</td>
              <td class="px-6 py-4">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  getStockStatus(item.quantity, item.Product?.minStockLevel).color
                ]">
                  {{ getStockStatus(item.quantity, item.Product?.minStockLevel).text }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ item.location || '-' }}</td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="inventory.length === 0" class="text-center py-8 text-gray-500">
          No inventory data found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const inventory = ref([])
const warehouses = ref([])
const categories = ref([])
const loading = ref(false)

const filters = ref({
  warehouseId: '',
  categoryId: '',
  lowStock: false
})

const getStockStatus = (quantity, minStock) => {
  if (quantity <= 0) {
    return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' }
  } else if (quantity <= minStock) {
    return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
  } else {
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' }
  }
}

const loadInventory = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.warehouseId) params.append('warehouseId', filters.value.warehouseId)
    if (filters.value.categoryId) params.append('categoryId', filters.value.categoryId)
    if (filters.value.lowStock) params.append('lowStock', 'true')

    const response = await api.get(`/inventory?${params}`)
    inventory.value = response.data.data.inventory
  } catch (error) {
    console.error('Failed to load inventory:', error)
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

const loadCategories = async () => {
  try {
    const response = await api.get('/categories')
    categories.value = response.data.data.categories
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

onMounted(() => {
  loadInventory()
  loadWarehouses()
  loadCategories()
})
</script>