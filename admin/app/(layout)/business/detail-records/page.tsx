'use client'

import { useState } from 'react'
import { useTasks } from '@/lib/api/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, RefreshCw } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { TaskStatus, TaskType } from '@/lib/api'

function TableSkeleton() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
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
    { label: '排队中', value: TaskStatus.QUEUED },
    { label: '处理中', value: TaskStatus.PROCESSING },
    { label: '完成', value: TaskStatus.SUCCEEDED },
    { label: '失败', value: TaskStatus.FAILED },
]

const statusColors: Record<string, string> = {
    [TaskStatus.QUEUED]: 'bg-yellow-100 text-yellow-800',
    [TaskStatus.PROCESSING]: 'bg-blue-100 text-blue-800',
    [TaskStatus.SUCCEEDED]: 'bg-green-100 text-green-800',
    [TaskStatus.FAILED]: 'bg-red-100 text-red-800',
}

export default function DetailRecordsPage() {
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [filters, setFilters] = useState({
        status: 'all',
    })

    // Correctly using useTasks with TaskType.DETAIL
    const { data: recordsData, isLoading, refetch } = useTasks({
        page,
        page_size: pageSize,
        status: filters.status === 'all' ? undefined : filters.status,
        task_type: TaskType.DETAIL,
    })

    const records = recordsData?.data || []
    const total = recordsData?.total || 0

    const handleSearch = () => {
        setPage(1)
        refetch()
    }

    const handleReset = () => {
        setFilters({
            status: 'all',
        })
        setPage(1)
        setTimeout(() => refetch(), 0)
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">详情页生成记录</h1>

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
                                <TableHead className="w-20">状态</TableHead>
                                <TableHead className="w-48">模版/参数</TableHead>
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
                                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">暂无详情页生成记录</TableCell>
                                </TableRow>
                            ) : (
                                records.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            <span className="font-mono text-xs">{record.id.slice(0, 8)}...</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{record.username || record.user_id}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[record.status] || 'bg-gray-100'}>
                                                {record.status === TaskStatus.QUEUED && '排队中'}
                                                {record.status === TaskStatus.PROCESSING && '处理中'}
                                                {record.status === TaskStatus.SUCCEEDED && '完成'}
                                                {record.status === TaskStatus.FAILED && '失败'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[200px] text-xs text-muted-foreground line-clamp-2">
                                                {record.detail?.template_id && <div className="font-medium">Template: {record.detail.template_id}</div>}
                                                {/* Display additional info if available */}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {(record.result?.images?.length ?? 0) > 0 ? (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <img src={record.result?.images?.[0]} alt="preview" className="h-8 w-8 object-cover rounded" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[300px]">
                                                        <img src={record.result?.images?.[0]} alt="Full Preview" className="w-full rounded" />
                                                        {record.result?.local_paths && (
                                                            <div className="mt-2 text-xs text-muted-foreground break-all">
                                                                Local: {record.result.local_paths[0]}
                                                            </div>
                                                        )}
                                                    </PopoverContent>
                                                </Popover>
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
