'use client'

// Query Keys Factory
export const queryKeys = {
  // Base
  userInfo: ['userInfo'] as const,
  userMenu: ['userMenu'] as const,
  userApi: ['userApi'] as const,

  // User
  users: (params?: object) => ['users', params] as const,
  user: (id: number) => ['user', id] as const,

  // Role
  roles: (params?: object) => ['roles', params] as const,
  role: (id: number) => ['role', id] as const,
  roleAuthorized: (id: number) => ['roleAuthorized', id] as const,

  // Menu
  menus: (params?: object) => ['menus', params] as const,
  menu: (id: number) => ['menu', id] as const,

  // API Management
  apis: (params?: object) => ['apis', params] as const,
  api: (id: number) => ['api', id] as const,

  // Dept
  depts: (params?: object) => ['depts', params] as const,
  dept: (id: number) => ['dept', id] as const,

  // Audit Log
  auditLogs: (params?: object) => ['auditLogs', params] as const,

  // Prompt Config
  promptConfigGroups: (params?: object) => ['promptConfigGroups', params] as const,
  promptConfigOptions: (groupId: number, params?: object) => ['promptConfigOptions', groupId, params] as const,
  promptConfigSettings: (params?: object) => ['promptConfigSettings', params] as const,

  // Image Task (Admin)
  imageTasks: (params?: object) => ['imageTasks', params] as const,
  imageTaskDetail: (taskId: string) => ['imageTaskDetail', taskId] as const,

  // Model Photo
  modelPhotos: (params?: object) => ['modelPhotos', params] as const,
  modelPhotoDetail: (id: number) => ['modelPhotoDetail', id] as const,

  // Model Photo (Tryon Records)
  modelPhotosTryon: (params?: object) => ['modelPhotosTryon', params] as const,
  modelPhotoTryonDetail: (id: number) => ['modelPhotoTryonDetail', id] as const,

  // Customer
  customers: (params?: object) => ['customers', params] as const,
  customer: (id: number) => ['customer', id] as const,

  // Dict
  dicts: (params?: object) => ['dicts', params] as const,
  dict: (id: number) => ['dict', id] as const,
  dictItems: (dictId: number, params?: object) => ['dictItems', dictId, params] as const,
  dictItemsByCode: (code: string) => ['dictItemsByCode', code] as const,
}
