'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './query-keys'
import { baseApi, userApi, roleApi, menuApi, apiManagementApi, deptApi, auditLogApi, promptConfigApi } from './index'
import { usePathname } from 'next/navigation'

// ============ Base Hooks ============

export function useUserInfo() {
  const pathname = usePathname();

  return useQuery({
    queryKey: queryKeys.userInfo,
    queryFn: () => baseApi.getUserInfo(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !pathname.includes('/login')
  })
}

export function useUserMenu() {
  const pathname = usePathname();

  return useQuery({
    queryKey: queryKeys.userMenu,
    queryFn: () => baseApi.getUserMenu(),
    staleTime: Infinity,
    enabled: !pathname.includes('/login')
  })
}

export function useUserApi() {
  return useQuery({
    queryKey: queryKeys.userApi,
    queryFn: () => baseApi.getUserApi(),
    staleTime: Infinity,
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => baseApi.updatePassword(data),
  })
}

// ============ User Hooks ============

export function useUsers(params?: Parameters<typeof userApi.getList>[0]) {
  return useQuery({
    queryKey: queryKeys.users(params as object),
    queryFn: () => userApi.getList(params),
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => userApi.getById({ user_id: id }),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['userInfo'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useResetPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.resetPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// ============ Role Hooks ============

export function useRoles(params?: Parameters<typeof roleApi.getList>[0]) {
  return useQuery({
    queryKey: queryKeys.roles(params as object),
    queryFn: () => roleApi.getList(params),
  })
}

export function useRoleAuthorized(roleId: number) {
  return useQuery({
    queryKey: queryKeys.roleAuthorized(roleId),
    queryFn: () => roleApi.getAuthorized({ role_id: roleId }),
    enabled: !!roleId,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: roleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: roleApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: roleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['userMenu'] })
    },
  })
}

export function useUpdateRoleAuthorized() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: roleApi.updateAuthorized,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roleAuthorized', variables.role_id] })
    },
  })
}

// ============ Menu Hooks ============

export function useMenus(params?: Parameters<typeof menuApi.getList>[0]) {
  return useQuery({
    queryKey: queryKeys.menus(params as object),
    queryFn: () => menuApi.getList(params),
  })
}

export function useMenu(_id: number) {
  return useQuery({
    queryKey: queryKeys.menu(_id),
    queryFn: () => menuApi.getList({ menu_id: _id } as Parameters<typeof menuApi.getList>[0]),
    enabled: !!_id,
  })
}

export function useCreateMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: menuApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      queryClient.invalidateQueries({ queryKey: ['userMenu'] })
    },
  })
}

export function useUpdateMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: menuApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      queryClient.invalidateQueries({ queryKey: ['userMenu'] })
    },
  })
}

export function useDeleteMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: menuApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      queryClient.invalidateQueries({ queryKey: ['userMenu'] })
    },
  })
}

// ============ API Management Hooks ============

export function useApis(params?: Parameters<typeof apiManagementApi.getList>[0]) {
  return useQuery({
    queryKey: queryKeys.apis(params as object),
    queryFn: () => apiManagementApi.getList(params),
  })
}

export function useCreateApi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiManagementApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apis'] })
    },
  })
}

export function useUpdateApi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiManagementApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apis'] })
    },
  })
}

export function useDeleteApi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiManagementApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apis'] })
      queryClient.invalidateQueries({ queryKey: ['userApi'] })
    },
  })
}

export function useRefreshApi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiManagementApi.refresh,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apis'] })
      queryClient.invalidateQueries({ queryKey: ['userApi'] })
    },
  })
}

// ============ Dept Hooks ============

export function useDepts(params?: Parameters<typeof deptApi.getList>[0]) {
  return useQuery({
    queryKey: queryKeys.depts(params as object),
    queryFn: () => deptApi.getList(params),
  })
}

export function useCreateDept() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deptApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depts'] })
    },
  })
}

export function useUpdateDept() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deptApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depts'] })
    },
  })
}

export function useDeleteDept() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deptApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depts'] })
    },
  })
}

// ============ Audit Log Hooks ============

export function useAuditLogs(params?: Parameters<typeof auditLogApi.getList>[0]) {
  return useQuery({
    queryKey: queryKeys.auditLogs(params as object),
    queryFn: () => auditLogApi.getList(params),
  })
}

// ============ Prompt Config Hooks ============

export function usePromptConfigGroups(params?: { is_active?: boolean }) {
  return useQuery({
    queryKey: queryKeys.promptConfigGroups(params),
    queryFn: () => promptConfigApi.getGroups(params),
  })
}

export function useCreatePromptConfigGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: promptConfigApi.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promptConfigGroups'] })
    },
  })
}

export function useUpdatePromptConfigGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: promptConfigApi.updateGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promptConfigGroups'] })
    },
  })
}

export function usePromptConfigOptions(groupId: number, params?: { is_active?: boolean }) {
  return useQuery({
    queryKey: queryKeys.promptConfigOptions(groupId, params),
    queryFn: () => promptConfigApi.getOptions(groupId, params),
    enabled: !!groupId,
  })
}

export function useCreatePromptConfigOption() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: promptConfigApi.createOption,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['promptConfigOptions', variables.group_id] })
    },
  })
}

export function useUpdatePromptConfigOption() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: promptConfigApi.updateOption,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['promptConfigOptions', variables.group_id] })
    },
  })
}
