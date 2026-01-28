'use client'

import { useState } from 'react'
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, useResetCustomerPassword, useAddCustomerCredits } from '@/lib/api/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Search, RefreshCw, Plus, Pencil, Trash2, KeyRound, Coins } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'
import type { Customer } from '@/lib/api/index'

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-6 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export default function CustomersPage() {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [filters, setFilters] = useState({
    username: '',
    email: '',
  })

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCreditsDialog, setShowCreditsDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const [createForm, setCreateForm] = useState({ username: '', email: '', password: '', alias: '', phone: '' })
  const [editForm, setEditForm] = useState({ id: 0, username: '', email: '', alias: '', phone: '', is_active: true })
  const [creditsForm, setCreditsForm] = useState({ credits: '', remark: '' })

  const { data: customersData, isLoading, refetch } = useCustomers({
    page,
    page_size: pageSize,
    username: filters.username || undefined,
    email: filters.email || undefined,
  })

  const { mutate: createCustomer, isPending: creating } = useCreateCustomer()
  const { mutate: updateCustomer, isPending: updating } = useUpdateCustomer()
  const { mutate: deleteCustomer, isPending: deleting } = useDeleteCustomer()
  const { mutate: resetPassword, isPending: resetting } = useResetCustomerPassword()
  const { mutate: addCredits, isPending: addingCredits } = useAddCustomerCredits()

  const response = customersData as { data?: Customer[]; total?: number } | undefined
  const customers = response?.data || []
  const total = response?.total || 0

  const handleCreate = () => {
    if (!createForm.username || !createForm.email || !createForm.password) {
      toast.error('请填写完整信息')
      return
    }

    createCustomer(createForm, {
      onSuccess: () => {
        setShowCreateDialog(false)
        setCreateForm({ username: '', email: '', password: '', alias: '', phone: '' })
        toast.success('客户创建成功')
      },
      onError: (error) => {
        toast.error(error.message || '创建失败')
      },
    })
  }

  const handleEdit = () => {
    updateCustomer(editForm, {
      onSuccess: () => {
        setShowEditDialog(false)
        toast.success('客户更新成功')
      },
      onError: (error) => {
        toast.error(error.message || '更新失败')
      },
    })
  }

  const handleDelete = () => {
    if (!selectedCustomer) return

    deleteCustomer({ customer_id: selectedCustomer.id }, {
      onSuccess: () => {
        setShowDeleteDialog(false)
        setSelectedCustomer(null)
        toast.success('客户删除成功')
      },
      onError: (error) => {
        toast.error(error.message || '删除失败')
      },
    })
  }

  const handleResetPassword = (customer: Customer) => {
    resetPassword({ customer_id: customer.id }, {
      onSuccess: () => {
        toast.success('密码已重置为123456')
      },
      onError: (error) => {
        toast.error(error.message || '重置失败')
      },
    })
  }

  const handleAddCredits = () => {
    if (!selectedCustomer || !creditsForm.credits) {
      toast.error('请填写充值积分')
      return
    }

    addCredits({
      customer_id: selectedCustomer.id,
      credits: parseInt(creditsForm.credits),
      remark: creditsForm.remark || undefined,
    }, {
      onSuccess: () => {
        setShowCreditsDialog(false)
        setCreditsForm({ credits: '', remark: '' })
        toast.success('充值成功')
      },
      onError: (error) => {
        toast.error(error.message || '充值失败')
      },
    })
  }

  const openEditDialog = (customer: Customer) => {
    setEditForm({
      id: customer.id,
      username: customer.username,
      email: customer.email,
      alias: customer.alias || '',
      phone: customer.phone || '',
      is_active: customer.is_active,
    })
    setShowEditDialog(true)
  }

  const openCreditsDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCreditsForm({ credits: '', remark: '' })
    setShowCreditsDialog(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">客户管理</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          新增客户
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">查询过滤</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setPage(1); refetch() }}>
                <Search className="h-4 w-4 mr-1" />
                搜索
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setFilters({ username: '', email: '' })}>
                <RefreshCw className="h-4 w-4 mr-1" />
                重置
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
            <div className="col-span-1 md:col-span-4">
              <Input
                placeholder="用户名"
                value={filters.username}
                onChange={(e) => setFilters({ ...filters, username: e.target.value })}
              />
            </div>
            <div className="col-span-1 md:col-span-4">
              <Input
                placeholder="邮箱"
                value={filters.email}
                onChange={(e) => setFilters({ ...filters, email: e.target.value })}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead className="w-24">用户名</TableHead>
                <TableHead className="w-32">邮箱</TableHead>
                <TableHead className="w-20">姓名</TableHead>
                <TableHead className="w-20">积分余额</TableHead>
                <TableHead className="w-20">累计充值</TableHead>
                <TableHead className="w-16">状态</TableHead>
                <TableHead className="w-32">创建时间</TableHead>
                <TableHead className="w-40">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton />
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">暂无数据</TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.id}</TableCell>
                    <TableCell>{customer.username}</TableCell>
                    <TableCell className="text-sm">{customer.email}</TableCell>
                    <TableCell>{customer.alias || '-'}</TableCell>
                    <TableCell className="font-medium">{customer.credit_balance}</TableCell>
                    <TableCell>{customer.total_recharged}</TableCell>
                    <TableCell>
                      <Badge className={customer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {customer.is_active ? '正常' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(customer.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="编辑" onClick={() => openEditDialog(customer)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="充值积分" onClick={() => openCreditsDialog(customer)}>
                          <Coins className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="重置密码" onClick={() => handleResetPassword(customer)} disabled={resetting}>
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="删除" onClick={() => { setSelectedCustomer(customer); setShowDeleteDialog(true) }}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">共 {total} 条</p>
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
                disabled={customers.length < pageSize}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 新增客户对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新增客户</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">用户名 *</label>
              <Input
                placeholder="请输入用户名"
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">邮箱 *</label>
              <Input
                type="email"
                placeholder="请输入邮箱"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">密码 *</label>
              <Input
                type="password"
                placeholder="请输入密码"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">姓名</label>
              <Input
                placeholder="请输入姓名"
                value={createForm.alias}
                onChange={(e) => setCreateForm({ ...createForm, alias: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">电话</label>
              <Input
                placeholder="请输入电话"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>取消</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑客户对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑客户</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">用户名</label>
              <Input
                placeholder="请输入用户名"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">邮箱</label>
              <Input
                type="email"
                placeholder="请输入邮箱"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">姓名</label>
              <Input
                placeholder="请输入姓名"
                value={editForm.alias}
                onChange={(e) => setEditForm({ ...editForm, alias: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">电话</label>
              <Input
                placeholder="请输入电话"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>取消</Button>
            <Button onClick={handleEdit} disabled={updating}>
              {updating ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 充值积分对话框 */}
      <Dialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>充值积分 - {selectedCustomer?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">当前余额</label>
              <p className="text-lg font-bold mt-1">{selectedCustomer?.credit_balance} 积分</p>
            </div>
            <div>
              <label className="text-sm font-medium">充值积分 *</label>
              <Input
                type="number"
                placeholder="请输入充值积分数"
                value={creditsForm.credits}
                onChange={(e) => setCreditsForm({ ...creditsForm, credits: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">备注</label>
              <Input
                placeholder="请输入备注"
                value={creditsForm.remark}
                onChange={(e) => setCreditsForm({ ...creditsForm, remark: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreditsDialog(false)}>取消</Button>
            <Button onClick={handleAddCredits} disabled={addingCredits}>
              {addingCredits ? '充值中...' : '充值'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除客户 "{selectedCustomer?.username}" 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
