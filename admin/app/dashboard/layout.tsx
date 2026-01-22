'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/components/auth-provider'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// 路由映射
const routeMap: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/dashboard/users': '用户管理',
  '/dashboard/roles': '角色管理',
  '/dashboard/menus': '菜单管理',
  '/dashboard/depts': '部门管理',
  '/dashboard/apis': 'API管理',
  '/dashboard/auditlogs': '审计日志',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // 使用 useEffect 处理重定向，避免在渲染过程中更新状态
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // 如果未登录或正在加载，显示加载状态
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // 动态生成面包屑
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/')
    const label = routeMap[href] || segment
    const isLast = index === pathSegments.length - 1
    return { href, label, isLast }
  })

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>仪表盘</BreadcrumbPage>
                </BreadcrumbItem>
                {breadcrumbs.slice(1).map((item) => (
                  <BreadcrumbSeparator key={item.href} />
                ))}
                {breadcrumbs.slice(1).map((item) => (
                  <BreadcrumbItem key={item.href}>
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
