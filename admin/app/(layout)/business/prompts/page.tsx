'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  usePromptConfigGroups,
  useCreatePromptConfigGroup,
  useUpdatePromptConfigGroup,
  usePromptConfigOptions,
  useCreatePromptConfigOption,
  useUpdatePromptConfigOption,
} from '@/lib/api/hooks'
import { PromptConfigGroup, PromptConfigOption } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil, Settings2, Loader2, Image as ImageIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function PromptConfigPage() {
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [groupDialogType, setGroupDialogType] = useState<'add' | 'edit'>('add')
  const [currentGroup, setCurrentGroup] = useState<PromptConfigGroup | null>(null)

  const [optionsSheetOpen, setOptionsSheetOpen] = useState(false)
  const [selectedGroupForOptions, setSelectedGroupForOptions] = useState<PromptConfigGroup | null>(null)

  const { data: groupsResponse, isLoading: groupsLoading } = usePromptConfigGroups()

  const groups = groupsResponse?.data || []

  const createGroup = useCreatePromptConfigGroup()
  const updateGroup = useUpdatePromptConfigGroup()

  const handleAddGroup = () => {
    setGroupDialogType('add')
    setCurrentGroup(null)
    setGroupDialogOpen(true)
  }

  const handleEditGroup = (group: PromptConfigGroup) => {
    setGroupDialogType('edit')
    setCurrentGroup(group)
    setGroupDialogOpen(true)
  }

  const handleManageOptions = (group: PromptConfigGroup) => {
    setSelectedGroupForOptions(group)
    setOptionsSheetOpen(true)
  }

  const handleGroupSubmit = async (data: Partial<PromptConfigGroup>) => {
    try {
      if (groupDialogType === 'add') {
        await createGroup.mutateAsync(data)
        toast.success('配置组创建成功')
      } else if (currentGroup) {
        await updateGroup.mutateAsync({ ...data, id: currentGroup.id })
        toast.success('配置组更新成功')
      }
      setGroupDialogOpen(false)
    } catch (error) {
      toast.error('操作失败')
      console.error(error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">提示词配置</h1>
        <Button onClick={handleAddGroup}>
          <Plus className="mr-2 h-4 w-4" />
          新建配置组
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>配置组列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>输入类型</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    暂无配置组
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.group_name}</TableCell>
                    <TableCell><Badge variant="outline">{group.group_key}</Badge></TableCell>
                    <TableCell>{group.input_type}</TableCell>
                    <TableCell>{group.sort_order}</TableCell>
                    <TableCell>
                      <Badge variant={group.is_active ? 'default' : 'secondary'}>
                        {group.is_active ? '启用' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditGroup(group)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleManageOptions(group)}>
                          <Settings2 className="h-4 w-4" />
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

      <GroupDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        type={groupDialogType}
        initialData={currentGroup}
        onSubmit={handleGroupSubmit}
        isSubmitting={createGroup.isPending || updateGroup.isPending}
      />

      {selectedGroupForOptions && (
        <OptionsSheet
          open={optionsSheetOpen}
          onOpenChange={setOptionsSheetOpen}
          group={selectedGroupForOptions}
        />
      )}
    </div>
  )
}

// --- Group Dialog ---

interface GroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'add' | 'edit'
  initialData: PromptConfigGroup | null
  onSubmit: (data: Partial<PromptConfigGroup>) => void
  isSubmitting: boolean
}

function GroupDialog({
  open,
  onOpenChange,
  type,
  initialData,
  onSubmit,
  isSubmitting,
}: GroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'add' ? '新建配置组' : '编辑配置组'}</DialogTitle>
          <DialogDescription>
            配置组定义了一组相关的提示词选项。
          </DialogDescription>
        </DialogHeader>
        <GroupForm
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

interface GroupFormProps {
  initialData: PromptConfigGroup | null
  type: 'add' | 'edit'
  onSubmit: (data: Partial<PromptConfigGroup>) => void
  isSubmitting: boolean
  onCancel: () => void
}

function GroupForm({ initialData, type, onSubmit, isSubmitting, onCancel }: GroupFormProps) {
  const [formData, setFormData] = useState<Partial<PromptConfigGroup>>(
    initialData || {
      group_name: '',
      group_key: '',
      description: '',
      input_type: 'select',
      is_multiple: false,
      is_required: false,
      sort_order: 0,
      is_active: true,
    }
  )

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>名称</Label>
          <Input
            value={formData.group_name}
            onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Key</Label>
          <Input
            value={formData.group_key}
            onChange={(e) => setFormData({ ...formData, group_key: e.target.value })}
            required
            disabled={type === 'edit'}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>输入类型</Label>
          <Select
            value={formData.input_type}
            onValueChange={(val) => setFormData({ ...formData, input_type: val })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="select">下拉选择</SelectItem>
              <SelectItem value="radio">单选框</SelectItem>
              <SelectItem value="checkbox">多选框</SelectItem>
              <SelectItem value="text">文本输入</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>排序</Label>
          <Input
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
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

      <div className="flex gap-6 pt-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label>启用</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_multiple}
            onCheckedChange={(checked) => setFormData({ ...formData, is_multiple: checked })}
          />
          <Label>多选</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_required}
            onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
          />
          <Label>必填</Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit" disabled={isSubmitting}>保存</Button>
      </DialogFooter>
    </form>
  )
}

// --- Options Sheet ---

function OptionsSheet({
  open,
  onOpenChange,
  group,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: PromptConfigGroup
}) {
  const { data: optionsResponse, isLoading } = usePromptConfigOptions(group.id)

  const options = optionsResponse || []

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOption, setEditingOption] = useState<PromptConfigOption | null>(null)

  const createOption = useCreatePromptConfigOption()
  const updateOption = useUpdatePromptConfigOption()

  const handleAdd = () => {
    setEditingOption(null)
    setDialogOpen(true)
  }

  const handleEdit = (opt: PromptConfigOption) => {
    setEditingOption(opt)
    setDialogOpen(true)
  }

  const handleSubmit = async (data: Partial<PromptConfigOption>) => {
    try {
      if (editingOption) {
        await updateOption.mutateAsync({ ...data, id: editingOption.id, group_id: group.id })
        toast.success('选项更新成功')
      } else {
        await createOption.mutateAsync({ ...data, group_id: group.id })
        toast.success('选项创建成功')
      }
      setDialogOpen(false)
    } catch (e) {
      toast.error('操作失败')
      console.error(e)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{group.group_name} - 选项管理</SheetTitle>
          <SheetDescription>管理该组下的所有选项</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              添加选项
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead className="w-[80px]">排序</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center">加载中...</TableCell></TableRow>
                ) : options.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">暂无选项</TableCell></TableRow>
                ) : (
                  options.map(opt => (
                    <TableRow key={opt.id}>
                      <TableCell>
                        <div className="font-medium">{opt.option_label}</div>
                        <div className="text-xs text-muted-foreground">{opt.option_key}</div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={opt.prompt_text}>
                        {opt.prompt_text || '-'}
                      </TableCell>
                      <TableCell>{opt.sort_order}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(opt)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <OptionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialData={editingOption}
          onSubmit={handleSubmit}
          isSubmitting={createOption.isPending || updateOption.isPending}
        />
      </SheetContent>
    </Sheet>
  )
}

// --- Option Dialog ---

interface OptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: PromptConfigOption | null
  onSubmit: (data: Partial<PromptConfigOption>) => void
  isSubmitting: boolean
}

function OptionDialog({ open, onOpenChange, initialData, onSubmit, isSubmitting }: OptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? '编辑选项' : '新建选项'}</DialogTitle>
        </DialogHeader>
        <OptionForm
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

interface OptionFormProps {
  initialData: PromptConfigOption | null
  onSubmit: (data: Partial<PromptConfigOption>) => void
  isSubmitting: boolean
  onCancel: () => void
}

function OptionForm({ initialData, onSubmit, isSubmitting, onCancel }: OptionFormProps) {
  const [formData, setFormData] = useState<Partial<PromptConfigOption>>(
    initialData || {
      option_label: '',
      option_key: '',
      prompt_text: '',
      negative_prompt: '',
      sort_order: 0,
      is_active: true,
      is_default: false,
      prompt_order: 2
    }
  )

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>选项名称</Label>
          <Input
            value={formData.option_label}
            onChange={(e) => setFormData({ ...formData, option_label: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Key</Label>
          <Input
            value={formData.option_key}
            onChange={(e) => setFormData({ ...formData, option_key: e.target.value })}
            required
            disabled={!!initialData}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Prompt Text (正向提示词)</Label>
        <Input
          value={formData.prompt_text || ''}
          onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Negative Prompt (负向提示词)</Label>
        <Input
          value={formData.negative_prompt || ''}
          onChange={(e) => setFormData({ ...formData, negative_prompt: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>排序权重</Label>
          <Input
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>图片URL (可选)</Label>
          <div className="flex gap-2">
            <Input
              value={formData.image_url || ''}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://..."
            />
            {formData.image_url && (
              <div className="h-10 w-10 border rounded flex items-center justify-center bg-gray-50">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-6 pt-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label>启用</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_default}
            onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
          />
          <Label>默认选中</Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit" disabled={isSubmitting}>保存</Button>
      </DialogFooter>
    </form>
  )
}