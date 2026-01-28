'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useMenus, useCreateMenu, useUpdateMenu, useDeleteMenu } from '@/lib/api/hooks'
import { Menu } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Search, Pencil, Trash2, ChevronRight, ChevronDown, Folder, FileText, MousePointerClick } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconPicker, IconDisplay } from '@/components/icon-picker'

// 扁平化树（用于下拉选择，带层级标识）
const flattenTree = (tree: Menu[], level = 0, result: (Menu & { level: number })[] = []) => {
  tree.forEach(node => {
    result.push({ ...node, level })
    if (node.children && node.children.length > 0) {
      flattenTree(node.children, level + 1, result)
    }
  })
  return result
}

export default function MenusPage() {
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add')
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})

  const defaultFormData = {
    parent_id: 0,
    name: '',
    path: '',
    component: '',
    icon: '',
    order: 0,
    menu_type: 'menu' as 'catalog' | 'menu' | 'button',
    is_hidden: false,
    keepalive: false,
    redirect: ''
  }

  const [formData, setFormData] = useState(defaultFormData)
  const [editingId, setEditingId] = useState<number | null>(null)

  const { data, isLoading } = useMenus({ name: search || undefined })

  // 适配 API 响应结构: data 可能直接是数组，也可能是带 data 属性的对象
  const menusData = useMemo(() => {
    if (!data) return []
    if (Array.isArray(data)) return data
    const resp = data as any
    return resp.data || []
  }, [data])

  const createMenu = useCreateMenu()
  const updateMenu = useUpdateMenu()
  const deleteMenu = useDeleteMenu()

  const treeData = menusData

  // 扁平化选项列表（用于父级选择）
  const parentOptions = useMemo(() => {
    return flattenTree(treeData)
  }, [treeData])

  const toggleExpand = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAdd = (parentId = 0) => {
    setDialogType('add')
    setFormData({ ...defaultFormData, parent_id: parentId })
    setDialogOpen(true)
  }

  const handleEdit = (menu: Menu) => {
    setDialogType('edit')
    setEditingId(menu.id)
    setFormData({
      parent_id: menu.parent_id,
      name: menu.name,
      path: menu.path || '',
      component: menu.component || '',
      icon: menu.icon || '',
      order: menu.order,
      menu_type: menu.menu_type,
      is_hidden: menu.is_hidden,
      keepalive: menu.keepalive,
      redirect: menu.redirect || ''
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (dialogType === 'add') {
        await createMenu.mutateAsync(formData)
        toast.success('创建成功')
      } else {
        await updateMenu.mutateAsync({ ...formData, id: editingId! })
        toast.success('更新成功')
      }
      setDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该菜单及其子菜单吗？')) return
    try {
      await deleteMenu.mutateAsync({ menu_id: id })
      toast.success('删除成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  // 递归渲染表格行
  const renderRows = (nodes: Menu[], level = 0) => {
    return nodes.flatMap(node => {
      const isExpanded = expandedRows[node.id]
      const hasChildren = node.children && node.children.length > 0

      const rows = [
        <TableRow key={node.id} className="hover:bg-muted/50 text-sm">
          <TableCell className="font-medium">
            <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren ? (
                <Button variant="ghost" size="icon" className="h-4 w-4 mr-2" onClick={() => toggleExpand(node.id)}>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              ) : (
                <span className="w-6 mr-2" />
              )}
              {node.name}
            </div>
          </TableCell>
          <TableCell>
            <IconDisplay iconName={node.icon} className="h-4 w-4" fallback={<span className="text-muted-foreground text-xs">-</span>} />
          </TableCell>
          <TableCell className="text-xs font-mono text-muted-foreground">{node.path || '-'}</TableCell>
          <TableCell className="text-xs font-mono text-muted-foreground">{node.component || '-'}</TableCell>
          <TableCell>
            <div className="flex items-center gap-1">
              {node.menu_type === 'catalog' && <Folder className="h-3 w-3 text-blue-500" />}
              {node.menu_type === 'menu' && <FileText className="h-3 w-3 text-green-500" />}
              {node.menu_type === 'button' && <MousePointerClick className="h-3 w-3 text-purple-500" />}
              <span className="text-xs">
                {node.menu_type === 'catalog' ? '目录' : node.menu_type === 'menu' ? '菜单' : '按钮'}
              </span>
            </div>
          </TableCell>
          <TableCell>{node.order}</TableCell>
          <TableCell>
            <Badge variant={!node.is_hidden ? 'secondary' : 'destructive'} className="text-[10px] px-1 h-5">
              {!node.is_hidden ? '显示' : '隐藏'}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleAdd(node.id)} title="添加子菜单">
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(node)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDelete(node.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ]

      if (isExpanded && node.children) {
        rows.push(...renderRows(node.children, level + 1))
      }
      return rows
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">菜单管理</h1>
        <Button onClick={() => handleAdd(0)}>
          <Plus className="mr-2 h-4 w-4" />
          新建根菜单
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 px-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索菜单名称..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              const allIds: Record<number, boolean> = {}
              const collectIds = (nodes: Menu[]) => {
                nodes.forEach(n => {
                  if (n.children && n.children.length > 0) {
                    allIds[n.id] = true
                    collectIds(n.children)
                  }
                })
              }
              collectIds(treeData)
              setExpandedRows(allIds)
            }}>
              展开所有
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] pl-4">名称</TableHead>
                  <TableHead>图标</TableHead>
                  <TableHead>路由路径</TableHead>
                  <TableHead>组件路径</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead className="w-[60px]">排序</TableHead>
                  <TableHead className="w-[80px]">状态</TableHead>
                  <TableHead className="w-[110px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">加载中...</TableCell>
                  </TableRow>
                ) : treeData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  renderRows(treeData)
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogType === 'add' ? '新建菜单' : '编辑菜单'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4 px-1">
            <div className="col-span-2 grid gap-2">
              <Label htmlFor="parent_id">上级菜单</Label>
              <Select
                value={formData.parent_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, parent_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择上级菜单" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="0">顶级菜单</SelectItem>
                  {parentOptions.map(opt => (
                    <SelectItem key={opt.id} value={opt.id.toString()} disabled={opt.id === editingId}>
                      <span style={{ paddingLeft: `${opt.level * 16}px` }}>{opt.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="menu_type">菜单类型</Label>
              <Select value={formData.menu_type} onValueChange={(value: any) => setFormData({ ...formData, menu_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="catalog">目录</SelectItem>
                  <SelectItem value="menu">菜单</SelectItem>
                  <SelectItem value="button">按钮</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">菜单名称</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="如：系统管理" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="order">排序值</Label>
              <Input id="order" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="icon">图标 (Icon)</Label>
              <IconPicker value={formData.icon} onChange={(iconName) => setFormData({ ...formData, icon: iconName })} placeholder="选择图标" />
            </div>

            {formData.menu_type !== 'button' && (
              <div className="grid gap-2">
                <Label htmlFor="path">路由路径 (Path)</Label>
                <Input id="path" value={formData.path} onChange={(e) => setFormData({ ...formData, path: e.target.value })} placeholder="如：users 或 /system" />
              </div>
            )}

            {formData.menu_type === 'menu' && (
              <div className="grid gap-2">
                <Label htmlFor="component">组件路径 (Component)</Label>
                <Input id="component" value={formData.component} onChange={(e) => setFormData({ ...formData, component: e.target.value })} placeholder="如：/system/user" />
              </div>
            )}

            {formData.menu_type === 'catalog' && (
              <div className="grid gap-2">
                <Label htmlFor="redirect">跳转路径 (Redirect)</Label>
                <Input id="redirect" value={formData.redirect} onChange={(e) => setFormData({ ...formData, redirect: e.target.value })} placeholder="如：/system/user" />
              </div>
            )}

            <div className="col-span-2 flex items-center gap-8 pt-2">
              <div className="flex items-center space-x-2">
                <Switch id="is_hidden" checked={formData.is_hidden} onCheckedChange={(checked) => setFormData({ ...formData, is_hidden: checked })} />
                <Label htmlFor="is_hidden">隐藏状态</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="keepalive" checked={formData.keepalive} onCheckedChange={(checked) => setFormData({ ...formData, keepalive: checked })} />
                <Label htmlFor="keepalive">KeepAlive 缓存</Label>
              </div>
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
