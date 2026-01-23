'use client'

import { useState } from 'react'
import { useAuditLogs } from '@/lib/api/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Eye, RotateCcw } from 'lucide-react'
import { formatDateTime, methodColors } from '@/lib/utils'
import { DatePickerWithRange } from '@/components/ui/data-picker-range'
import { format } from 'date-fns'

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-6 w-12 rounded" /></TableCell>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-6 w-10 rounded" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 rounded-full mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 rounded-full mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filters, setFilters] = useState({
    username: '',
    module: '',
    summary: '',
    method: '',
    path: '',
    status: '',
    start_time: '',
    end_time: '',
  })

  const { data: logsData, isLoading } = useAuditLogs({
    page,
    page_size: pageSize,
    username: filters.username || undefined,
    method: filters.method || undefined,
    path: filters.path || undefined,
    status: filters.status ? Number(filters.status) : undefined,
    start_time: filters.start_time || undefined,
    end_time: filters.end_time || undefined,
  })

  const response = logsData as { data?: { data?: any[]; total?: number } } | undefined
  const logs = response?.data?.data || []
  const total = response?.data?.total || 0

  const methodOptions = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'PUT', value: 'PUT' },
    { label: 'PATCH', value: 'PATCH' },
  ]

  const handleDateRangeChange = (type: 'start' | 'end', value: string | null) => {
    setFilters(prev => ({ ...prev, [type]: value || '' }))
  }

  const handleSearch = () => {
    setPage(1)
  }

  const handleReset = () => {
    setFilters({
      username: '',
      module: '',
      summary: '',
      method: '',
      path: '',
      status: '',
      start_time: '',
      end_time: '',
    })
  }

  const formatJSON = (data: any) => {
    try {
      if (!data) return '无数据'
      return typeof data === 'string' ? JSON.stringify(JSON.parse(data), null, 2) : JSON.stringify(data, null, 2)
    } catch {
      return data || '无数据'
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">审计日志</h1>

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
                <RotateCcw className="h-4 w-4 mr-1" />
                重置
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
            <div className="col-span-1 md:col-span-3">
              <Input
                placeholder="用户名称"
                value={filters.username}
                onChange={(e) => setFilters({ ...filters, username: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="col-span-1 md:col-span-3">
              <Input
                placeholder="功能模块"
                value={filters.module}
                onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="col-span-1 md:col-span-3">
              <Input
                placeholder="接口概要"
                value={filters.summary}
                onChange={(e) => setFilters({ ...filters, summary: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="col-span-1 md:col-span-3">
              <Select
                value={filters.method}
                onValueChange={(value) => setFilters({ ...filters, method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请求方法" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="#">所有方法</SelectItem>
                  {methodOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1 md:col-span-3">
              <Input
                placeholder="请求路径"
                value={filters.path}
                onChange={(e) => setFilters({ ...filters, path: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="col-span-1 md:col-span-3">
              <Input
                placeholder="状态码"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="col-span-2 md:col-span-6">
              <DatePickerWithRange 
                onChange={(range) => {
                  setFilters(prev => ({
                    ...prev,
                    start_time: range.from ? format(range.from, "yyyy-MM-dd HH:mm:ss") : '',
                    end_time: range.to ? format(range.to, "yyyy-MM-dd HH:mm:ss") : ''
                  }))
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">用户名</TableHead>
                <TableHead className="w-20">接口概要</TableHead>
                <TableHead className="w-20">功能模块</TableHead>
                <TableHead className="w-20">方法</TableHead>
                <TableHead>路径</TableHead>
                <TableHead className="w-16">状态</TableHead>
                <TableHead className="w-20 text-center">请求体</TableHead>
                <TableHead className="w-20 text-center">响应体</TableHead>
                <TableHead className="w-20">耗时</TableHead>
                <TableHead className="w-32">操作时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton />
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">暂无数据</TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.username}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground truncate block max-w-[80px]" title={log.summary}>
                        {log.summary || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground truncate block max-w-[80px]" title={log.module}>
                        {log.module || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${methodColors[log.method] || 'bg-gray-100'}`}>
                        {log.method}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="max-w-[200px] truncate font-mono text-xs">
                        {log.path}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.status === 200 ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] max-h-[400px] overflow-auto">
                          <pre className="text-xs bg-muted p-2 rounded">{formatJSON(log.request_args || log.request_body)}</pre>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="text-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] max-h-[400px] overflow-auto">
                          <pre className="text-xs bg-muted p-2 rounded">{formatJSON(log.response_body)}</pre>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>{log.response_time || log.latency}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">共 {total} 条记录</p>
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
                disabled={logs.length < pageSize}
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
