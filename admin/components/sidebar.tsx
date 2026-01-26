'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/components/auth-provider'
import {
  LayoutDashboard,
  Users,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ImageIcon,
} from 'lucide-react'

interface NavItem {
  title: string
  href?: string
  icon?: React.ReactNode
  children?: NavItem[]
}

const mainNavItems: NavItem[] = [
  {
    title: '仪表盘',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: '用户管理',
    href: '/system/users',
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: '生成记录',
    href: '/business/records',
    icon: <ImageIcon className="h-4 w-4" />,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 duration-300 fade-in-0">
            <span className="font-bold">AI-VTON Admin</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={collapsed ? 'mx-auto' : ''}
        >
          {collapsed ? (
            <ChevronDown className="h-4 w-4 rotate-90" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-2">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'text-muted-foreground',
                collapsed && 'justify-center px-2'
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className={cn('w-full justify-start', collapsed && 'justify-center px-2')}
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">退出登录</span>}
        </Button>
      </div>
    </aside>
  )
}
