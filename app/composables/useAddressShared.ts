import api from '../api'
import type { Address } from '../api/type'

/**
 * 共享的地址 composable
 * 用于在多个页面中共享地址列表数据，登录后只需加载一次
 */
export const useAddressShared = () => {
  // 地址列表状态（全局共享）
  const addressList = useState<Address[]>('addressList', () => [])

  /**
   * 获取地址列表（共享数据）
   * @param key - useAsyncData 的 key，使用统一的 key 确保数据共享
   * @param options - useAsyncData 的选项
   */
  const useAddressList = (
    key: string = 'address-list-shared',
    options?: {
      lazy?: boolean
      watch?: any[]
      onError?: (error: unknown) => void
    }
  ) => {
    return useAsyncData<Address[]>(key, async () => {
      try {
        const res = await api.shop.address.list({})
        const list = res.list || []
        
        // 更新共享的地址列表状态
        addressList.value = list
        
        return list
      } catch (error) {
        console.error('Failed to fetch addresses:', error)
        
        // 如果提供了错误处理回调，调用它
        if (options?.onError) {
          options.onError(error)
        }
        
        // 出错时清空列表
        addressList.value = []
        return []
      }
    }, options)
  }

  /**
   * 刷新地址列表
   * 这个方法会刷新所有使用 useAddressList 的页面
   */
  const refreshAddressList = async () => {
    try {
      const res = await api.shop.address.list({})
      const list = res.list || []
      
      // 更新共享的地址列表状态
      addressList.value = list
      
      // 刷新所有使用 useAsyncData 的地址列表
      await refreshNuxtData('address-list-shared')
      await refreshNuxtData('address-list')
      await refreshNuxtData('checkout-address-list')
      
      return list
    } catch (error) {
      console.error('Failed to refresh addresses:', error)
      addressList.value = []
      return []
    }
  }

  /**
   * 获取默认地址
   */
  const getDefaultAddress = computed(() => {
    return addressList.value.find(addr => addr.default_status === 1) || null
  })

  return {
    addressList: readonly(addressList),
    useAddressList,
    refreshAddressList,
    getDefaultAddress
  }
}
