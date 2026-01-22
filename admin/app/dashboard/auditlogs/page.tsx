'use client'

import { useState } from 'react'
import { useAuditLogs } from '@/lib/api/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Filter } from 'lucide-react'

export default function AuditLogsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filters, setFilters] = useState({
    username: '',
    method: '',
    path: '',
  })

  const { data: logsData, isLoading } = useAuditLogs({
    page,
    page_size: pageSize,
    username: filters.username || undefined,
    method: filters.method || undefined,
    path: filters.path || undefined,
  })

  const response = logsData as { data?: { data?: any[]; total?: number } } | undefined
  const logs = response?.data?.data || []
  const total = response?.data?.total || 0

  const methodColors: Record<string, string> = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800',
    PATCH: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">审计日志</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户名..."
                value={filters.username}
                onChange={(e) => setFilters({ ...filters, username: e.target.value })}
                className="pl-8"
              />
            </div>
            <div className="relative w-full max-w-xs">
              <Input
                placeholder="搜索路径..."
                value={filters.path}
                onChange={(e) => setFilters({ ...filters, path: e.target.value })}
              />
            </div>
            <div className="relative w-full max-w-xs">
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={filters.method}
                onChange={(e) => setFilters({ ...filters, method: e.target.value })}
              >
                <option value="">所有方法</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>方法</TableHead>
                <TableHead>路径</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>耗时</TableHead>
                <TableHead>时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">加载中...</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">暂无数据</TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.username}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${methodColors[log.method] || 'bg-gray-100'}`}>
                        {log.method}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="max-w-xs truncate">
                        {log.path}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.ip}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === 200 ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.latency}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
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
