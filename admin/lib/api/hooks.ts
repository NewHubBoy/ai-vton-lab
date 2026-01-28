'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './query-keys'
import { baseApi, userApi, roleApi, menuApi, apiManagementApi, deptApi, auditLogApi, promptConfigApi, imageTaskApi, modelPhotoApi, rechargeApi, customerApi, dictApi } from './index'
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

export function usePromptConfigGroups(params?: { is_active?: boolean, config_type?: string }) {
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

// ============ Image Task Hooks (Admin) ============

export function useImageTasks(params?: Parameters<typeof imageTaskApi.getList>[0]) {
  return useQuery({
    queryKey: queryKeys.imageTasks(params as object),
    queryFn: () => imageTaskApi.getList(params),
  })
}

export function useImageTaskDetail(taskId: string) {
  return useQuery({
    queryKey: queryKeys.imageTaskDetail(taskId),
    queryFn: () => imageTaskApi.getDetail({ task_id: taskId }),
    enabled: !!taskId,
  })
}

// ============ Model Photo Hooks ============

export function useModelPhotos(params?: Parameters<typeof modelPhotoApi.getList>[0]) {
  return useQuery({
    queryKey: queryKeys.modelPhotos(params as object),
    queryFn: () => modelPhotoApi.getList(params),
  })
}

export function useModelPhotoDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.modelPhotoDetail(id),
    queryFn: () => modelPhotoApi.getDetail({ id }),
    enabled: !!id,
  })
}

// ============ Model Photo Hooks (Tryon Records) ============

export function useModelPhotosTryon(params?: Parameters<typeof modelPhotoApi.getTryonList>[0]) {
  return useQuery({
    queryKey: queryKeys.modelPhotosTryon(params as object),
    queryFn: () => modelPhotoApi.getTryonList(params),
  })
}

export function useModelPhotoTryonDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.modelPhotoTryonDetail(id),
    queryFn: () => modelPhotoApi.getTryonDetail({ id }),
    enabled: !!id,
  })
}

// ============ Recharge Hooks ============

export function useUserCredits() {
  return useQuery({
    queryKey: ['userCredits'],
    queryFn: () => rechargeApi.getCredits(),
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useRechargeRecords(params?: { limit?: number; offset?: number; status?: string }) {
  return useQuery({
    queryKey: ['rechargeRecords', params],
    queryFn: () => rechargeApi.getRecords(params),
  })
}

export function useRechargeConfigs() {
  return useQuery({
    queryKey: ['rechargeConfigs'],
    queryFn: () => rechargeApi.getConfigs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateRechargeOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rechargeApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCredits'] })
      queryClient.invalidateQueries({ queryKey: ['rechargeRecords'] })
    },
  })
}

export function useRedeemCardCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rechargeApi.redeemCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCredits'] })
      queryClient.invalidateQueries({ queryKey: ['rechargeRecords'] })
    },
  })
}

// ============ Admin Recharge Hooks ============

export function useAdminRechargeRecords(params?: { limit?: number; offset?: number; user_id?: number; status?: string }) {
  return useQuery({
    queryKey: ['adminRechargeRecords', params],
    queryFn: () => rechargeApi.adminGetRecords(params),
  })
}

export function useAdminCardCodes(params?: { limit?: number; offset?: number; batch_no?: string; is_used?: boolean }) {
  return useQuery({
    queryKey: ['adminCardCodes', params],
    queryFn: () => rechargeApi.adminListCards(params),
  })
}

export function useAdminRechargeConfigs() {
  return useQuery({
    queryKey: ['adminRechargeConfigs'],
    queryFn: () => rechargeApi.adminGetConfigs(),
  })
}

export function useAdminGenerateCardCodes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rechargeApi.adminGenerateCards,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCardCodes'] })
    },
  })
}

export function useAdminCreateRechargeConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rechargeApi.adminCreateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRechargeConfigs'] })
    },
  })
}

export function useAdminUpdateRechargeConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rechargeApi.adminUpdateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRechargeConfigs'] })
    },
  })
}

export function useAdminDeleteRechargeConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number }) => rechargeApi.adminDeleteConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRechargeConfigs'] })
    },
  })
}

export function useAdminAddUserCredits() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rechargeApi.adminAddCredits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// ============ Customer Hooks ============

export function useCustomers(params?: Parameters<typeof customerApi.getList>[0]) {
  return useQuery({
    queryKey: queryKeys.customers(params as object),
    queryFn: () => customerApi.getList(params),
  })
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: queryKeys.customer(id),
    queryFn: () => customerApi.getById({ customer_id: id }),
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: customerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: customerApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: customerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useResetCustomerPassword() {
  return useMutation({
    mutationFn: customerApi.resetPassword,
  })
}

export function useAddCustomerCredits() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: customerApi.addCredits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

// ============ Dict Hooks ============

export function useDicts(params?: Parameters<typeof dictApi.getDicts>[0]) {
  return useQuery({
    queryKey: queryKeys.dicts(params as object),
    queryFn: () => dictApi.getDicts(params),
  })
}

export function useDict(id: number) {
  return useQuery({
    queryKey: queryKeys.dict(id),
    queryFn: () => dictApi.getDict(id),
    enabled: !!id,
  })
}

export function useCreateDict() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: dictApi.createDict,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dicts'] })
    },
  })
}

export function useUpdateDict() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: dictApi.updateDict,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dicts'] })
    },
  })
}

export function useDeleteDict() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number }) => dictApi.deleteDict(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dicts'] })
    },
  })
}

export function useDictItems(dictId: number, params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: queryKeys.dictItems(dictId, params),
    queryFn: () => dictApi.getItems(dictId, params),
    enabled: !!dictId,
  })
}

export function useDictItemsByCode(code: string) {
  return useQuery({
    queryKey: queryKeys.dictItemsByCode(code),
    queryFn: () => dictApi.getItemsByCode(code),
    enabled: !!code,
  })
}

export function useCreateDictItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: dictApi.createItem,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictItems', variables.dict_id] })
    },
  })
}

export function useUpdateDictItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: dictApi.updateItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictItems'] })
    },
  })
}

export function useDeleteDictItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number }) => dictApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictItems'] })
    },
  })
}
