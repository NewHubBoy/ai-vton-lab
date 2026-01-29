'use client'

import { useState } from 'react'
import { useModelPhotosTryon } from '@/lib/api/hooks'
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
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-6 w-16 rounded" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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
  { label: '处理中', value: 'processing' },
  { label: '完成', value: 'completed' },
  { label: '失败', value: 'failed' },
]

const statusColors: Record<string, string> = {
  queued: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

const generationTypeLabels: Record<string, string> = {
  text2img: '文本生成',
  img2img: '图片生成',
  tryon: '换装合成',
}

export default function TryonRecordsPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filters, setFilters] = useState({
    status: 'all',
  })

  const { data: recordsData, isLoading } = useModelPhotosTryon({
    page,
    page_size: pageSize,
    status: filters.status === 'all' ? undefined : filters.status,
  })

  // 后端返回格式: { code: 200, msg: "success", data: [...records], total: 11, page: 1, page_size: 10 }
  // data 直接是数组，不是嵌套对象
  const response = recordsData as { data?: any[]; total?: number } | undefined
  const records = response?.data || []
  const total = response?.total || 0

  const handleSearch = () => {
    setPage(1)
  }

  const handleReset = () => {
    setFilters({
      status: 'all',
    })
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">换装合成记录</h1>

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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-24">用户</TableHead>
                <TableHead className="w-20">类型</TableHead>
                <TableHead className="w-20">状态</TableHead>
                <TableHead className="w-48">名称</TableHead>
                <TableHead className="w-16">图片数</TableHead>
                <TableHead className="w-20 text-center">预览</TableHead>
                <TableHead className="w-32">创建时间</TableHead>
                <TableHead className="w-32">完成时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton />
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">暂无换装合成记录</TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <span className="font-mono text-xs">{record.id}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{record.username || record.user_id}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {generationTypeLabels[record.generation_type] || record.generation_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[record.status] || 'bg-gray-100'}>
                        {record.status === 'queued' && '排队中'}
                        {record.status === 'processing' && '处理中'}
                        {record.status === 'completed' && '完成'}
                        {record.status === 'failed' && '失败'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm truncate block max-w-[180px]" title={record.name}>
                        {record.name || '-'}
                      </span>
                    </TableCell>
                    <TableCell>{record.image_count}</TableCell>
                    <TableCell className="text-center">
                      {record.status === 'completed' ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">查看</span>
                              </div>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px]">
                            <div className="space-y-2">
                              <h4 className="font-medium">{record.name || '换装合成结果'}</h4>
                              {record.description && (
                                <p className="text-sm text-muted-foreground">{record.description}</p>
                              )}
                              {record.final_prompt && (
                                <div className="text-xs bg-muted p-2 rounded">
                                  <span className="font-medium">Prompt: </span>
                                  {record.final_prompt}
                                </div>
                              )}
                              <div className="text-sm">
                                <span className="font-medium">图片数量: </span>
                                {record.image_count}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : record.status === 'failed' ? (
                        <span className="text-xs text-red-500">失败</span>
                      ) : record.status === 'processing' ? (
                        <span className="text-xs text-blue-500">{record.progress}%</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(record.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {record.finished_at ? formatDateTime(record.finished_at) : '-'}
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
                disabled={records.length < pageSize}
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
