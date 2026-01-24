'use client'

import { apiClient } from './client'

// ============ Base APIs ============

export const baseApi = {
  // 登录
  login: (data: { username: string; password: string }) =>
    apiClient.post<{ access_token: string }>('/base/access_token', data, { noNeedToken: true }),

  // 获取用户信息
  getUserInfo: () => apiClient.get('/base/userinfo'),

  // 获取用户菜单
  getUserMenu: () => apiClient.get('/base/usermenu'),

  // 获取用户API权限
  getUserApi: () => apiClient.get('/base/userapi'),

  // 修改密码
  updatePassword: (data: Record<string, unknown> = {}) =>
    apiClient.post('/base/update_password', data),
}

// ============ User APIs ============

export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  roles?: Array<{ id: number; name: string }>
  dept?: { id: number; name: string }
  is_superuser: boolean
  is_active: boolean
  last_login?: string
}

export interface UserListParams {
  page?: number
  page_size?: number
  username?: string
  email?: string
  dept_id?: number
}

export interface UserListResponse {
  data: User[]
  total: number
  page: number
  page_size: number
}

export const userApi = {
  // 获取用户列表（返回完整分页响应）
  getList: (params?: UserListParams) =>
    apiClient.getPaginated<User[]>('/user/list', params),

  // 获取用户详情
  getById: (params: { user_id: number }) =>
    apiClient.get<User>('/user/get', params),

  // 创建用户
  create: (data: Partial<User> & { password: string; role_ids?: number[] }) =>
    apiClient.post<User>('/user/create', data),

  // 更新用户
  update: (data: Partial<User> & { user_id: number; role_ids?: number[] }) =>
    apiClient.post<User>('/user/update', data),

  // 删除用户
  delete: (params: { user_id: number }) =>
    apiClient.delete<null>('/user/delete', params),

  // 重置密码
  resetPassword: (data: { user_id: number }) =>
    apiClient.post<null>('/user/reset_password', data),
}

// ============ Role APIs ============

export interface Role {
  id: number
  name: string
  code: string
  description?: string
  is_active: boolean
}

export interface RoleListParams {
  page?: number
  page_size?: number
  name?: string
  code?: string
}

export interface RoleListResponse {
  data: Role[]
  total: number
}

export interface RoleAuthorized {
  id?: number
  menus?: number[]
  apis?: number[]
}

export const roleApi = {
  // 获取角色列表
  getList: (params?: RoleListParams) =>
    apiClient.get<RoleListResponse>('/role/list', params),

  // 创建角色
  create: (data: Partial<Role>) =>
    apiClient.post<Role>('/role/create', data),

  // 更新角色
  update: (data: Partial<Role> & { role_id: number }) =>
    apiClient.post<Role>('/role/update', data),

  // 删除角色
  delete: (params: { role_id: number }) =>
    apiClient.delete<null>('/role/delete', params),

  // 获取角色权限
  getAuthorized: (params: { role_id: number }) =>
    apiClient.get<RoleAuthorized>('/role/authorized', params),

  // 更新角色权限
  updateAuthorized: (data: RoleAuthorized & { role_id: number }) =>
    apiClient.post<null>('/role/authorized', data),
}

// ============ Menu APIs ============

export interface Menu {
  id: number
  parent_id: number
  name: string
  icon?: string
  path: string
  component: string
  order: number
  menu_type: 'catalog' | 'menu' | 'button'
  is_hidden: boolean
  keepalive: boolean
  redirect?: string
  children?: Menu[]
  created_at?: string
  updated_at?: string
  remark?: string | null
}

export interface MenuListParams {
  name?: string
  menu_type?: string
}

export const menuApi = {
  // 获取菜单列表
  getList: (params?: MenuListParams) =>
    apiClient.get<Menu[]>('/menu/list', params),

  // 创建菜单
  create: (data: Partial<Menu>) =>
    apiClient.post<Menu>('/menu/create', data),

  // 更新菜单
  update: (data: Partial<Menu> & { id: number }) =>
    apiClient.post<Menu>('/menu/update', data),

  // 删除菜单
  delete: (params: { menu_id: number }) =>
    apiClient.delete<null>('/menu/delete', params),
}

// ============ API Management APIs ============

export interface Api {
  id: number
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description: string
}

export interface ApiListParams {
  page?: number
  page_size?: number
  path?: string
  method?: string
}

export interface ApiListResponse {
  data: Api[]
  total: number
}

export const apiManagementApi = {
  // 获取 API 列表
  getList: (params?: ApiListParams) =>
    apiClient.get<ApiListResponse>('/api/list', params),

  // 创建 API
  create: (data: Partial<Api>) =>
    apiClient.post<Api>('/api/create', data),

  // 更新 API
  update: (data: Partial<Api> & { api_id: number }) =>
    apiClient.post<Api>('/api/update', data),

  // 删除 API
  delete: (params: { api_id: number }) =>
    apiClient.delete<null>('/api/delete', params),

  // 刷新 API 权限
  refresh: (data?: Record<string, unknown>) =>
    apiClient.post<null>('/api/refresh', data),
}

// ============ Dept APIs ============

export interface Dept {
  id: number
  parent_id: number
  name: string
  sort: number
  leader?: string
  phone?: string
  email?: string
  status: boolean
  children?: Dept[]
}

export interface DeptListParams {
  dept_name?: string
  status?: boolean
}

export const deptApi = {
  // 获取部门列表
  getList: (params?: DeptListParams) =>
    apiClient.get<Dept[]>('/dept/list', params),

  // 创建部门
  create: (data: Partial<Dept>) =>
    apiClient.post<Dept>('/dept/create', data),

  // 更新部门
  update: (data: Partial<Dept> & { dept_id: number }) =>
    apiClient.post<Dept>('/dept/update', data),

  // 删除部门
  delete: (params: { dept_id: number }) =>
    apiClient.delete<null>('/dept/delete', params),
}

// ============ Audit Log APIs ============

export interface AuditLog {
  id: number
  user_id: number
  username: string
  method: string
  path: string
  ip: string
  city?: string
  browser?: string
  os?: string
  status: number
  latency: string
  created_at: string
}

export interface AuditLogListParams {
  page?: number
  page_size?: number
  username?: string
  method?: string
  path?: string
  status?: number
  start_time?: string
  end_time?: string
}

export interface AuditLogListResponse {
  data: AuditLog[]
  total: number
}

export const auditLogApi = {
  // 获取审计日志列表
  getList: (params?: AuditLogListParams) =>
    apiClient.get<AuditLogListResponse>('/auditlog/list', params),
}

// ============ Prompt Config APIs ============

export interface PromptConfigGroup {
  id: number
  group_key: string
  group_name: string
  description?: string
  input_type: string
  is_multiple: boolean
  is_required: boolean
  placeholder?: string
  default_option_key?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PromptConfigGroupListResponse {
  data: PromptConfigGroup[]
  total: number
}

export interface PromptConfigOption {
  id: number
  group_id: number
  option_key: string
  option_label: string
  prompt_text?: string
  negative_prompt?: string
  prompt_order: number
  image_url?: string
  description?: string
  sort_order: number
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface PromptConfigOptionListResponse {
  data: PromptConfigOption[]
  total: number
}

export const promptConfigApi = {
  // --- Groups ---
  getGroups: (params?: { is_active?: boolean }) =>
    apiClient.getPaginated<PromptConfigGroup[]>('/prompt-config/groups', params),

  createGroup: (data: Partial<PromptConfigGroup>) =>
    apiClient.post<PromptConfigGroup>('/prompt-config/groups', data),

  updateGroup: (data: Partial<PromptConfigGroup> & { id: number }) =>
    apiClient.put<PromptConfigGroup>(`/prompt-config/groups/${data.id}`, data),

  // --- Options ---
  getOptions: (group_id: number, params?: { is_active?: boolean }) =>
    apiClient.get<PromptConfigOption[]>(`/prompt-config/groups/${group_id}/options`, params),

  createOption: (data: Partial<PromptConfigOption>) =>
    apiClient.post<PromptConfigOption>('/prompt-config/options', data),

  updateOption: (data: Partial<PromptConfigOption> & { id: number }) =>
    apiClient.put<PromptConfigOption>(`/prompt-config/options/${data.id}`, data),
}
