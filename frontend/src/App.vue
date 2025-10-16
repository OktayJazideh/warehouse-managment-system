<template>
  <div id="app">
    <div v-if="authStore.isAuthenticated" class="min-h-screen bg-gray-50">
      <!-- Navigation -->
      <nav class="bg-white shadow">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="flex h-16 justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <h1 class="text-xl font-bold text-gray-900">WMS</h1>
              </div>
              <div class="hidden md:ml-6 md:flex md:space-x-8">
                <router-link
                  v-for="item in navigation"
                  :key="item.name"
                  :to="item.to"
                  class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  active-class="border-primary-500 text-gray-900"
                >
                  <component :is="item.icon" class="mr-2 h-4 w-4" />
                  {{ item.name }}
                </router-link>
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-700">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
              <Menu as="div" class="relative">
                <MenuButton class="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  <UserCircleIcon class="h-8 w-8 text-gray-400" />
                </MenuButton>
                <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                  <MenuItem>
                    <router-link
                      to="/profile"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </router-link>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      @click="logout"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </a>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main content -->
      <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <router-view />
      </main>
    </div>
    
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import {
  HomeIcon,
  CubeIcon,
  ArchiveBoxIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  UsersIcon,
  UserCircleIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const authStore = useAuthStore()

const navigation = computed(() => {
  const items = [
    { name: 'Dashboard', to: '/', icon: HomeIcon },
    { name: 'Products', to: '/products', icon: CubeIcon },
    { name: 'Inventory', to: '/inventory', icon: ArchiveBoxIcon },
    { name: 'Transactions', to: '/transactions', icon: ArrowsRightLeftIcon },
    { name: 'Reports', to: '/reports', icon: ChartBarIcon },
  ]
  
  if (authStore.user?.role === 'admin') {
    items.push({ name: 'Users', to: '/users', icon: UsersIcon })
  }
  
  return items
})

const logout = async () => {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  authStore.checkAuth()
})
</script>