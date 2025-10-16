<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">Add New Transaction</h3>
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
            <label class="form-label">Transaction Type *</label>
            <select v-model="form.type" class="form-input" required>
              <option value="">Select Type</option>
              <option value="inbound">Inbound (Stock In)</option>
              <option value="outbound">Outbound (Stock Out)</option>
              <option value="adjustment">Adjustment</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div>
            <label class="form-label">Transaction Date</label>
            <input
              v-model="form.transactionDate"
              type="date"
              class="form-input"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Product *</label>
            <select v-model="form.productId" class="form-input" required>
              <option value="">Select Product</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.code }} - {{ product.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="form-label">Warehouse *</label>
            <select v-model="form.warehouseId" class="form-input" required>
              <option value="">Select Warehouse</option>
              <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                {{ warehouse.code }} - {{ warehouse.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Quantity *</label>
            <input
              v-model.number="form.quantity"
              type="number"
              class="form-input"
              placeholder="0"
              min="1"
              required
            />
          </div>
          <div>
            <label class="form-label">Unit Cost</label>
            <input
              v-model.number="form.unitCost"
              type="number"
              class="form-input"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div v-if="form.type === 'inbound'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Supplier Name</label>
            <input
              v-model="form.supplierName"
              type="text"
              class="form-input"
              placeholder="Supplier name"
            />
          </div>
        </div>

        <div v-if="form.type === 'outbound'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Customer Name</label>
            <input
              v-model="form.customerName"
              type="text"
              class="form-input"
              placeholder="Customer name"
            />
          </div>
        </div>

        <div>
          <label class="form-label">Reason</label>
          <input
            v-model="form.reason"
            type="text"
            class="form-input"
            placeholder="Reason for transaction"
          />
        </div>

        <div>
          <label class="form-label">Notes</label>
          <textarea
            v-model="form.notes"
            class="form-input"
            rows="3"
            placeholder="Additional notes"
          ></textarea>
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
            {{ loading ? 'Creating...' : 'Create Transaction' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/services/api'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const error = ref('')
const products = ref([])
const warehouses = ref([])

const form = reactive({
  type: '',
  productId: '',
  warehouseId: '',
  quantity: 1,
  unitCost: 0,
  reason: '',
  notes: '',
  supplierName: '',
  customerName: '',
  transactionDate: new Date().toISOString().split('T')[0]
})

const resetForm = () => {
  form.type = ''
  form.productId = ''
  form.warehouseId = ''
  form.quantity = 1
  form.unitCost = 0
  form.reason = ''
  form.notes = ''
  form.supplierName = ''
  form.customerName = ''
  form.transactionDate = new Date().toISOString().split('T')[0]
  error.value = ''
}

const loadProducts = async () => {
  try {
    const response = await api.get('/products?limit=1000')
    products.value = response.data.data.products
  } catch (err) {
    console.error('Failed to load products:', err)
  }
}

const loadWarehouses = async () => {
  try {
    const response = await api.get('/warehouses')
    warehouses.value = response.data.data.warehouses
  } catch (err) {
    console.error('Failed to load warehouses:', err)
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
    // Clean form data
    const formData = {
      type: form.type,
      productId: form.productId,
      warehouseId: form.warehouseId,
      quantity: parseInt(form.quantity),
      unitCost: form.unitCost ? parseFloat(form.unitCost) : undefined,
      reason: form.reason || undefined,
      notes: form.notes || undefined,
      supplierName: form.supplierName || undefined,
      customerName: form.customerName || undefined,
      transactionDate: form.transactionDate || undefined
    }

    await api.post('/transactions', formData)

    emit('saved')
    closeModal()
  } catch (err) {
    console.error('Transaction creation error:', err)
    error.value = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'An error occurred while creating the transaction'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProducts()
  loadWarehouses()
})
</script>