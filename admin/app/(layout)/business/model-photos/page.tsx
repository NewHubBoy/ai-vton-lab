'use client'

import { useState } from 'react'
import { useModelPhotos } from '@/lib/api/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Image as ImageIcon, RefreshCw } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-6 w-20 rounded" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-16 w-16 rounded" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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

const generationTypeOptions = [
  { label: '全部', value: 'all' },
  { label: '文本生成', value: 'text2img' },
  { label: '图片生成', value: 'img2img' },
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

export default function ModelPhotosPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filters, setFilters] = useState({
    status: 'all',
    generation_type: 'all',
  })

  const { data: recordsData, isLoading, refetch } = useModelPhotos({
    page,
    page_size: pageSize,
    status: filters.status === 'all' ? undefined : filters.status,
    generation_type: filters.generation_type === 'all' ? undefined : filters.generation_type,
  })

  // 后端返回格式: { code: 200, msg: "success", data: [...records], total: 11, page: 1, page_size: 10 }
  // data 直接是数组，不是嵌套对象
  const response = recordsData as { data?: any[]; total?: number } | undefined
  const records = response?.data || []
  const total = response?.total || 0

  const handleReset = () => {
    setFilters({
      status: 'all',
      generation_type: 'all',
    })
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">模特生成记录</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">查询过滤</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-1" />
                刷新
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
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
              <Select
                value={filters.generation_type}
                onValueChange={(value) => setFilters({ ...filters, generation_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="生成类型" />
                </SelectTrigger>
                <SelectContent>
                  {generationTypeOptions.map((opt) => (
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
                <TableHead className="w-24">类型</TableHead>
                <TableHead className="w-20">状态</TableHead>
                <TableHead className="w-24">参考图</TableHead>
                <TableHead className="w-48">名称</TableHead>
                <TableHead className="w-16">图片数</TableHead>
                <TableHead className="w-32">创建时间</TableHead>
                <TableHead className="w-32">完成时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton />
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">暂无模特生成记录</TableCell>
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
                      {record.reference_images && record.reference_images.length > 0 ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className="relative cursor-pointer group w-fit">
                              <img
                                src={record.reference_images[0]}
                                alt="参考图"
                                className="w-12 h-12 object-cover rounded border border-gray-200 group-hover:border-primary transition-colors"
                              />
                              {record.reference_images.length > 1 && (
                                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] px-1 rounded-full flex items-center justify-center shadow-sm">
                                  +{record.reference_images.length - 1}
                                </span>
                              )}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2" align="start">
                            <div className="grid grid-cols-2 gap-2 max-w-md">
                              {record.reference_images.map((url: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`参考图 ${idx + 1}`}
                                  className="w-32 h-32 object-cover rounded border border-gray-200"
                                />
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center rounded border border-gray-100 bg-gray-50">
                          <ImageIcon className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm truncate block max-w-[180px]" title={record.name}>
                        {record.name || '-'}
                      </span>
                    </TableCell>
                    <TableCell>{record.image_count}</TableCell>
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
