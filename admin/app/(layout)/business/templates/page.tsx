'use client'

import { useState } from 'react'
import { useTemplates, useDeleteTemplate } from '@/lib/api/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, Plus, Edit, Trash, ExternalLink } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { Template } from '@/lib/api'
import { toast } from 'sonner'
import TemplateDialog from './components/template-dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

function TableSkeleton() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-12 w-12 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
            ))}
        </>
    )
}

export default function TemplatesPage() {
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10) // Pagination handled by backend now? Frontend needs adaptation if backend sends paginated
    // API Hook returns { data: Template[], total: number, ... } now
    const { data: templatesData, isLoading, refetch } = useTemplates({
        page,
        page_size: pageSize
    })

    // Safe cast or check structure
    const response = templatesData as unknown as { data: Template[], total: number } | undefined
    const templates = Array.isArray(templatesData) ? templatesData : (response?.data || [])
    const total = Array.isArray(templatesData) ? templatesData.length : (response?.total || 0)

    const deleteMutation = useDeleteTemplate()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

    const handleCreate = () => {
        setEditingTemplate(null)
        setDialogOpen(true)
    }

    const handleEdit = (template: Template) => {
        setEditingTemplate(template)
        setDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id)
            toast.success('删除成功')
        } catch (error) {
            toast.error('删除失败')
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">详情页模版管理</h1>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-1" />
                    创建模版
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {/* Optional filters can go here */}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => refetch()}>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                刷新
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">ID</TableHead>
                                <TableHead className="w-20">封面</TableHead>
                                <TableHead className="w-48">名称</TableHead>
                                <TableHead className="w-64">配置预览</TableHead>
                                <TableHead className="w-20">状态</TableHead>
                                <TableHead className="w-32">创建时间</TableHead>
                                <TableHead className="w-32 text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableSkeleton />
                            ) : templates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">暂无模版</TableCell>
                                </TableRow>
                            ) : (
                                templates.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell>
                                            <span className="font-mono text-xs">{template.id.slice(0, 8)}...</span>
                                        </TableCell>
                                        <TableCell>
                                            {template.cover_image ? (
                                                <img src={template.cover_image} alt={template.name} className="w-10 h-10 object-cover rounded" />
                                            ) : (
                                                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">No Img</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{template.name}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs text-muted-foreground line-clamp-2 font-mono">
                                                {JSON.stringify(template.config)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={template.is_active ? 'default' : 'secondary'}>
                                                {template.is_active ? '启用' : '禁用'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDateTime(template.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>确认删除?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                此操作无法撤销。这将永久删除模版 "{template.name}".
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>取消</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(template.id)} className="bg-destructive hover:bg-destructive/90">
                                                                删除
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <div className="flex items-center justify-between mt-4">
                        {/* Pagination controls if needed */}
                        <div className="text-sm text-muted-foreground">共 {total} 条</div>
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
                                disabled={templates.length < pageSize}
                            >
                                下一页
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <TemplateDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                template={editingTemplate}
            />
        </div>
    )
}
