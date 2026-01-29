'use client'

import { useState } from 'react'
import { useTasks, useTaskDetail } from '@/lib/api/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, RefreshCw, Eye, Clock, XCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import type { GenerationTask } from '@/lib/api'

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-6 w-16 rounded" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '排队中', value: 'queued' },
  { label: '生成中', value: 'processing' },
  { label: '成功', value: 'succeeded' },
  { label: '失败', value: 'failed' },
]

const taskTypeOptions = [
  { label: '全部', value: 'all' },
  { label: '虚拟试穿', value: 'tryon' },
  { label: '详情页生成', value: 'detail' },
  { label: '模特生成', value: 'model' },
]

const statusColors: Record<string, string> = {
  queued: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  succeeded: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  queued: '排队中',
  processing: '生成中',
  succeeded: '成功',
  failed: '失败',
}

const taskTypeLabels: Record<string, string> = {
  tryon: '虚拟试穿',
  detail: '详情页生成',
  model: '模特生成',
}

// 任务详情 Dialog
function TaskDetailDialog({ taskId, open, onOpenChange }: { taskId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: task, isLoading } = useTaskDetail(taskId)

  const taskData = task as GenerationTask | undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>任务详情</DialogTitle>
          <DialogDescription>查看生成任务的详细信息</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : taskData ? (
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">任务ID</span>
                <p className="text-sm font-mono break-all">{taskData.id}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">用户</span>
                <p className="text-sm">{taskData.username || taskData.user_id}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">状态</span>
                <Badge className={statusColors[taskData.status]}>
                  {statusLabels[taskData.status]}
                </Badge>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">任务类型</span>
                <p className="text-sm">{taskTypeLabels[taskData.task_type] || taskData.task_type}</p>
              </div>
            </div>

            <Tabs defaultValue="result" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="result">生成结果</TabsTrigger>
                <TabsTrigger value="prompt">提示词/参数</TabsTrigger>
                <TabsTrigger value="source">输入素材</TabsTrigger>
              </TabsList>

              <TabsContent value="result" className="space-y-4 mt-4">
                {taskData.status === 'succeeded' && taskData.result?.images?.length ? (
                  <div className="grid grid-cols-2 gap-4">
                    {taskData.result.images.map((url, idx) => (
                      <div key={idx} className="space-y-2">
                        <img
                          src={url}
                          alt={`生成结果 ${idx + 1}`}
                          className="w-full rounded-lg border"
                        />
                      </div>
                    ))}
                  </div>
                ) : taskData.status === 'failed' ? (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">生成失败</span>
                    </div>
                    {taskData.error && (
                      <p className="text-sm text-red-500 mt-2">{taskData.error.message}</p>
                    )}
                  </div>
                ) : taskData.status === 'processing' ? (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>生成中...</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
                    暂无生成结果
                  </div>
                )}
              </TabsContent>

              <TabsContent value="prompt" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">提示词</span>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    {taskData.prompt || '-'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">宽高比</span>
                    <p className="text-sm">{taskData.aspect_ratio || '1:1'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">质量</span>
                    <p className="text-sm">{taskData.quality || '1K'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">来源平台</span>
                    <p className="text-sm">{taskData.platform || '-'}</p>
                  </div>
                </div>

                {/* 任务特定参数 */}
                {taskData.task_type === 'tryon' && taskData.tryon && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <span className="text-sm font-medium">试穿参数</span>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>类别: {taskData.tryon.category}</div>
                      <div>Seed: {taskData.tryon.seed}</div>
                    </div>
                  </div>
                )}

                {taskData.task_type === 'detail' && taskData.detail && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <span className="text-sm font-medium">详情页参数</span>
                    <div className="text-sm">Template ID: {taskData.detail.template_id}</div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="source" className="space-y-4 mt-4">
                {taskData.task_type === 'tryon' && taskData.tryon ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-sm font-medium">模特/人物图</span>
                      <img src={taskData.tryon.person_image} alt="Person" className="w-full rounded border max-h-64 object-contain" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">服装图</span>
                      <img src={taskData.tryon.garment_image} alt="Garment" className="w-full rounded border max-h-64 object-contain" />
                    </div>
                  </div>
                ) : taskData.task_type === 'detail' && taskData.detail ? (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">输入商品图</span>
                    <img src={taskData.detail.input_image} alt="Input" className="w-full rounded border max-h-64 object-contain" />
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">该类型任务无额外输入素材展示</div>
                )}
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">创建时间</span>
                <p className="text-sm">{formatDateTime(taskData.created_at)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">开始时间</span>
                <p className="text-sm">{taskData.started_at ? formatDateTime(taskData.started_at) : '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">完成时间</span>
                <p className="text-sm">{taskData.finished_at ? formatDateTime(taskData.finished_at) : '-'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            任务不存在
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function ImageTasksPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filters, setFilters] = useState({
    status: 'all',
    task_type: 'all',
  })
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const { data: tasksData, isLoading } = useTasks({
    page,
    page_size: pageSize,
    status: filters.status === 'all' ? undefined : filters.status,
    task_type: filters.task_type === 'all' ? undefined : filters.task_type,
  })

  // 后端返回格式: TaskListResponse
  const response = tasksData as { data?: GenerationTask[]; total?: number } | undefined
  const tasks = response?.data || []
  const total = response?.total || 0

  const handleSearch = () => {
    setPage(1)
  }

  const handleReset = () => {
    setFilters({
      status: 'all',
      task_type: 'all',
    })
  }

  const handleViewDetail = (taskId: string) => {
    setDetailTaskId(taskId)
    setDetailDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">生成记录</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">查询过滤</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSearch}>
                <Search className="h-4 w-4 mr-1" />
                搜索
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-1" />
                重置
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
            <div className="col-span-1 md:col-span-3">
              <Select
                value={filters.task_type}
                onValueChange={(value) => setFilters({ ...filters, task_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="任务类型" />
                </SelectTrigger>
                <SelectContent>
                  {taskTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1 md:col-span-3">
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">任务ID</TableHead>
                <TableHead className="w-24">用户</TableHead>
                <TableHead className="w-24">任务类型</TableHead>
                <TableHead className="w-20">状态</TableHead>
                <TableHead className="w-64">提示词</TableHead>
                <TableHead className="w-16">比例</TableHead>
                <TableHead className="w-20 text-center">结果</TableHead>
                <TableHead className="w-32">创建时间</TableHead>
                <TableHead className="w-12">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton />
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">暂无数据</TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <span className="font-mono text-xs truncate block max-w-[180px]" title={task.id}>
                        {task.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{task.username || task.user_id}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {taskTypeLabels[task.task_type] || task.task_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[task.status]}>
                        {statusLabels[task.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm truncate block max-w-[250px]" title={task.prompt}>
                        {task.prompt || '-'}
                      </span>
                    </TableCell>
                    <TableCell>{task.aspect_ratio || '-'}</TableCell>
                    <TableCell className="text-center">
                      {task.status === 'succeeded' && task.result?.images?.[0] ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px]">
                            <div className="space-y-2">
                              <h4 className="font-medium">生成结果</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {task.result.images.map((url, idx) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt={`result-${idx}`}
                                    className="w-full rounded border"
                                  />
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(task.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetail(task.id)}
                        title="查看详情"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
                disabled={tasks.length < pageSize}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 任务详情 Dialog */}
      {detailTaskId && (
        <TaskDetailDialog
          taskId={detailTaskId}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      )}
    </div>
  )
}
