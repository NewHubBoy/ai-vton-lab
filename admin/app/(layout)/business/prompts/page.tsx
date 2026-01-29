'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  usePromptConfigGroups,
  useCreatePromptConfigGroup,
  useUpdatePromptConfigGroup,
  usePromptConfigOptions,
  useCreatePromptConfigOption,
  useUpdatePromptConfigOption,
  usePromptConfigSettings,
  useCreatePromptConfigSetting,
  useUpdatePromptConfigSetting,
  useDeletePromptConfigSetting,
  useDictItemsByCode,
} from '@/lib/api/hooks';
import { PromptConfigGroup, PromptConfigOption, PromptConfigSetting } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Settings2, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PromptConfigPage() {
  const [activeTab, setActiveTab] = useState('groups');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">提示词配置</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="groups">配置组</TabsTrigger>
          <TabsTrigger value="settings">系统配置</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="mt-4">
          <ConfigGroupsTab />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <SystemSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============ 配置组 Tab ============

function ConfigGroupsTab() {
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupDialogType, setGroupDialogType] = useState<'add' | 'edit'>('add');
  const [currentGroup, setCurrentGroup] = useState<PromptConfigGroup | null>(null);
  const [filterConfigType, setFilterConfigType] = useState<string>('');

  const [optionsSheetOpen, setOptionsSheetOpen] = useState(false);
  const [selectedGroupForOptions, setSelectedGroupForOptions] = useState<PromptConfigGroup | null>(null);

  const { data: groupsResponse, isLoading: groupsLoading } = usePromptConfigGroups({
    config_type: (filterConfigType === '-' ? undefined : filterConfigType) || undefined,
  });
  const { data: configTypes } = useDictItemsByCode('prompt_type');

  const groups = groupsResponse?.data || [];

  const createGroup = useCreatePromptConfigGroup();
  const updateGroup = useUpdatePromptConfigGroup();

  const handleAddGroup = () => {
    setGroupDialogType('add');
    setCurrentGroup(null);
    setGroupDialogOpen(true);
  };

  const handleEditGroup = (group: PromptConfigGroup) => {
    setGroupDialogType('edit');
    setCurrentGroup(group);
    setGroupDialogOpen(true);
  };

  const handleManageOptions = (group: PromptConfigGroup) => {
    setSelectedGroupForOptions(group);
    setOptionsSheetOpen(true);
  };

  const handleGroupSubmit = async (data: Partial<PromptConfigGroup>) => {
    try {
      if (groupDialogType === 'add') {
        await createGroup.mutateAsync(data);
        toast.success('配置组创建成功');
      } else if (currentGroup) {
        await updateGroup.mutateAsync({ ...data, id: currentGroup.id });
        toast.success('配置组更新成功');
      }
      setGroupDialogOpen(false);
    } catch (error) {
      toast.error('操作失败');
      console.error(error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>配置组列表</CardTitle>
            <Button onClick={handleAddGroup}>
              <Plus className="mr-2 h-4 w-4" />
              新建配置组
            </Button>
          </div>
          <div className="flex gap-4 mt-4">
            <Select value={filterConfigType} onValueChange={setFilterConfigType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="按类型筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-">全部类型</SelectItem>
                {configTypes?.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>输入类型</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    暂无配置组
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.group_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{group.group_key}</Badge>
                    </TableCell>
                    <TableCell>
                      {group.config_type ? (
                        <Badge variant="secondary">
                          {configTypes?.find((t) => t.value === group.config_type)?.label || group.config_type}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{group.input_type}</TableCell>
                    <TableCell>{group.sort_order}</TableCell>
                    <TableCell>
                      <Badge variant={group.is_active ? 'default' : 'secondary'}>{group.is_active ? '启用' : '禁用'}</Badge>
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

      {selectedGroupForOptions && <OptionsSheet open={optionsSheetOpen} onOpenChange={setOptionsSheetOpen} group={selectedGroupForOptions} />}
    </>
  );
}

// ============ 系统配置 Tab ============

function SystemSettingsTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add');
  const [currentSetting, setCurrentSetting] = useState<PromptConfigSetting | null>(null);
  const [filterGroupName, setFilterGroupName] = useState<string>('');

  // 获取所有配置用于提取分组名称
  const { data: allSettingsResponse } = usePromptConfigSettings({});

  // 获取筛选后的配置
  const { data: settingsResponse, isLoading } = usePromptConfigSettings({
    group_name: filterGroupName && filterGroupName !== '-' ? filterGroupName : undefined,
  });

  const allSettings = allSettingsResponse?.data || [];
  const settings = settingsResponse?.data || [];

  const createSetting = useCreatePromptConfigSetting();
  const updateSetting = useUpdatePromptConfigSetting();
  const deleteSetting = useDeletePromptConfigSetting();

  // 从所有配置中获取分组名称
  const groupNames = [...new Set(allSettings.map((s) => s.group_name).filter(Boolean))] as string[];

  const handleAdd = () => {
    setDialogType('add');
    setCurrentSetting(null);
    setDialogOpen(true);
  };

  const handleEdit = (setting: PromptConfigSetting) => {
    setDialogType('edit');
    setCurrentSetting(setting);
    setDialogOpen(true);
  };

  const handleDelete = async (setting: PromptConfigSetting) => {
    if (!setting.is_editable) {
      toast.error('该配置不可删除');
      return;
    }
    if (!confirm(`确定要删除配置 "${setting.key}" 吗？`)) return;
    try {
      await deleteSetting.mutateAsync(setting.id);
      toast.success('删除成功');
    } catch (e) {
      toast.error('删除失败');
      console.error(e);
    }
  };

  const handleSubmit = async (data: Partial<PromptConfigSetting>) => {
    try {
      if (dialogType === 'add') {
        await createSetting.mutateAsync(data);
        toast.success('配置创建成功');
      } else if (currentSetting) {
        await updateSetting.mutateAsync({ ...data, id: currentSetting.id });
        toast.success('配置更新成功');
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error('操作失败');
      console.error(error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>系统配置</CardTitle>
              <CardDescription className="mt-1">管理基础提示词模板、全局负向提示词等系统级配置</CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              新建配置
            </Button>
          </div>
          <div className="flex gap-4 mt-4">
            <Select value={filterGroupName} onValueChange={setFilterGroupName}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="按分组筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-">全部分组</SelectItem>
                {groupNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Key</TableHead>
                <TableHead>值</TableHead>
                <TableHead className="w-[100px]">分组</TableHead>
                <TableHead className="w-[80px]">类型</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : settings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    暂无配置
                  </TableCell>
                </TableRow>
              ) : (
                settings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell>
                      <div className="font-medium">{setting.key}</div>
                      {setting.description && <div className="text-xs text-muted-foreground">{setting.description}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[400px] truncate" title={setting.value}>
                        {setting.value}
                      </div>
                    </TableCell>
                    <TableCell>
                      {setting.group_name ? <Badge variant="outline">{setting.group_name}</Badge> : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{setting.value_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(setting)} disabled={!setting.is_editable}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(setting)} disabled={!setting.is_editable}>
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

      <SettingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={dialogType}
        initialData={currentSetting}
        onSubmit={handleSubmit}
        isSubmitting={createSetting.isPending || updateSetting.isPending}
      />
    </>
  );
}

// ============ Setting Dialog ============

interface SettingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'add' | 'edit';
  initialData: PromptConfigSetting | null;
  onSubmit: (data: Partial<PromptConfigSetting>) => void;
  isSubmitting: boolean;
}

function SettingDialog({ open, onOpenChange, type, initialData, onSubmit, isSubmitting }: SettingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{type === 'add' ? '新建系统配置' : '编辑系统配置'}</DialogTitle>
          <DialogDescription>系统配置用于存储基础提示词模板、全局设置等。</DialogDescription>
        </DialogHeader>
        <SettingForm key={initialData?.id || 'new'} initialData={initialData} type={type} onSubmit={onSubmit} isSubmitting={isSubmitting} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

interface SettingFormProps {
  initialData: PromptConfigSetting | null;
  type: 'add' | 'edit';
  onSubmit: (data: Partial<PromptConfigSetting>) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

function SettingForm({ initialData, type, onSubmit, isSubmitting, onCancel }: SettingFormProps) {
  const [formData, setFormData] = useState<Partial<PromptConfigSetting>>(
    initialData || {
      key: '',
      value: '',
      value_type: 'text',
      description: '',
      group_name: '',
      sort_order: 0,
      is_editable: true,
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Key</Label>
          <Input value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })} required disabled={type === 'edit'} placeholder="如: base_prompt_tryon" />
        </div>
        <div className="space-y-2">
          <Label>分组名称</Label>
          <Input value={formData.group_name || ''} onChange={(e) => setFormData({ ...formData, group_name: e.target.value })} placeholder="如: base_prompts" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>值</Label>
        <Textarea value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} required rows={4} placeholder="配置值..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>值类型</Label>
          <Select value={formData.value_type} onValueChange={(val) => setFormData({ ...formData, value_type: val })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">文本</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="list">列表</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>排序</Label>
          <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>描述</Label>
        <Input value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="配置说明..." />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Switch checked={formData.is_editable} onCheckedChange={(checked) => setFormData({ ...formData, is_editable: checked })} />
        <Label>可编辑</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          保存
        </Button>
      </DialogFooter>
    </form>
  );
}

// ============ Group Dialog ============

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'add' | 'edit';
  initialData: PromptConfigGroup | null;
  onSubmit: (data: Partial<PromptConfigGroup>) => void;
  isSubmitting: boolean;
}

function GroupDialog({ open, onOpenChange, type, initialData, onSubmit, isSubmitting }: GroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'add' ? '新建配置组' : '编辑配置组'}</DialogTitle>
          <DialogDescription>配置组定义了一组相关的提示词选项。</DialogDescription>
        </DialogHeader>
        <GroupForm key={initialData?.id || 'new'} initialData={initialData} type={type} onSubmit={onSubmit} isSubmitting={isSubmitting} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

interface GroupFormProps {
  initialData: PromptConfigGroup | null;
  type: 'add' | 'edit';
  onSubmit: (data: Partial<PromptConfigGroup>) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

function GroupForm({ initialData, type, onSubmit, isSubmitting, onCancel }: GroupFormProps) {
  const { data: configTypes } = useDictItemsByCode('prompt_type');
  const [formData, setFormData] = useState<Partial<PromptConfigGroup>>(
    initialData || {
      group_name: '',
      group_key: '',
      description: '',
      config_type: '',
      input_type: 'select',
      is_multiple: false,
      is_required: false,
      sort_order: 0,
      is_active: true,
    }
  );

  const supportsMultiple = formData.input_type === 'select' || formData.input_type === 'checkbox';
  const isCheckbox = formData.input_type === 'checkbox';

  const handleInputTypeChange = (val: string) => {
    const newData: Partial<PromptConfigGroup> = { ...formData, input_type: val };
    if (val === 'checkbox') {
      newData.is_multiple = true;
    } else if (val !== 'select') {
      newData.is_multiple = false;
    }
    setFormData(newData);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>名称</Label>
          <Input value={formData.group_name} onChange={(e) => setFormData({ ...formData, group_name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Key</Label>
          <Input value={formData.group_key} onChange={(e) => setFormData({ ...formData, group_key: e.target.value })} required disabled={type === 'edit'} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>配置类型</Label>
          <Select value={formData.config_type || ''} onValueChange={(val) => setFormData({ ...formData, config_type: val || undefined })}>
            <SelectTrigger>
              <SelectValue placeholder="选择配置类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-">无</SelectItem>
              {configTypes?.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>输入类型</Label>
          <Select value={formData.input_type} onValueChange={handleInputTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="select">下拉选择</SelectItem>
              <SelectItem value="radio">按钮单选</SelectItem>
              <SelectItem value="radiobox">圆形单选框</SelectItem>
              <SelectItem value="checkbox">多选框</SelectItem>
              <SelectItem value="toggle">开关</SelectItem>
              <SelectItem value="slider">滑块</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>排序</Label>
        <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
      </div>

      <div className="space-y-2">
        <Label>描述</Label>
        <Input value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
      </div>

      <div className="flex gap-6 pt-2">
        <div className="flex items-center gap-2">
          <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
          <Label>启用</Label>
        </div>
        {supportsMultiple && (
          <div className="flex items-center gap-2">
            <Switch checked={formData.is_multiple} onCheckedChange={(checked) => setFormData({ ...formData, is_multiple: checked })} disabled={isCheckbox} />
            <Label className={isCheckbox ? 'text-muted-foreground' : ''}>多选{isCheckbox ? '（多选框默认多选）' : ''}</Label>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Switch checked={formData.is_required} onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })} />
          <Label>必填</Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          保存
        </Button>
      </DialogFooter>
    </form>
  );
}

// ============ Options Sheet ============

function OptionsSheet({ open, onOpenChange, group }: { open: boolean; onOpenChange: (open: boolean) => void; group: PromptConfigGroup }) {
  const { data: optionsResponse, isLoading } = usePromptConfigOptions(group.id);

  const options = optionsResponse || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<PromptConfigOption | null>(null);

  const createOption = useCreatePromptConfigOption();
  const updateOption = useUpdatePromptConfigOption();

  const handleAdd = () => {
    setEditingOption(null);
    setDialogOpen(true);
  };

  const handleEdit = (opt: PromptConfigOption) => {
    setEditingOption(opt);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<PromptConfigOption>) => {
    try {
      if (editingOption) {
        await updateOption.mutateAsync({ ...data, id: editingOption.id, group_id: group.id });
        toast.success('选项更新成功');
      } else {
        await createOption.mutateAsync({ ...data, group_id: group.id });
        toast.success('选项创建成功');
      }
      setDialogOpen(false);
    } catch (e) {
      toast.error('操作失败');
      console.error(e);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] sm:w-[540px] overflow-y-auto px-4">
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
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : options.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      暂无选项
                    </TableCell>
                  </TableRow>
                ) : (
                  options.map((opt: PromptConfigOption) => (
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

        <OptionDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editingOption} onSubmit={handleSubmit} isSubmitting={createOption.isPending || updateOption.isPending} />
      </SheetContent>
    </Sheet>
  );
}

// ============ Option Dialog ============

interface OptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: PromptConfigOption | null;
  onSubmit: (data: Partial<PromptConfigOption>) => void;
  isSubmitting: boolean;
}

function OptionDialog({ open, onOpenChange, initialData, onSubmit, isSubmitting }: OptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? '编辑选项' : '新建选项'}</DialogTitle>
        </DialogHeader>
        <OptionForm key={initialData?.id || 'new'} initialData={initialData} onSubmit={onSubmit} isSubmitting={isSubmitting} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

interface OptionFormProps {
  initialData: PromptConfigOption | null;
  onSubmit: (data: Partial<PromptConfigOption>) => void;
  isSubmitting: boolean;
  onCancel: () => void;
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
      prompt_order: 2,
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>选项名称</Label>
          <Input value={formData.option_label} onChange={(e) => setFormData({ ...formData, option_label: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Key</Label>
          <Input value={formData.option_key} onChange={(e) => setFormData({ ...formData, option_key: e.target.value })} required disabled={!!initialData} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Prompt Text (正向提示词)</Label>
        <Input value={formData.prompt_text || ''} onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Negative Prompt (负向提示词)</Label>
        <Input value={formData.negative_prompt || ''} onChange={(e) => setFormData({ ...formData, negative_prompt: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>排序权重</Label>
          <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
        </div>
        <div className="space-y-2">
          <Label>图片URL (可选)</Label>
          <div className="flex gap-2">
            <Input value={formData.image_url || ''} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." />
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
          <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
          <Label>启用</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={formData.is_default} onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })} />
          <Label>默认选中</Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          保存
        </Button>
      </DialogFooter>
    </form>
  );
}
