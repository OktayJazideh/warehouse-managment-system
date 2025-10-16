<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">
          {{ product?.id ? 'Edit Product' : 'Add New Product' }}
        </h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-4">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Product Code *</label>
            <input
              v-model="form.code"
              type="text"
              class="form-input"
              placeholder="e.g. PRD001"
              required
            />
          </div>
          <div>
            <label class="form-label">Product Name *</label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="Product name"
              required
            />
          </div>
        </div>

        <div>
          <label class="form-label">Category *</label>
          <select v-model="form.categoryId" class="form-input" required>
            <option value="">Select Category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="form-label">Description</label>
          <textarea
            v-model="form.description"
            class="form-input"
            rows="3"
            placeholder="Product description"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="form-label">Unit *</label>
            <input
              v-model="form.unit"
              type="text"
              class="form-input"
              placeholder="e.g. piece, kg, liter"
              required
            />
          </div>
          <div>
            <label class="form-label">Unit Price *</label>
            <input
              v-model.number="form.unitPrice"
              type="number"
              class="form-input"
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label class="form-label">Cost Price</label>
            <input
              v-model.number="form.costPrice"
              type="number"
              class="form-input"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Min Stock Level</label>
            <input
              v-model.number="form.minStockLevel"
              type="number"
              class="form-input"
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label class="form-label">Max Stock Level</label>
            <input
              v-model.number="form.maxStockLevel"
              type="number"
              class="form-input"
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Weight (kg)</label>
            <input
              v-model.number="form.weight"
              type="number"
              class="form-input"
              placeholder="0"
              min="0"
              step="0.001"
            />
          </div>
          <div>
            <label class="form-label">Dimensions</label>
            <input
              v-model="form.dimensions"
              type="text"
              class="form-input"
              placeholder="e.g. 10x5x2 cm"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Barcode</label>
            <input
              v-model="form.barcode"
              type="text"
              class="form-input"
              placeholder="Barcode"
            />
          </div>
          <div>
            <label class="form-label">SKU</label>
            <input
              v-model="form.sku"
              type="text"
              class="form-input"
              placeholder="SKU"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary"
          >
            {{ loading ? 'Saving...' : (product?.id ? 'Update Product' : 'Add Product') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import api from '@/services/api'

const props = defineProps({
  isOpen: Boolean,
  product: Object
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const error = ref('')
const categories = ref([])

const form = reactive({
  code: '',
  name: '',
  description: '',
  categoryId: '',
  unit: '',
  unitPrice: 0,
  costPrice: 0,
  minStockLevel: 0,
  maxStockLevel: null,
  weight: null,
  dimensions: '',
  barcode: '',
  sku: ''
})

const resetForm = () => {
  form.code = ''
  form.name = ''
  form.description = ''
  form.categoryId = ''
  form.unit = ''
  form.unitPrice = 0
  form.costPrice = 0
  form.minStockLevel = 0
  form.maxStockLevel = null
  form.weight = null
  form.dimensions = ''
  form.barcode = ''
  form.sku = ''
  error.value = ''
}

const loadCategories = async () => {
  try {
    const response = await api.get('/categories')
    categories.value = response.data.data.categories
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const submitForm = async () => {
  loading.value = true
  error.value = ''

  try {
    // Clean form data - remove empty strings and convert to appropriate types
    const formData = {
      code: form.code,
      name: form.name,
      description: form.description || undefined,
      categoryId: form.categoryId,
      unit: form.unit,
      unitPrice: parseFloat(form.unitPrice),
      costPrice: form.costPrice ? parseFloat(form.costPrice) : undefined,
      minStockLevel: form.minStockLevel ? parseInt(form.minStockLevel) : undefined,
      maxStockLevel: form.maxStockLevel ? parseInt(form.maxStockLevel) : undefined,
      weight: form.weight ? parseFloat(form.weight) : undefined,
      dimensions: form.dimensions || undefined,
      barcode: form.barcode || undefined,
      sku: form.sku || undefined
    }

    if (props.product?.id) {
      // Update existing product
      await api.put(`/products/${props.product.id}`, formData)
    } else {
      // Create new product
      await api.post('/products', formData)
    }

    emit('saved')
    closeModal()
  } catch (err) {
    console.error('Form submission error:', err)
    error.value = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'An error occurred while saving the product'
  } finally {
    loading.value = false
  }
}

// Watch for product changes to populate form
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    form.code = newProduct.code || ''
    form.name = newProduct.name || ''
    form.description = newProduct.description || ''
    form.categoryId = newProduct.categoryId || ''
    form.unit = newProduct.unit || ''
    form.unitPrice = newProduct.unitPrice || 0
    form.costPrice = newProduct.costPrice || 0
    form.minStockLevel = newProduct.minStockLevel || 0
    form.maxStockLevel = newProduct.maxStockLevel
    form.weight = newProduct.weight
    form.dimensions = newProduct.dimensions || ''
    form.barcode = newProduct.barcode || ''
    form.sku = newProduct.sku || ''
  }
}, { immediate: true })

onMounted(() => {
  loadCategories()
})
</script>