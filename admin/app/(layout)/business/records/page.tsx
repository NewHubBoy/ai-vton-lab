'use client'

import { useState } from 'react'
import { useImageTasks } from '@/lib/api/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, RefreshCw } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

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
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-12 w-12 rounded" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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

export default function ImageTasksPage() {
  const [offset, setOffset] = useState(0)
  const [limit] = useState(10)
  const [filters, setFilters] = useState({
    status: 'all',
    user_id: '',
  })

  const { data: tasksData, isLoading } = useImageTasks({
    limit,
    offset,
    status: filters.status === 'all' ? undefined : filters.status,
    user_id: filters.user_id || undefined,
  })

  const response = tasksData as { data?: any[]; total?: number } | undefined
  const tasks = response?.data || []
  const total = response?.total || 0

  const handleSearch = () => {
    setOffset(0)
  }

  const handleReset = () => {
    setFilters({
      status: 'all',
      user_id: '',
    })
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
                      <Badge className={statusColors[task.status] || 'bg-gray-100'}>
                        {task.status === 'queued' && '排队中'}
                        {task.status === 'running' && '生成中'}
                        {task.status === 'succeeded' && '成功'}
                        {task.status === 'failed' && '失败'}
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
                              <img
                                src={task.result.images[0]}
                                alt="result"
                                className="h-10 w-10 object-cover rounded"
                              />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px]">
                            <div className="space-y-2">
                              <h4 className="font-medium">生成结果</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {task.result.images.map((img: string, idx: number) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`result-${idx}`}
                                    className="w-full rounded border"
                                  />
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : task.status === 'failed' ? (
                        <span className="text-xs text-red-500">失败</span>
                      ) : task.status === 'running' ? (
                        <span className="text-xs text-blue-500">生成中...</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(task.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {task.finished_at ? formatDateTime(task.finished_at) : '-'}
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
    </div>
  )
}
