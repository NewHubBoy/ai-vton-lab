'use client'

import { useState } from 'react'
import { useImageTasks, useImageTaskDetail } from '@/lib/api/hooks'
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
import type { ImageTask } from '@/lib/api'

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-6 w-16 rounded" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
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
  { label: '生成中', value: 'running' },
  { label: '成功', value: 'succeeded' },
  { label: '失败', value: 'failed' },
]

const statusColors: Record<string, string> = {
  queued: 'bg-yellow-100 text-yellow-800',
  running: 'bg-blue-100 text-blue-800',
  succeeded: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  queued: '排队中',
  running: '生成中',
  succeeded: '成功',
  failed: '失败',
}

// 任务详情 Dialog
function TaskDetailDialog({ taskId, open, onOpenChange }: { taskId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: task, isLoading } = useImageTaskDetail(taskId)

  console.log('task', task)
  const taskData = task as ImageTask | undefined

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
                <p className="text-sm font-mono break-all">{taskData.task_id}</p>
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
                <p className="text-sm">{taskData.task_type || '-'}</p>
              </div>
            </div>

            <Tabs defaultValue="prompt" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="prompt">提示词</TabsTrigger>
                <TabsTrigger value="result">生成结果</TabsTrigger>
                <TabsTrigger value="params">参数信息</TabsTrigger>
              </TabsList>

              <TabsContent value="prompt" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">正向提示词</span>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    {taskData.prompt || '-'}
                  </div>
                </div>
                {taskData.user_prompt && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">用户提示词</span>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {taskData.user_prompt}
                    </div>
                  </div>
                )}
                {taskData.negative_prompt && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">负向提示词</span>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {taskData.negative_prompt}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="result" className="space-y-4 mt-4">
                {taskData.status === 'succeeded' && taskData.result?.images?.length ? (
                  <div className="grid grid-cols-2 gap-4">
                    {taskData.result.images.map((img, idx) => (
                      <div key={idx} className="space-y-2">
                        <img
                          src={img.oss_url || img.url}
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
                ) : taskData.status === 'running' ? (
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

              <TabsContent value="params" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">宽高比</span>
                    <p className="text-sm">{taskData.aspect_ratio}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">分辨率</span>
                    <p className="text-sm">{taskData.resolution}</p>
                  </div>
                </div>
                {taskData.selected_configs && Object.keys(taskData.selected_configs).length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">选配置</span>
                    <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(taskData.selected_configs, null, 2)}
                    </pre>
                  </div>
                )}
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
              </TabsContent>
            </Tabs>
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
  const [offset, setOffset] = useState(0)
  const [limit] = useState(10)
  const [filters, setFilters] = useState({
    status: 'all',
    user_id: '',
  })
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const { data: tasksData, isLoading } = useImageTasks({
    limit,
    offset,
    status: filters.status === 'all' ? undefined : filters.status,
    user_id: filters.user_id || undefined,
  })

  // 后端返回格式: { code: 200, msg: "success", data: [...tasks], total: 11 }
  // data 直接是数组，不是嵌套对象
  const response = tasksData as { data?: ImageTask[]; total?: number } | undefined
  const tasks = response?.data || []
  const total = response?.total || 0

  console.log('tasks', response, tasks, total)

  const handleSearch = () => {
    setOffset(0)
  }

  const handleReset = () => {
    setFilters({
      status: 'all',
      user_id: '',
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
            <div className="col-span-1 md:col-span-4">
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
            <div className="col-span-1 md:col-span-4">
              <Input
                placeholder="用户ID"
                value={filters.user_id}
                onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">任务ID</TableHead>
                <TableHead className="w-24">用户</TableHead>
                <TableHead className="w-20">状态</TableHead>
                <TableHead className="w-64">提示词</TableHead>
                <TableHead className="w-16">比例</TableHead>
                <TableHead className="w-16">分辨率</TableHead>
                <TableHead className="w-20 text-center">结果</TableHead>
                <TableHead className="w-32">创建时间</TableHead>
                <TableHead className="w-32">完成时间</TableHead>
                <TableHead className="w-12">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton />
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">暂无数据</TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.task_id}>
                    <TableCell>
                      <span className="font-mono text-xs truncate block max-w-[180px]" title={task.task_id}>
                        {task.task_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{task.username || task.user_id}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[task.status]}>
                        {statusLabels[task.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm truncate block max-w-[250px]" title={task.prompt}>
                        {task.prompt}
                      </span>
                    </TableCell>
                    <TableCell>{task.aspect_ratio}</TableCell>
                    <TableCell>{task.resolution}</TableCell>
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
                                {task.result.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img.oss_url || img.url}
                                    alt={`result-${idx}`}
                                    className="w-full rounded border"
                                  />
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : task.status === 'failed' ? (
                        <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                      ) : task.status === 'running' ? (
                        <RefreshCw className="h-4 w-4 text-blue-500 mx-auto animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(task.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {task.finished_at ? formatDateTime(task.finished_at) : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetail(task.task_id)}
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
                onClick={() => setOffset((p) => Math.max(0, p - limit))}
                disabled={offset === 0}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset((p) => p + limit)}
                disabled={tasks.length < limit}
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
