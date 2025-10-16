<template>
  <div>
    <div class="sm:flex sm:items-center mb-6">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-bold text-gray-900">Products</h1>
        <p class="text-gray-600">Manage your product catalog</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          v-if="canManage"
          type="button"
          class="btn-primary"
          @click="showAddModal = true"
        >
          Add Product
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search products..."
            class="form-input"
            @input="debouncedSearch"
          />
        </div>
        <div>
          <select v-model="filters.categoryId" class="form-input">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div>
          <select v-model="filters.isActive" class="form-input">
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Products Table -->
    <div class="card">
      <div class="card-body overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in products" :key="product.id">
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                  <div class="text-sm text-gray-500">{{ product.code }}</div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ product.Category?.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ formatPrice(product.unitPrice) }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ product.unit }}</td>
              <td class="px-6 py-4">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ product.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-medium space-x-2">
                <button class="text-indigo-600 hover:text-indigo-900">View</button>
                <button v-if="canManage" @click="editProduct(product)" class="text-indigo-600 hover:text-indigo-900">Edit</button>
                <button v-if="canManage" @click="deleteProduct(product.id)" class="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Product Modal -->
    <ProductModal
      :is-open="showAddModal"
      :product="selectedProduct"
      @close="closeModal"
      @saved="handleProductSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import ProductModal from '@/components/ProductModal.vue'

const authStore = useAuthStore()

const products = ref([])
const categories = ref([])
const loading = ref(false)
const showAddModal = ref(false)
const selectedProduct = ref(null)

const filters = ref({
  search: '',
  categoryId: '',
  isActive: ''
})

const canManage = computed(() => {
  return ['admin', 'warehouse_manager'].includes(authStore.user?.role)
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('fa-IR', {
    style: 'currency',
    currency: 'IRR'
  }).format(price)
}

let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadProducts()
  }, 300)
}

const loadProducts = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.search) params.append('search', filters.value.search)
    if (filters.value.categoryId) params.append('categoryId', filters.value.categoryId)
    if (filters.value.isActive) params.append('isActive', filters.value.isActive)

    const response = await api.get(`/products?${params}`)
    products.value = response.data.data.products
  } catch (error) {
    console.error('Failed to load products:', error)
  } finally {
    loading.value = false
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

const editProduct = (product) => {
  selectedProduct.value = product
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  selectedProduct.value = null
}

const handleProductSaved = () => {
  loadProducts()
}

const deleteProduct = async (productId) => {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      await api.delete(`/products/${productId}`)
      loadProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
      alert('Failed to delete product. Please try again.')
    }
  }
}

watch([() => filters.value.categoryId, () => filters.value.isActive], () => {
  loadProducts()
})

onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>