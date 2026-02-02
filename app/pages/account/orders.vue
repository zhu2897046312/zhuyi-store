<script setup lang="ts">
import api from '../../api'
import type { OrderFrontQueryVo, OrderListResponse } from '../../api/type'
import { OrderStatus, OrderStatusLabel } from '../../api/type'

definePageMeta({ layout: 'default' })

const router = useRouter()
const toast = useToast()
const accessToken = useCookie('accessToken')
const isAuthed = computed(() => !!accessToken.value)

// 登录验证
if (!isAuthed.value) {
  await navigateTo('/login?redirect=/account/orders')
}

// 分页参数
const page = ref(1)
const pageSize = ref(10)

// 订单状态筛选
const selectedStatus = ref<OrderStatus | null>(null)

// 状态选项
const statusOptions = [
  { value: null, label: 'All Orders' },
  { value: OrderStatus.PendingPayment, label: OrderStatusLabel[OrderStatus.PendingPayment] },
  { value: OrderStatus.PendingShipment, label: OrderStatusLabel[OrderStatus.PendingShipment] },
  { value: OrderStatus.Shipped, label: OrderStatusLabel[OrderStatus.Shipped] },
  { value: OrderStatus.Completed, label: OrderStatusLabel[OrderStatus.Completed] },
  { value: OrderStatus.Closed, label: OrderStatusLabel[OrderStatus.Closed] },
  { value: OrderStatus.Invalid, label: OrderStatusLabel[OrderStatus.Invalid] }
]

// 获取订单列表
const { data: orderData, pending, refresh } = await useAsyncData<OrderListResponse>(
  'order-list',
  async () => {
    try {
      const params: any = {
        page_no: page.value,
        page_size: pageSize.value
      }
      if (selectedStatus.value !== null) {
        params.status = selectedStatus.value
      }
      return await api.shop.order.list(params)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.add({
        title: 'Error',
        description: 'Failed to load orders',
        color: 'error'
      })
      return { list: [], total: 0 }
    }
  },
  {
    watch: [page, selectedStatus]
  }
)

// 订单列表
const orders = computed(() => {
  return orderData.value?.list || []
})

// 总订单数
const totalOrders = computed(() => {
  return orderData.value?.total || 0
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(totalOrders.value / pageSize.value)
})

// 获取订单状态颜色
const getStatusColor = (state: OrderStatus) => {
  switch (state) {
    case OrderStatus.PendingPayment:
      return 'warning'
    case OrderStatus.PendingShipment:
      return 'info'
    case OrderStatus.Shipped:
    case OrderStatus.Completed:
      return 'success'
    case OrderStatus.Closed:
    case OrderStatus.Invalid:
      return 'error'
    default:
      return 'neutral'
  }
}

// 获取订单状态文本
const getStatusLabel = (state: OrderStatus) => {
  return OrderStatusLabel[state] || 'Unknown Status'
}

// 格式化价格
const formatPrice = (price: unknown) => {
  const num = Number(price)
  return !isNaN(num) ? `$${num.toFixed(2)}` : '$0.00'
}

// 格式化日期
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

// 查看订单详情
const viewOrder = (order: OrderFrontQueryVo) => {
  router.push(`/order-detail/${order.code}`)
}

// 切换状态筛选
const handleStatusChange = (status: OrderStatus | null) => {
  selectedStatus.value = status
  page.value = 1 // 重置到第一页
}

// 切换页码
const handlePageChange = (newPage: number) => {
  page.value = newPage
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

useHead({
  title: 'My Orders',
  meta: [{ name: 'description', content: 'View your order history' }]
})
</script>

<template>
  <div class="orders-page max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-3">
        <div class="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
          <UIcon name="i-lucide-receipt" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          My Orders
        </h1>
      </div>
      <p class="text-gray-600 dark:text-gray-400 ml-14">
        View and manage your order history
      </p>
    </div>

    <!-- 筛选和统计 -->
    <div class="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <UFormField label="Filter by Status" class="w-48">
          <USelect
            v-model="selectedStatus"
            :items="statusOptions"
            placeholder="All Orders"
            size="lg"
            @update:model-value="handleStatusChange"
          />
        </UFormField>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <span class="font-medium">{{ totalOrders }}</span> order{{ totalOrders !== 1 ? 's' : '' }} found
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="pending" class="flex justify-center items-center py-20">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-600" />
    </div>

    <!-- 订单列表 -->
    <div v-else-if="orders && orders.length > 0" class="space-y-4">
      <UCard
        v-for="order in orders"
        :key="order.id"
        class="hover:shadow-lg transition-all cursor-pointer"
        @click="viewOrder(order)"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Order #{{ order.code }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ formatDate(order.payment_time) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <UBadge
                :color="getStatusColor(order.state as OrderStatus)"
                variant="subtle"
                size="lg"
              >
                {{ getStatusLabel(order.state as OrderStatus) }}
              </UBadge>
              <UButton
                variant="ghost"
                color="primary"
                icon="i-lucide-arrow-right"
                size="sm"
                @click.stop="viewOrder(order)"
              >
                View Details
              </UButton>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <!-- 订单金额信息 -->
          <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div class="flex items-center gap-6">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ formatPrice(order.pay_amount) }}
                </p>
              </div>
              <div v-if="order.freight > 0" class="border-l border-gray-200 dark:border-gray-700 pl-6">
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Freight</p>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ formatPrice(order.freight) }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Method</p>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ order.pay_type === 1 ? 'PayPal' : `Type ${order.pay_type}` }}
              </p>
            </div>
          </div>

          <!-- 物流信息（如果有） -->
          <div v-if="order.delivery_company || order.delivery_sn" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-lucide-truck" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p class="text-sm font-semibold text-blue-900 dark:text-blue-100">Shipping Information</p>
            </div>
            <div class="flex flex-wrap gap-4 text-sm text-blue-800 dark:text-blue-200">
              <div v-if="order.delivery_company">
                <span class="font-medium">Company:</span> {{ order.delivery_company }}
              </div>
              <div v-if="order.delivery_sn">
                <span class="font-medium">Tracking:</span> {{ order.delivery_sn }}
              </div>
              <div v-if="order.delivery_time">
                <span class="font-medium">Shipped:</span> {{ formatDate(order.delivery_time) }}
              </div>
            </div>
          </div>

          <!-- 时间线信息 -->
          <div class="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div v-if="order.payment_time" class="flex items-center gap-1">
              <UIcon name="i-lucide-credit-card" class="w-3 h-3" />
              <span>Paid: {{ formatDate(order.payment_time) }}</span>
            </div>
            <div v-if="order.delivery_time" class="flex items-center gap-1">
              <UIcon name="i-lucide-truck" class="w-3 h-3" />
              <span>Shipped: {{ formatDate(order.delivery_time) }}</span>
            </div>
            <div v-if="order.receive_time" class="flex items-center gap-1">
              <UIcon name="i-lucide-check-circle" class="w-3 h-3" />
              <span>Received: {{ formatDate(order.receive_time) }}</span>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- 空状态 -->
    <UEmpty
      v-else
      icon="i-lucide-shopping-bag"
      title="No orders found"
      :description="selectedStatus !== null ? `No orders with status '${getStatusLabel(selectedStatus)}'` : 'You haven\'t placed any orders yet'"
      class="py-12"
    >
      <template v-if="selectedStatus !== null" #actions>
        <UButton
          color="primary"
          variant="outline"
          @click="handleStatusChange(null)"
        >
          View All Orders
        </UButton>
      </template>
      <template v-else #actions>
        <UButton
          color="primary"
          icon="i-lucide-shopping-cart"
          @click="router.push('/')"
        >
          Start Shopping
        </UButton>
      </template>
    </UEmpty>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <UPagination
        v-model="page"
        :page-count="pageSize"
        :total="totalOrders"
        :max="7"
        size="lg"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.orders-page {
  width: 100%;
}
</style>
