'use client'

import { API_BASE_URL, CONTENT_TYPE_JSON, REQUEST_TIMEOUT } from './config'

// Token 管理
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token')
  }
  return null
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token)
  }
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token')
  }
}

// 响应类型
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  msg?: string
}

// 分页响应类型 - 包含 total, page, page_size
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T> {
  total: number
  page: number
  page_size: number
}

// 请求选项
interface RequestOptions extends RequestInit {
  noNeedToken?: boolean
  params?: Record<string, unknown> | object
}

// 错误处理
class ApiError extends Error {
  code: number
  data?: unknown

  constructor(message: string, code: number = 500, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.data = data
  }
}

// 请求拦截器
async function requestInterceptor(options: RequestOptions): Promise<RequestOptions> {
  const token = getToken()

  const headers: HeadersInit = {
    'Content-Type': CONTENT_TYPE_JSON,
    ...((options.headers as Record<string, string>) || {}),
  }

  if (token && !options.noNeedToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  return {
    ...options,
    headers,
    credentials: 'include',
  }
}

// 响应拦截器
async function responseInterceptor<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type')
  let data: unknown

  if (contentType?.includes('application/json')) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  // 假设返回的是 { code, data, msg } 格式
  const res = data as ApiResponse<T>

  if (!response.ok) {
    throw new ApiError(
      res.msg || `HTTP Error: ${response.status}`,
      response.status,
      res.data
    )
  }

  // 业务错误码处理
  if (res.code !== 200 && res.code !== 0) {
    throw new ApiError(res.msg || 'Request failed', res.code, res.data)
  }

  return res
}

// 发起请求
async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options

  // 处理查询参数
  let url = `${API_BASE_URL}${endpoint}`
  const paramsRecord = params as Record<string, unknown>
  if (paramsRecord && Object.keys(paramsRecord).length > 0) {
    const searchParams = new URLSearchParams()
    Object.entries(paramsRecord).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // 应用请求拦截器
  const processedOptions = await requestInterceptor({
    ...fetchOptions,
    headers: {
      'Content-Type': CONTENT_TYPE_JSON,
      ...(fetchOptions.headers || {}),
    },
  })

  // 设置超时
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(url, {
      ...processedOptions,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const result = await responseInterceptor<T>(response)
    return result.data as T
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof ApiError) {
      // 处理 401 未授权
      if (error.code === 401 || error.code === 403) {
        removeToken()
        // 如果当前不在 login 页面，才重定向到登录页
        if (typeof window !== 'undefined' && !options.noNeedToken && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
        }
      }
      throw error
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408)
    }

    throw new ApiError(error instanceof Error ? error.message : 'Unknown error', 500)
  }
}

// 发起分页请求 - 返回完整响应（包含 data、total、page、page_size）
async function fetchApiPaginated<T>(endpoint: string, options: RequestOptions = {}): Promise<PaginatedApiResponse<T>> {
  const { params, ...fetchOptions } = options

  // 处理查询参数
  let url = `${API_BASE_URL}${endpoint}`
  const paramsRecord = params as Record<string, unknown>
  if (paramsRecord && Object.keys(paramsRecord).length > 0) {
    const searchParams = new URLSearchParams()
    Object.entries(paramsRecord).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // 应用请求拦截器
  const processedOptions = await requestInterceptor({
    ...fetchOptions,
    headers: {
      'Content-Type': CONTENT_TYPE_JSON,
      ...(fetchOptions.headers || {}),
    },
  })

  // 设置超时
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(url, {
      ...processedOptions,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const result = await responseInterceptor<T>(response) as PaginatedApiResponse<T>
    return result
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof ApiError) {
      // 处理 401 未授权
      if (error.code === 401 || error.code === 403) {
        removeToken()
        // 如果当前不在 login 页面，才重定向到登录页
        if (typeof window !== 'undefined' && !options.noNeedToken && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
        }
      }
      throw error
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408)
    }

    throw new ApiError(error instanceof Error ? error.message : 'Unknown error', 500)
  }
}

// HTTP 方法封装
export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, unknown> | object, options?: Partial<RequestOptions>) =>
    fetchApi<T>(endpoint, { method: 'GET', params, ...options }),

  // 获取分页列表 - 返回完整分页响应（含 data、total、page、page_size）
  getPaginated: <T>(endpoint: string, params?: Record<string, unknown> | object, options?: Partial<RequestOptions>) =>
    fetchApiPaginated<T>(endpoint, { method: 'GET', params, ...options }),

  post: <T>(endpoint: string, data?: unknown, options?: Partial<RequestOptions>) =>
    fetchApi<T>(endpoint, { method: 'POST', body: JSON.stringify(data), ...options }),

  put: <T>(endpoint: string, data?: unknown, options?: Partial<RequestOptions>) =>
    fetchApi<T>(endpoint, { method: 'PUT', body: JSON.stringify(data), ...options }),

  patch: <T>(endpoint: string, data?: unknown, options?: Partial<RequestOptions>) =>
    fetchApi<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data), ...options }),

  delete: <T>(endpoint: string, params?: Record<string, unknown> | object, options?: Partial<RequestOptions>) =>
    fetchApi<T>(endpoint, { method: 'DELETE', params, ...options }),
}

export { fetchApi, ApiError }
