'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useRoles, useDepts } from '@/lib/api/hooks'
import { User } from '@/lib/api'
import { PaginatedApiResponse } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Search, Pencil, Trash2, RefreshCw } from 'lucide-react'

interface UserFormData {
  username: string
  email: string
  password?: string
  role_ids: number[]
  is_superuser: boolean
  is_active: boolean
  dept_id?: number
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add')
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    role_ids: [],
    is_superuser: false,
    is_active: true,
    dept_id: undefined,
  })

  // 获取用户列表
  const { data: usersData, isLoading: usersLoading } = useUsers({
    page,
    page_size: pageSize,
    username: search || undefined,
  })

  // 获取角色列表（用于选择）
  const { data: rolesData } = useRoles({ page: 1, page_size: 9999 })
  // 获取部门列表
  const { data: deptsData } = useDepts()

  //  mutations
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const handleAdd = () => {
    setDialogType('add')
    setFormData({
      username: '',
      email: '',
      password: '',
      role_ids: [],
      is_superuser: false,
      is_active: true,
      dept_id: undefined,
    })
    setDialogOpen(true)
  }

  const handleEdit = (user: { id: number; username: string; email: string; roles?: { id: number }[]; dept?: { id: number }; is_superuser: boolean; is_active: boolean }) => {
    setDialogType('edit')
    setFormData({
      username: user.username,
      email: user.email,
      role_ids: user.roles?.map((r) => r.id) || [],
      is_superuser: user.is_superuser,
      is_active: user.is_active,
      dept_id: user.dept?.id,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (dialogType === 'add') {
        await createUser.mutateAsync(formData as any)
        toast.success('创建成功')
      } else {
        const response = usersData as PaginatedApiResponse<User[]> | undefined
        const userList = response?.data || []
        const currentUser = userList.find((u: any) => u.username === formData.username)
        if (currentUser) {
          await updateUser.mutateAsync({ ...formData, user_id: currentUser.id } as any)
          toast.success('更新成功')
        }
      }
      setDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该用户吗？')) return
    try {
      await deleteUser.mutateAsync({ user_id: id })
      toast.success('删除成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  const handleResetPassword = async (id: number) => {
    if (!confirm('确定要重置密码为 123456 吗？')) return
    try {
      const { userApi } = await import('@/lib/api')
      await userApi.resetPassword({ user_id: id })
      toast.success('密码已重置为 123456')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '重置失败')
    }
  }

  const usersResponse = usersData as PaginatedApiResponse<User[]> | undefined
  const users = usersResponse?.data || []
  const total = usersResponse?.total || 0
  const roles = (rolesData as { data?: { data?: any[] } } | undefined)?.data?.data || []
  const depts = (deptsData as any[]) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新建用户
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>部门</TableHead>
                <TableHead>超级用户</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {(user.roles as Array<{ id: number; name: string }>)?.map((role) => (
                          <Badge key={role.id} variant="secondary">
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{user.dept?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_superuser ? 'default' : 'outline'}>
                        {user.is_superuser ? '是' : '否'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'destructive'}>
                        {user.is_active ? '正常' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleResetPassword(user.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              共 {total} 条记录
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={users.length < pageSize}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogType === 'add' ? '新建用户' : '编辑用户'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            {dialogType === 'add' && (
              <div className="grid gap-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label>角色</Label>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.role_ids.includes(role.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            role_ids: [...formData.role_ids, role.id],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            role_ids: formData.role_ids.filter((id) => id !== role.id),
                          })
                        }
                      }}
                    />
                    <span className="text-sm">{role.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.is_superuser}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_superuser: checked as boolean })
                  }
                />
                <span className="text-sm">超级用户</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked as boolean })
                  }
                />
                <span className="text-sm">启用</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={createUser.isPending || updateUser.isPending}>
              {createUser.isPending || updateUser.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
