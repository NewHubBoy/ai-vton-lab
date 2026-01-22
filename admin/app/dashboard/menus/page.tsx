'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useMenus, useCreateMenu, useUpdateMenu, useDeleteMenu } from '@/lib/api/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'

export default function MenusPage() {
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add')
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    path: '',
    component: '',
    icon: '',
    sort: 0,
    type: 'menu',
    visible: true,
  })
  const [editingId, setEditingId] = useState<number | null>(null)

  const { data: menusData, isLoading } = useMenus({ title: search || undefined })

  const createMenu = useCreateMenu()
  const updateMenu = useUpdateMenu()
  const deleteMenu = useDeleteMenu()

  const handleAdd = () => {
    setDialogType('add')
    setFormData({
      title: '',
      name: '',
      path: '',
      component: '',
      icon: '',
      sort: 0,
      type: 'menu',
      visible: true,
    })
    setDialogOpen(true)
  }

  const handleEdit = (menu: { id: number; title: string; name: string; path?: string; component?: string; icon?: string; sort: number; type: string; visible: boolean }) => {
    setDialogType('edit')
    setEditingId(menu.id)
    setFormData({
      title: menu.title,
      name: menu.name,
      path: menu.path || '',
      component: menu.component || '',
      icon: menu.icon || '',
      sort: menu.sort,
      type: menu.type,
      visible: menu.visible,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (dialogType === 'add') {
        await createMenu.mutateAsync(formData as any)
        toast.success('创建成功')
      } else {
        await updateMenu.mutateAsync({ ...formData, menu_id: editingId! } as any)
        toast.success('更新成功')
      }
      setDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该菜单吗？')) return
    try {
      await deleteMenu.mutateAsync({ menu_id: id })
      toast.success('删除成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  const menus = menusData || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">菜单管理</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新建菜单
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索菜单..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>路径</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>可见</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">加载中...</TableCell>
                </TableRow>
              ) : menus.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">暂无数据</TableCell>
                </TableRow>
              ) : (
                menus.map((menu) => (
                  <TableRow key={menu.id}>
                    <TableCell>{menu.title}</TableCell>
                    <TableCell><Badge variant="outline">{menu.name}</Badge></TableCell>
                    <TableCell>{menu.path || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={menu.type === 'dir' ? 'default' : 'secondary'}>
                        {menu.type === 'dir' ? '目录' : menu.type === 'menu' ? '菜单' : '按钮'}
                      </Badge>
                    </TableCell>
                    <TableCell>{menu.sort}</TableCell>
                    <TableCell>
                      <Badge variant={menu.visible ? 'default' : 'destructive'}>
                        {menu.visible ? '显示' : '隐藏'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(menu)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(menu.id)} className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
          <DialogHeader>
            <DialogTitle>{dialogType === 'add' ? '新建菜单' : '编辑菜单'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">标题</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">名称</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="path">路径</Label>
              <Input id="path" value={formData.path} onChange={(e) => setFormData({ ...formData, path: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">类型</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dir">目录</SelectItem>
                  <SelectItem value="menu">菜单</SelectItem>
                  <SelectItem value="btn">按钮</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sort">排序</Label>
              <Input id="sort" type="number" value={formData.sort} onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={createMenu.isPending || updateMenu.isPending}>
              {createMenu.isPending || updateMenu.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
