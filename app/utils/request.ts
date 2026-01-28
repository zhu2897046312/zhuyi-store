import { useCookie, useFetch } from "nuxt/app";
import { getDeviceId } from './auth'
// import { Ref } from "vue";

interface ResultData {
  code: number;
  result: any;
  message: string;
}


class HttpRequest {
  async exec (method: 'GET' | 'POST', url: string, data: any) : Promise<any> {
    const config = useRuntimeConfig()
    const accessToken = useCookie('accessToken')
    const deviceId = await getDeviceId(); // 获取设备指纹ID（支持游客购买）
    
    // 构建完整 URL
    const baseURL = config.public.apiUrl || 'http://localhost:8080/api/client'
    let fullUrl = `${baseURL}${url}`
    
    // 构建请求选项
    const fetchOptions: any = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken.value || '',
        'X-Device-Fingerprint': deviceId // 添加浏览器指纹到请求头，用于游客身份识别
      }
    }
    
    // 根据请求方法设置参数或请求体
    if (method === 'POST') {
      fetchOptions.body = data
    } else if (data && Object.keys(data).length > 0) {
      // GET 请求使用查询参数
      const params = new URLSearchParams()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
      const queryString = params.toString()
      if (queryString) {
        fullUrl = `${fullUrl}?${queryString}`
      }
    }

    try {
      console.log(`${method} 请求:`, fullUrl, method === 'POST' ? fetchOptions.body : '')
      const response = await $fetch<ResultData>(fullUrl, fetchOptions)
      
      if (response == null) {
        return Promise.reject(new Error('请求失败'))
      }
      
      if (response.code === 0) {
        return Promise.resolve(response.result)
      }
      return Promise.reject(new Error(response.message))
    } catch (e: any) {
      console.error('API 请求错误:', e)
      return Promise.reject(e)
    }
  }
}

export const httpRequest = new HttpRequest()

