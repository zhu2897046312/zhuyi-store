<script setup lang="ts">
import { useCookie } from 'nuxt/app'
import api from '../api'

const router = useRouter()
const route = useRoute()
const toast = useToast()

// 搜索功能
const showSearch = ref(false)
const searchQuery = ref('')

const toggleSearch = async () => {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    await nextTick()
  }
}

const submitSearch = async () => {
  const q = searchQuery.value.trim()
  if (!q) return

  // 当前项目还没有单独的搜索页：先把关键词带回首页，后续可在首页基于 query 做筛选
  await router.push({ path: '/', query: { q } })
  showSearch.value = false
}

// 购物车数量
const cartNum = useState<number>('cartNum', () => 0)

// 面包屑导航
const { data: breadcrumb, refresh: breadcrumbRefresh } = await useAsyncData('breadcrumb', async () => {
  console.log('🔍 面包屑调试信息:')
  console.log('  - route.path:', route.path)
  console.log('  - route.name:', route.name)
  console.log('  - route.params:', route.params)
  console.log('  - route.fullPath:', route.fullPath)
  
  if (route.path === '/') {
    console.log('  - 首页，返回空数组')
    return []
  }
  
  let out
  // 使用路径匹配，更可靠
  const path = route.path
  const params = route.params
  
  // 检查是否是分类页 /collections/[code]
  if (path.startsWith('/collections/') && params.code) {
    console.log('  - 分类页，调用 breadcrumb API (mode: 1)')
    console.log('  - category_code:', params.code)
    try {
      out = await api.shop.market.breadcrumb({ mode: '1', category_code: params.code as string })
      console.log('  - API 返回结果:', out)
      console.log('  - API 返回类型:', typeof out)
      console.log('  - out.list:', out?.list)
    } catch (error) {
      console.error('  - API 调用失败:', error)
      return []
    }
  } 
  // 检查是否是商品页 /product/[id]
  else if (path.startsWith('/product/') && params.id) {
    console.log('  - 商品页，调用 breadcrumb API (mode: 2)')
    console.log('  - product_id:', params.id)
    try {
      out = await api.shop.market.breadcrumb({ mode: '2', product_id: params.id as string })
      console.log('  - API 返回结果:', out)
      console.log('  - API 返回类型:', typeof out)
      console.log('  - out.list:', out?.list)
    } catch (error) {
      console.error('  - API 调用失败:', error)
      return []
    }
  } else {
    console.log('  - 其他页面，返回空数组')
    console.log('  - 路径不匹配分类页或商品页')
    return []
  }
  
  const breadcrumbList = out?.list || []
  console.log('  - 最终面包屑列表:', breadcrumbList)
  console.log('  - 列表长度:', breadcrumbList.length)
  return breadcrumbList
}, {
  watch: [() => route.path, () => route.params]
})

// 监听 breadcrumb 变化
watch(breadcrumb, (newVal) => {
  console.log('📦 breadcrumb 数据变化:', newVal)
}, { immediate: true, deep: true })

// 构建面包屑项（包含 Home）
const breadcrumbItems = computed(() => {
  const items = [
    {
      label: 'Home',
      to: '/'
    }
  ]
  
  console.log('🔨 构建面包屑项:')
  console.log('  - breadcrumb.value:', breadcrumb.value)
  console.log('  - 是否为数组:', Array.isArray(breadcrumb.value))
  
  if (breadcrumb.value && Array.isArray(breadcrumb.value)) {
    breadcrumb.value.forEach((item: any, index: number) => {
      console.log(`  - 处理第 ${index + 1} 项:`, item)
      if (item && item.title && item.link) {
        items.push({
          label: item.title,
          to: item.link
        })
      } else {
        console.log(`  - 第 ${index + 1} 项格式不正确，跳过`)
      }
    })
  }
  
  console.log('  - 最终面包屑项:', items)
  return items
})

// 用户态
const accessToken = useCookie<string | null>('accessToken')
const isAuthed = computed(() => !!accessToken.value)

const userMenuItems = computed(() => {
  if (!isAuthed.value) {
    return [
      [
        { label: 'Login', to: '/login', icon: 'i-lucide-log-in' },
        { label: 'Register', to: '/register', icon: 'i-lucide-user-plus' }
      ]
    ]
  }

  return [
    [
      {
        label: 'My Cart',
        icon: 'i-lucide-shopping-cart',
        onSelect: () => {
          router.push('/cart')
        }
      }
    ],
    [
      {
        label: 'Logout',
        icon: 'i-lucide-log-out',
        onSelect: async () => {
          accessToken.value = null
          toast.add({ title: 'Logged out', color: 'success' })
          await router.push('/login')
        }
      }
    ]
  ]
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Header 导航栏 - 使用 NuxtUI 的 UHeader -->
    <div class="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
      <UHeader>
        <!-- Left: Logo -->
        <template #left>
          <NuxtLink to="/" class="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <AppLogo class="h-7 w-auto" />
            <span class="hidden sm:inline">Store</span>
          </NuxtLink>
        </template>

        <!-- Center: Nav (default slot) -->
        <BaseNav />

        <!-- Right: actions -->
        <template #right>
          <div class="flex items-center gap-1.5">
            <!-- Search toggle -->
            <UButton
              variant="ghost"
              color="neutral"
              size="sm"
              icon="i-lucide-search"
              aria-label="Search"
              @click="toggleSearch"
            />

            <!-- Cart -->
            <UButton
              variant="ghost"
              color="neutral"
              size="sm"
              icon="i-lucide-shopping-cart"
              aria-label="Cart"
              class="relative"
              @click="router.push('/cart')"
            >
              <span
                v-if="cartNum > 0"
                class="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] leading-5 text-center"
              >
                {{ cartNum > 99 ? '99+' : cartNum }}
              </span>
            </UButton>

            <!-- User -->
            <UDropdownMenu :items="userMenuItems" :popper="{ placement: 'bottom-end', offsetDistance: 6 }">
              <UButton variant="ghost" color="neutral" size="sm" aria-label="User">
                <UAvatar
                  size="xs"
                  :alt="isAuthed ? 'User' : 'Guest'"
                  icon="i-lucide-user"
                />
              </UButton>
            </UDropdownMenu>
          </div>
        </template>
      </UHeader>

      <!-- Expandable search bar (top area) -->
      <div v-if="showSearch" class="border-t border-gray-200/70 dark:border-gray-800/70">
        <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3">
          <div class="flex items-center gap-2">
            <UInput
              v-model="searchQuery"
              placeholder="Search products..."
              icon="i-lucide-search"
              size="lg"
              class="w-full"
              @keydown.enter.prevent="submitSearch"
            />
            <UButton color="primary" size="lg" @click="submitSearch">
              Search
            </UButton>
            <UButton variant="ghost" color="neutral" size="lg" @click="showSearch = false">
              Cancel
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 面包屑导航 -->
    <div v-if="breadcrumbItems && breadcrumbItems.length > 1" class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <UBreadcrumb :links="breadcrumbItems" />
    </div>

    <!-- 主要内容 -->
    <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer - 使用 NuxtUI 样式 -->
    <UFooter class="mt-auto border-t">
      <template #top>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- 关于我们 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">关于我们</h3>
              <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <NuxtLink to="/about" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    公司简介
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/contact" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    联系我们
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <!-- 客户服务 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">客户服务</h3>
              <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <NuxtLink to="/shipping" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    配送信息
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/returns" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    退换货政策
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/faq" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    常见问题
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <!-- 法律信息 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">法律信息</h3>
              <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <NuxtLink to="/terms" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    服务条款
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/privacy" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    隐私政策
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <!-- 关注我们 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">关注我们</h3>
              <div class="flex space-x-4">
                <UButton
                  to="#"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-simple-icons-facebook"
                  aria-label="Facebook"
                />
                <UButton
                  to="#"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-simple-icons-twitter"
                  aria-label="Twitter"
                />
                <UButton
                  to="#"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-simple-icons-instagram"
                  aria-label="Instagram"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #bottom>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; {{ new Date().getFullYear() }} 版权所有. 保留所有权利.</p>
          </div>
        </div>
      </template>
    </UFooter>
  </div>
</template>
