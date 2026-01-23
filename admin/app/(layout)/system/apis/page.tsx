'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useApis, useCreateApi, useUpdateApi, useDeleteApi, useRefreshApi } from '@/lib/api/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Pencil, Trash2, RefreshCw } from 'lucide-react'

export default function ApisPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add')
  const [formData, setFormData] = useState({ path: '', method: 'GET', description: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  const { data: apisData, isLoading } = useApis({ page, page_size: pageSize, path: search || undefined })

  const createApi = useCreateApi()
  const updateApi = useUpdateApi()
  const deleteApi = useDeleteApi()
  const refreshApi = useRefreshApi()

  const apis = (apisData as { data?: { data?: any[]; total?: number } } | undefined)?.data?.data || []
  const total = (apisData as { data?: { data?: any[]; total?: number } } | undefined)?.data?.total || 0

  const handleAdd = () => {
    setDialogType('add')
    setFormData({ path: '', method: 'GET', description: '' })
    setDialogOpen(true)
  }

  const handleEdit = (api: { id: number; path: string; method: string; description: string }) => {
    setDialogType('edit')
    setEditingId(api.id)
    setFormData({ path: api.path, method: api.method, description: api.description })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (dialogType === 'add') {
        await createApi.mutateAsync(formData as any)
        toast.success('创建成功')
      } else {
        await updateApi.mutateAsync({ ...formData, api_id: editingId! } as any)
        toast.success('更新成功')
      }
      setDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该API吗？')) return
    try {
      await deleteApi.mutateAsync({ api_id: id })
      toast.success('删除成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  const handleRefresh = async () => {
    try {
      await refreshApi.mutateAsync({})
      toast.success('刷新成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '刷新失败')
    }
  }

  const methodColors: Record<string, string> = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800',
    PATCH: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">API 管理</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshApi.isPending}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {refreshApi.isPending ? '刷新中...' : '刷新权限'}
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            新建 API
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索路径..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>路径</TableHead>
                <TableHead>方法</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center">加载中...</TableCell></TableRow>
              ) : apis.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center">暂无数据</TableCell></TableRow>
              ) : (
                apis.map((api) => (
                  <TableRow key={api.id}>
                    <TableCell><Badge variant="outline">{api.path}</Badge></TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${methodColors[api.method] || 'bg-gray-100'}`}>
                        {api.method}
                      </span>
                    </TableCell>
                    <TableCell>{api.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(api)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(api.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">共 {total} 条记录</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>上一页</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={apis.length < pageSize}>下一页</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialogType === 'add' ? '新建 API' : '编辑 API'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>路径</Label>
              <Input value={formData.path} onChange={(e) => setFormData({ ...formData, path: e.target.value })} placeholder="/api/v1/xxx" />
            </div>
            <div className="grid gap-2">
              <Label>方法</Label>
              <Select value={formData.method} onValueChange={(value: any) => setFormData({ ...formData, method: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>描述</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={createApi.isPending || updateApi.isPending}>
              {createApi.isPending || updateApi.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
