'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useDepts, useCreateDept, useUpdateDept, useDeleteDept } from '@/lib/api/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'

export default function DeptsPage() {
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add')
  const [formData, setFormData] = useState({ name: '', sort: 0, leader: '', phone: '', email: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  const { data: deptsData, isLoading } = useDepts({ dept_name: search || undefined })

  const createDept = useCreateDept()
  const updateDept = useUpdateDept()
  const deleteDept = useDeleteDept()

  const handleAdd = () => {
    setDialogType('add')
    setFormData({ name: '', sort: 0, leader: '', phone: '', email: '' })
    setDialogOpen(true)
  }

  const handleEdit = (dept: { id: number; name: string; sort: number; leader?: string; phone?: string; email?: string }) => {
    setDialogType('edit')
    setEditingId(dept.id)
    setFormData({
      name: dept.name,
      sort: dept.sort,
      leader: dept.leader || '',
      phone: dept.phone || '',
      email: dept.email || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (dialogType === 'add') {
        await createDept.mutateAsync(formData as any)
        toast.success('创建成功')
      } else {
        await updateDept.mutateAsync({ ...formData, dept_id: editingId! } as any)
        toast.success('更新成功')
      }
      setDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该部门吗？')) return
    try {
      await deleteDept.mutateAsync({ dept_id: id })
      toast.success('删除成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  const depts = deptsData || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">部门管理</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新建部门
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索部门..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>部门名称</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>负责人</TableHead>
                <TableHead>电话</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center">加载中...</TableCell></TableRow>
              ) : depts.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">暂无数据</TableCell></TableRow>
              ) : (
                depts.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell><Badge variant="outline">{dept.name}</Badge></TableCell>
                    <TableCell>{dept.sort}</TableCell>
                    <TableCell>{dept.leader || '-'}</TableCell>
                    <TableCell>{dept.phone || '-'}</TableCell>
                    <TableCell>{dept.email || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(dept)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialogType === 'add' ? '新建部门' : '编辑部门'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>部门名称</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>排序</Label>
              <Input type="number" value={formData.sort} onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) })} />
            </div>
            <div className="grid gap-2">
              <Label>负责人</Label>
              <Input value={formData.leader} onChange={(e) => setFormData({ ...formData, leader: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>电话</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>邮箱</Label>
              <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={createDept.isPending || updateDept.isPending}>
              {createDept.isPending || updateDept.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
