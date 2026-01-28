'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  useDicts,
  useCreateDict,
  useUpdateDict,
  useDeleteDict,
  useDictItems,
  useCreateDictItem,
  useUpdateDictItem,
  useDeleteDictItem,
} from '@/lib/api/hooks'
import { Dict, DictItem } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil, Settings2, Loader2, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function DictManagementPage() {
  const [page, setPage] = useState(1)
  const [searchName, setSearchName] = useState('')
  const [searchCode, setSearchCode] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add')
  const [currentDict, setCurrentDict] = useState<Dict | null>(null)

  const [itemsSheetOpen, setItemsSheetOpen] = useState(false)
  const [selectedDict, setSelectedDict] = useState<Dict | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dictToDelete, setDictToDelete] = useState<Dict | null>(null)

  const { data: dictsResponse, isLoading } = useDicts({
    page,
    page_size: 10,
    name: searchName || undefined,
    code: searchCode || undefined,
  })

  const dicts = dictsResponse?.data || []
  const total = dictsResponse?.total || 0

  const createDict = useCreateDict()
  const updateDict = useUpdateDict()
  const deleteDict = useDeleteDict()

  const handleAdd = () => {
    setDialogType('add')
    setCurrentDict(null)
    setDialogOpen(true)
  }

  const handleEdit = (dict: Dict) => {
    setDialogType('edit')
    setCurrentDict(dict)
    setDialogOpen(true)
  }

  const handleManageItems = (dict: Dict) => {
    setSelectedDict(dict)
    setItemsSheetOpen(true)
  }

  const handleDeleteClick = (dict: Dict) => {
    setDictToDelete(dict)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!dictToDelete) return
    try {
      await deleteDict.mutateAsync({ id: dictToDelete.id })
      toast.success('字典删除成功')
      setDeleteDialogOpen(false)
      setDictToDelete(null)
    } catch {
      toast.error('删除失败')
    }
  }

  const handleSubmit = async (data: Partial<Dict>) => {
    try {
      if (dialogType === 'add') {
        await createDict.mutateAsync(data)
        toast.success('字典创建成功')
      } else if (currentDict) {
        await updateDict.mutateAsync({ ...data, id: currentDict.id })
        toast.success('字典更新成功')
      }
      setDialogOpen(false)
    } catch {
      toast.error('操作失败')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">字典管理</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新建字典
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>字典列表</CardTitle>
          <div className="flex gap-4 mt-4">
            <Input
              placeholder="按名称搜索"
              value={searchName}
              onChange={(e) => { setSearchName(e.target.value); setPage(1) }}
              className="max-w-xs"
            />
            <Input
              placeholder="按编码搜索"
              value={searchCode}
              onChange={(e) => { setSearchCode(e.target.value); setPage(1) }}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>编码</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : dicts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    暂无字典
                  </TableCell>
                </TableRow>
              ) : (
                dicts.map((dict) => (
                  <TableRow key={dict.id}>
                    <TableCell className="font-medium">{dict.name}</TableCell>
                    <TableCell><Badge variant="outline">{dict.code}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate">{dict.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={dict.is_active ? 'default' : 'secondary'}>
                        {dict.is_active ? '启用' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(dict)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleManageItems(dict)}>
                          <Settings2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(dict)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {total > 10 && (
            <div className="flex justify-end mt-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                上一页
              </Button>
              <span className="text-sm text-muted-foreground py-2">
                第 {page} 页 / 共 {Math.ceil(total / 10)} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(total / 10)}
                onClick={() => setPage(page + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <DictDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={dialogType}
        initialData={currentDict}
        onSubmit={handleSubmit}
        isSubmitting={createDict.isPending || updateDict.isPending}
      />

      {selectedDict && (
        <DictItemsSheet
          open={itemsSheetOpen}
          onOpenChange={setItemsSheetOpen}
          dict={selectedDict}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除字典 &quot;{dictToDelete?.name}&quot; 吗？此操作将同时删除该字典下的所有字典项，且无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// --- Dict Dialog ---

interface DictDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'add' | 'edit'
  initialData: Dict | null
  onSubmit: (data: Partial<Dict>) => void
  isSubmitting: boolean
}

function DictDialog({
  open,
  onOpenChange,
  type,
  initialData,
  onSubmit,
  isSubmitting,
}: DictDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'add' ? '新建字典' : '编辑字典'}</DialogTitle>
          <DialogDescription>
            字典用于管理系统中的枚举值和选项列表。
          </DialogDescription>
        </DialogHeader>
        <DictForm
          key={initialData?.id || 'new'}
          initialData={initialData}
          type={type}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface DictFormProps {
  initialData: Dict | null
  type: 'add' | 'edit'
  onSubmit: (data: Partial<Dict>) => void
  isSubmitting: boolean
  onCancel: () => void
}

function DictForm({ initialData, type, onSubmit, isSubmitting, onCancel }: DictFormProps) {
  const [formData, setFormData] = useState<Partial<Dict>>(
    initialData || {
      name: '',
      code: '',
      description: '',
      is_active: true,
    }
  )

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>名称</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>编码</Label>
          <Input
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
            disabled={type === 'edit'}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>描述</Label>
        <Input
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label>启用</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit" disabled={isSubmitting}>保存</Button>
      </DialogFooter>
    </form>
  )
}

// --- Dict Items Sheet ---

function DictItemsSheet({
  open,
  onOpenChange,
  dict,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  dict: Dict
}) {
  const { data: itemsResponse, isLoading } = useDictItems(dict.id)

  const items = itemsResponse?.data || []

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DictItem | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<DictItem | null>(null)

  const createItem = useCreateDictItem()
  const updateItem = useUpdateDictItem()
  const deleteItem = useDeleteDictItem()

  const handleAdd = () => {
    setEditingItem(null)
    setDialogOpen(true)
  }

  const handleEdit = (item: DictItem) => {
    setEditingItem(item)
    setDialogOpen(true)
  }

  const handleDeleteClick = (item: DictItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    try {
      await deleteItem.mutateAsync({ id: itemToDelete.id })
      toast.success('字典项删除成功')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch {
      toast.error('删除失败')
    }
  }

  const handleSubmit = async (data: Partial<DictItem>) => {
    try {
      if (editingItem) {
        await updateItem.mutateAsync({ ...data, id: editingItem.id })
        toast.success('字典项更新成功')
      } else {
        await createItem.mutateAsync({ ...data, dict_id: dict.id } as DictItem & { dict_id: number })
        toast.success('字典项创建成功')
      }
      setDialogOpen(false)
    } catch {
      toast.error('操作失败')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[540px] overflow-y-auto px-4">
        <SheetHeader>
          <SheetTitle>{dict.name} - 字典项管理</SheetTitle>
          <SheetDescription>管理该字典下的所有选项</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              添加字典项
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标签</TableHead>
                  <TableHead>值</TableHead>
                  <TableHead className="w-[80px]">排序</TableHead>
                  <TableHead className="w-[80px]">状态</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center">加载中...</TableCell></TableRow>
                ) : items.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">暂无字典项</TableCell></TableRow>
                ) : (
                  items.map((item: DictItem) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.label}</TableCell>
                      <TableCell><Badge variant="outline">{item.value}</Badge></TableCell>
                      <TableCell>{item.sort_order}</TableCell>
                      <TableCell>
                        <Badge variant={item.is_active ? 'default' : 'secondary'} className="text-xs">
                          {item.is_active ? '启用' : '禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(item)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DictItemDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialData={editingItem}
          onSubmit={handleSubmit}
          isSubmitting={createItem.isPending || updateItem.isPending}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除字典项 &quot;{itemToDelete?.label}&quot; 吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>删除</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  )
}

// --- Dict Item Dialog ---

interface DictItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: DictItem | null
  onSubmit: (data: Partial<DictItem>) => void
  isSubmitting: boolean
}

function DictItemDialog({ open, onOpenChange, initialData, onSubmit, isSubmitting }: DictItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? '编辑字典项' : '新建字典项'}</DialogTitle>
        </DialogHeader>
        <DictItemForm
          key={initialData?.id || 'new'}
          initialData={initialData}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface DictItemFormProps {
  initialData: DictItem | null
  onSubmit: (data: Partial<DictItem>) => void
  isSubmitting: boolean
  onCancel: () => void
}

function DictItemForm({ initialData, onSubmit, isSubmitting, onCancel }: DictItemFormProps) {
  const [formData, setFormData] = useState<Partial<DictItem>>(
    initialData || {
      label: '',
      value: '',
      sort_order: 0,
      is_active: true,
    }
  )

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>标签</Label>
          <Input
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>值</Label>
          <Input
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>排序</Label>
        <Input
          type="number"
          value={formData.sort_order}
          onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
        />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label>启用</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit" disabled={isSubmitting}>保存</Button>
      </DialogFooter>
    </form>
  )
}
