'use client'

import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useCreateTemplate, useUpdateTemplate } from '@/lib/api/hooks'
import { toast } from 'sonner'
import { Template } from '@/lib/api'

const formSchema = z.object({
    name: z.string().min(1, '名称不能为空'),
    cover_image: z.string().optional(),
    config: z.string().min(1, '配置不能为空').refine((val) => {
        try {
            JSON.parse(val)
            return true
        } catch {
            return false
        }
    }, '必须是有效的 JSON 格式'),
    is_active: z.boolean().default(true),
})

interface TemplateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    template: Template | null
}

export default function TemplateDialog({ open, onOpenChange, template }: TemplateDialogProps) {
    const createMutation = useCreateTemplate()
    const updateMutation = useUpdateTemplate()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            cover_image: '',
            config: '{}',
            is_active: true,
        },
    })

    useEffect(() => {
        if (open) {
            if (template) {
                form.reset({
                    name: template.name,
                    cover_image: template.cover_image || '',
                    config: JSON.stringify(template.config, null, 2),
                    is_active: template.is_active,
                })
            } else {
                form.reset({
                    name: '',
                    cover_image: '',
                    config: '{\n  "width": 1024,\n  "height": 1024\n}',
                    is_active: true,
                })
            }
        }
    }, [open, template, form])

    const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (values) => {
        try {
            const data = {
                ...values,
                config: JSON.parse(values.config),
            }

            if (template) {
                await updateMutation.mutateAsync({ ...data, id: template.id })
                toast.success('更新成功')
            } else {
                await createMutation.mutateAsync(data)
                toast.success('创建成功')
            }
            onOpenChange(false)
        } catch (error) {
            toast.error(template ? '更新失败' : '创建失败')
        }
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{template ? '编辑模版' : '创建模版'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">模版名称</Label>
                        <Input id="name" {...form.register('name')} placeholder="请输入模版名称" />
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cover_image">封面图片 URL</Label>
                        <Input id="cover_image" {...form.register('cover_image')} placeholder="https://..." />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="config">配置 (JSON)</Label>
                        <Textarea
                            id="config"
                            {...form.register('config')}
                            placeholder="{ ... }"
                            className="font-mono h-[200px]"
                        />
                        {form.formState.errors.config && (
                            <p className="text-sm text-red-500">{form.formState.errors.config.message}</p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_active"
                            checked={form.watch('is_active')}
                            onCheckedChange={(checked) => form.setValue('is_active', checked)}
                        />
                        <Label htmlFor="is_active">启用状态</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            取消
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? '提交中...' : '提交'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
