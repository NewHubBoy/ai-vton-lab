'use client'

import { useState } from 'react'
import { useAdminRechargeRecords, useAdminRechargeConfigs, useAdminGenerateCardCodes, useAdminCreateRechargeConfig } from '@/lib/api/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Search, RefreshCw, Plus, Copy } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  succeeded: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const methodLabels: Record<string, string> = {
  card: '卡密',
  stripe: 'Stripe',
  alipay: '支付宝',
  wechat: '微信',
  bank: '银行卡',
  admin: '手动充值',
}

export default function RechargeRecordsPage() {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [filters, setFilters] = useState({
    status: 'all',
    user_id: '',
  })
  const [showCardDialog, setShowCardDialog] = useState(false)
  const [cardForm, setCardForm] = useState({ amount: '', count: '10' })
  const [generatedCards, setGeneratedCards] = useState<{ code: string; amount: number; credits: number }[]>([])
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [configForm, setConfigForm] = useState({ name: '', amount: '', credits: '', description: '' })

  const { data: recordsData, isLoading } = useAdminRechargeRecords({
    page,
    page_size: pageSize,
    status: filters.status === 'all' ? undefined : filters.status,
    user_id: filters.user_id ? parseInt(filters.user_id) : undefined,
  })

  const { data: configsData } = useAdminRechargeConfigs()
  const { mutate: generateCards, isPending: generating } = useAdminGenerateCardCodes()
  const { mutate: createConfig, isPending: creatingConfig } = useAdminCreateRechargeConfig()

  const response = recordsData as { data?: any[]; total?: number } | undefined
  const records = response?.data || []
  const total = response?.total || 0

  const handleGenerateCards = () => {
    if (!cardForm.amount || !cardForm.count) {
      toast.error('请填写完整信息')
      return
    }

    generateCards({
      amount: parseFloat(cardForm.amount),
      count: parseInt(cardForm.count),
    }, {
      onSuccess: (data) => {
        setGeneratedCards(data.codes)
        toast.success(`成功生成 ${data.codes.length} 张卡密`)
      },
      onError: () => {
        toast.error('生成失败')
      },
    })
  }

  const handleCreateConfig = () => {
    if (!configForm.name || !configForm.amount || !configForm.credits) {
      toast.error('请填写完整信息')
      return
    }

    createConfig({
      name: configForm.name,
      amount: parseFloat(configForm.amount),
      credits: parseInt(configForm.credits),
      description: configForm.description || undefined,
      sort_order: (configsData?.length || 0) + 1,
    }, {
      onSuccess: () => {
        setShowConfigDialog(false)
        setConfigForm({ name: '', amount: '', credits: '', description: '' })
        toast.success('创建成功')
      },
      onError: () => {
        toast.error('创建失败')
      },
    })
  }

  const copyCards = () => {
    const text = generatedCards.map(c => `${c.code} - ${c.amount}元 (${c.credits}积分)`).join('\n')
    navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">充值管理</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCardDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            生成卡密
          </Button>
          <Button variant="outline" onClick={() => setShowConfigDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            充值配置
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">查询过滤</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(1)}>
                <Search className="h-4 w-4 mr-1" />
                搜索
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setFilters({ status: 'all', user_id: '' })}>
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
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="pending">待支付</SelectItem>
                  <SelectItem value="processing">处理中</SelectItem>
                  <SelectItem value="succeeded">成功</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1 md:col-span-4">
              <Input
                placeholder="用户ID"
                value={filters.user_id}
                onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">订单号</TableHead>
                <TableHead className="w-20">用户</TableHead>
                <TableHead className="w-20">金额</TableHead>
                <TableHead className="w-20">积分</TableHead>
                <TableHead className="w-24">支付方式</TableHead>
                <TableHead className="w-24">状态</TableHead>
                <TableHead className="w-32">创建时间</TableHead>
                <TableHead className="w-32">完成时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton />
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">暂无数据</TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <span className="font-mono text-xs truncate block max-w-[150px]" title={record.order_no}>
                        {record.order_no}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{record.username || record.user_id}</span>
                    </TableCell>
                    <TableCell>¥{record.amount}</TableCell>
                    <TableCell>{record.credits}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{methodLabels[record.payment_method] || record.payment_method}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[record.payment_status] || 'bg-gray-100'}>
                        {record.status_text}
                      </Badge>
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

      {/* 生成卡密对话框 */}
      <Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>生成卡密</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">面额 (元)</label>
              <Input
                type="number"
                placeholder="如: 10"
                value={cardForm.amount}
                onChange={(e) => setCardForm({ ...cardForm, amount: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">生成数量</label>
              <Input
                type="number"
                placeholder="如: 10"
                value={cardForm.count}
                onChange={(e) => setCardForm({ ...cardForm, count: e.target.value })}
                className="mt-1"
              />
            </div>
            {generatedCards.length > 0 && (
              <div className="bg-gray-50 p-3 rounded max-h-48 overflow-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">生成的卡密</span>
                  <Button size="sm" variant="ghost" onClick={copyCards}>
                    <Copy className="h-3 w-3 mr-1" />
                    复制
                  </Button>
                </div>
                {generatedCards.map((card, idx) => (
                  <div key={idx} className="text-xs font-mono py-1 border-b last:border-0">
                    {card.code} - ¥{card.amount} ({card.credits}积分)
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCardDialog(false)}>关闭</Button>
            <Button onClick={handleGenerateCards} disabled={generating}>
              {generating ? '生成中...' : '生成'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 充值配置对话框 */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加充值配置</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">配置名称</label>
              <Input
                placeholder="如: 基础套餐"
                value={configForm.name}
                onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">金额 (元)</label>
              <Input
                type="number"
                placeholder="如: 10"
                value={configForm.amount}
                onChange={(e) => setConfigForm({ ...configForm, amount: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">兑换积分</label>
              <Input
                type="number"
                placeholder="如: 1000"
                value={configForm.credits}
                onChange={(e) => setConfigForm({ ...configForm, credits: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">描述 (可选)</label>
              <Input
                placeholder="如: 性价比首选"
                value={configForm.description}
                onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>取消</Button>
            <Button onClick={handleCreateConfig} disabled={creatingConfig}>
              {creatingConfig ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
