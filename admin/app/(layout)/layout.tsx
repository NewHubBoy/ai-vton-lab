'use client';

import { useEffect, useMemo, Fragment } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useAuth, type MenuItem } from '@/components/auth-provider';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// 从菜单数据构建路由映射
function buildRouteMap(menus: MenuItem[]): Record<string, string> {
  const routeMap: Record<string, string> = {};

  function traverse(items: MenuItem[], parentPath: string = '') {
    for (const item of items) {
      // 构建完整路径
      const fullPath = parentPath ? (parentPath.endsWith('/') ? parentPath + item.path : parentPath + '/' + item.path) : item.path;

      // 添加到映射
      if (fullPath) {
        routeMap[fullPath] = item.name;
      }

      // 递归处理子菜单
      if (item.children && item.children.length > 0) {
        traverse(item.children, fullPath);
      }
    }
  }

  traverse(menus);
  return routeMap;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, menus } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 从菜单数据动态构建路由映射
  const routeMap = useMemo(() => buildRouteMap(menus), [menus]);

  // 使用 useEffect 处理重定向，避免在渲染过程中更新状态
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // 如果未登录或正在加载，显示加载状态
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // 动态生成面包屑
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = routeMap[href] || segment;
    const isLast = index === pathSegments.length - 1;
    return { href, label, isLast };
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <Fragment key={item.href}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
