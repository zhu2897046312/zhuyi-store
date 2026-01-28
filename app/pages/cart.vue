<script setup lang="ts">
import api from '../api'
import type { CartList } from '../api/type'
import { getProductImage } from '../utils/auth'

// 使用默认布局
definePageMeta({
  layout: 'default'
})

const router = useRouter()
const toast = useToast()
const cartNum = useState('cartNum', () => 0)

// SEO
useHead({
  title: 'Shopping Cart',
  meta: [
    { name: 'description', content: 'View and manage your shopping cart' },
    { name: 'keywords', content: 'Shopping Cart' }
  ]
})

// 获取购物车列表
const { data: cart_list, refresh, pending } = await useAsyncData('cart-list', async () => {
  try {
    const res: any = await api.shop.cart.list()
    
    // 处理不同的响应格式
    const list = Array.isArray(res) ? res : (res?.list || [])
    
    // 计算总数量
    let count = 0
    list.forEach((it: any) => {
      count += it.quantity
    })
    cartNum.value = count
    
    return list as CartList
  } catch (error) {
    console.error('Failed to fetch cart:', error)
    return [] as CartList
  }
})

// 锁定状态，防止重复操作
const lock = ref(false)

// 计算总金额（原价）
const total_amount = computed(() => {
  if (!cart_list.value) return 0
  let total = 0
  cart_list.value.forEach((item: any) => {
    total += Number(item.original_price) * item.quantity
  })
  return total
})

// 计算实付金额（折扣后）
const pay_amount = computed(() => {
  if (!cart_list.value) return 0
  let total = 0
  cart_list.value.forEach((item: any) => {
    total += Number(item.price) * item.quantity
  })
  return total
})

// 计算折扣金额
const discount_amount = computed(() => {
  return total_amount.value - pay_amount.value
})

// 处理数量变化
const handleChangeCartItem = async (index: number, newQuantity: number) => {
  if (!cart_list.value || lock.value) return
  
  const cartItem = cart_list.value[index]
  if (!cartItem) return
  
  const oldQuantity = cartItem.quantity
  const quantityDiff = newQuantity - oldQuantity
  
  if (quantityDiff === 0) return
  
  lock.value = true
  
  try {
    await api.shop.cart.act({
      product_id: cartItem.product_id,
      sku_id: cartItem.sku_id,
      quantity: Math.abs(quantityDiff),
      add: quantityDiff > 0
    })
    
    await refresh()
    
    toast.add({
      title: 'Cart Updated',
      description: 'Item quantity has been updated',
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Update Failed',
      description: error.message || 'Failed to update cart item',
      color: 'error'
    })
  } finally {
    lock.value = false
  }
}

// 删除购物车商品
const handleRemoveCartItem = async (index: number) => {
  if (!cart_list.value || lock.value) return
  
  const cartItem = cart_list.value[index]
  if (!cartItem) return
  
  lock.value = true
  
  try {
    await api.shop.cart.act({
      product_id: cartItem.product_id,
      sku_id: cartItem.sku_id,
      quantity: cartItem.quantity,
      add: false
    })
    
    await refresh()
    
    toast.add({
      title: 'Item Removed',
      description: 'Item has been removed from cart',
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Remove Failed',
      description: error.message || 'Failed to remove item from cart',
      color: 'error'
    })
  } finally {
    lock.value = false
  }
}

// 跳转到结算页
const handleToCheckout = () => {
  router.push('/checkout')
}

// 格式化价格
const formatPrice = (price: unknown) => {
  const num = Number(price)
  return !isNaN(num) ? `$${num.toFixed(2)}` : '$0.00'
}

// 处理商品图片
const getProductThumb = (thumb: string) => {
  return getProductImage(thumb)
}

// 确认删除对话框状态
const showDeleteConfirm = ref(false)
const itemToDelete = ref<number | null>(null)

const openDeleteConfirm = (index: number) => {
  itemToDelete.value = index
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (itemToDelete.value !== null) {
    handleRemoveCartItem(itemToDelete.value)
    itemToDelete.value = null
  }
  showDeleteConfirm.value = false
}
</script>

<template>
  <div class="cart-page">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Shopping Cart
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Review and manage your items
      </p>
    </div>

    <!-- 加载状态 -->
    <div v-if="pending" class="flex justify-center items-center py-20">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-600" />
    </div>

    <!-- 购物车内容 -->
    <div v-else-if="cart_list && cart_list.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 购物车商品列表 -->
      <div class="lg:col-span-2 space-y-4">
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Cart Items ({{ cart_list.length }})
            </h2>
          </template>

          <div class="space-y-4">
            <div
              v-for="(item, index) in cart_list"
              :key="item.id"
              class="cart-item flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
            >
              <!-- 商品图片 -->
              <div class="cart-item-thumb flex-shrink-0">
                <NuxtLink :to="`/product/${item.product_id}`" class="block">
                  <div class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <img
                      :src="getProductThumb(item.thumb)"
                      :alt="item.title"
                      class="w-full h-full object-cover"
                      @error="(e: any) => { e.target.src = '/placeholder-product.jpg' }"
                    />
                  </div>
                </NuxtLink>
              </div>

              <!-- 商品信息 -->
              <div class="cart-item-info flex-1 min-w-0">
                <div class="cart-item-title mb-1">
                  <NuxtLink
                    :to="`/product/${item.product_id}`"
                    class="text-base font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2"
                  >
                    {{ item.title }}
                  </NuxtLink>
                </div>
                <div
                  v-if="item.sku_title && item.sku_title.length > 0"
                  class="cart-item-desc text-sm text-gray-500 dark:text-gray-400 mb-2"
                >
                  Specification: {{ item.sku_title }}
                </div>
                
                <!-- 价格 -->
                <div class="flex items-baseline gap-2">
                  <span class="text-lg font-semibold text-[#ff4d4f] dark:text-red-400">
                    {{ formatPrice(item.price) }}
                  </span>
                  <span
                    v-if="Number(item.price) < Number(item.original_price)"
                    class="text-sm text-gray-500 dark:text-gray-400 line-through"
                  >
                    {{ formatPrice(item.original_price) }}
                  </span>
                </div>
              </div>

              <!-- 数量控制 -->
              <div class="cart-item-quantity flex-shrink-0">
                <UInputNumber
                  v-model="item.quantity"
                  :min="1"
                  :max="50"
                  :disabled="lock"
                  size="sm"
                  @update:model-value="(val: number | null) => val !== null && handleChangeCartItem(index, val)"
                />
              </div>

              <!-- 删除按钮 -->
              <div class="cart-item-action flex-shrink-0">
                <UButton
                  variant="ghost"
                  color="error"
                  size="sm"
                  icon="i-lucide-trash-2"
                  :disabled="lock"
                  @click="openDeleteConfirm(index)"
                >
                  Remove
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- 订单摘要 -->
      <div class="lg:col-span-1">
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Order Summary
            </h2>
          </template>

          <div class="space-y-4">
            <!-- 商品小计 -->
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">Items Subtotal</span>
              <span class="text-gray-900 dark:text-white font-medium">
                {{ formatPrice(total_amount) }}
              </span>
            </div>

            <!-- 折扣 -->
            <div
              v-if="discount_amount > 0"
              class="flex justify-between items-center"
            >
              <span class="text-gray-600 dark:text-gray-400">Discount</span>
              <span class="text-green-600 dark:text-green-400 font-medium">
                -{{ formatPrice(discount_amount) }}
              </span>
            </div>

            <!-- 分隔线 -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div class="flex justify-between items-center">
                <span class="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                <span class="text-2xl font-bold text-[#ff4d4f] dark:text-red-400">
                  {{ formatPrice(pay_amount) }}
                </span>
              </div>
            </div>

            <!-- 提示信息 -->
            <p class="text-sm text-gray-500 dark:text-gray-400 pt-2">
              Tax included. Shipping calculated at checkout.
            </p>

            <!-- 结算按钮 -->
            <UButton
              color="primary"
              size="lg"
              block
              icon="i-lucide-shopping-bag"
              :disabled="lock || pending"
              @click="handleToCheckout"
            >
              Proceed to Checkout
            </UButton>
          </div>
        </UCard>
      </div>
    </div>

    <!-- 空购物车状态 -->
    <UEmptyState
      v-else
      icon="i-lucide-shopping-cart"
      title="Your cart is empty"
      description="Add some items to your cart to continue shopping"
    >
      <template #actions>
        <UButton
          color="primary"
          size="lg"
          icon="i-lucide-arrow-left"
          @click="router.push('/')"
        >
          Continue Shopping
        </UButton>
      </template>
    </UEmptyState>

    <!-- 删除确认对话框 -->
    <UModal v-model="showDeleteConfirm">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Remove Item
          </h3>
        </template>

        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Are you sure you want to remove this item from your cart?
        </p>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              variant="ghost"
              color="neutral"
              @click="showDeleteConfirm = false"
            >
              Cancel
            </UButton>
            <UButton
              color="error"
              @click="confirmDelete"
            >
              Remove
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>


<style scoped>
.cart-page {
  width: 100%;
}

.cart-item {
  transition: all 0.2s ease;
}

.cart-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.dark .cart-item:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .cart-item {
    flex-wrap: wrap;
  }
  
  .cart-item-quantity,
  .cart-item-action {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
