import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)
  
  const isAuthenticated = computed(() => !!token.value)
  
  const setAuth = (userData, authToken) => {
    user.value = userData
    token.value = authToken
    localStorage.setItem('token', authToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }
  
  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }
  
  const login = async (credentials) => {
    loading.value = true
    try {
      const response = await api.post('/auth/login', credentials)
      const { user: userData, token: authToken } = response.data.data
      setAuth(userData, authToken)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    } finally {
      loading.value = false
    }
  }
  
  const logout = () => {
    clearAuth()
  }
  
  const checkAuth = async () => {
    if (!token.value) return
    
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      const response = await api.get('/auth/me')
      user.value = response.data.data.user
    } catch (error) {
      clearAuth()
    }
  }
  
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/me', profileData)
      user.value = response.data.data.user
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      }
    }
  }
  
  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    updateProfile
  }
})