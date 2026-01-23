"use client"

import * as React from "react"
import {
    BookOpen,
    Command,
    Settings2,
    SquareTerminal,
    LayoutDashboard,
    Users,
    UserCog,
    Menu as MenuIcon,
    Building2,
    Shield,
    FileText,
    type LucideIcon,
    Album,
    Siren,
    TableOfContents,
    CircleDollarSign,
} from "lucide-react"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "./auth-provider"

// Icon 映射表
const iconMap: Record<string, LucideIcon> = {
    'dashboard': LayoutDashboard,
    'user': Users,
    'users': Users,
    'role': UserCog,
    'roles': UserCog,
    'menu': MenuIcon,
    'menus': MenuIcon,
    'dept': Building2,
    'depts': Building2,
    'api': Shield,
    'apis': Shield,
    'auditlog': FileText,
    'auditlogs': FileText,
    'setting': Settings2,
    'settings': Settings2,
    'home': LayoutDashboard,
    'guide': BookOpen,
    'business': Building2,
    "models": Album,
    'prompts': Siren,
    'records': TableOfContents,
    'topup': CircleDollarSign
}

// NavSubItem definition for children
interface NavSubItem {
    title: string
    url: string
    icon?: LucideIcon
    menu_type?: string
    sort?: number
}

// NavMain item 类型
interface NavMainItem {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    sort: number
    menu_type?: string
    items?: NavSubItem[]
}

// 转换函数：将 menus 转换成 navMain 格式 都通过 sort 排序
function transformMenusToNavMain(menus: any[]): NavMainItem[] {
    if (!menus || menus.length === 0) return []

    const navItems = menus
        .filter(menu => !menu.is_hidden && menu.menu_type !== 'button')
        .map((menu) => {
            // 获取 icon：从 path 去掉 /，取最后一段作为 icon key
            // 例如 /system/users -> users
            const iconKey = menu.path ? menu.path.replace(/^\//, '').split('/').pop() || '' : ''
            const IconComponent = iconKey ? iconMap[iconKey] || SquareTerminal : SquareTerminal

            // 父级 path（用于拼接子菜单 URL）
            const parentPath = menu.path || ''

            // 转换子菜单
            let items: NavSubItem[] | undefined
            if (menu.children && menu.children.length > 0) {
                items = menu.children
                    .filter((child: any) => !child.is_hidden && child.menu_type !== 'button')
                    .map((child: any) => {
                        // 拼接 URL：父级 path + 子菜单 path
                        let childUrl = parentPath.endsWith('/') ? parentPath + (child.path || '') : parentPath + "/" + (child.path || '')

                        // 子菜单 icon
                        const childIconKey = child.path ? child.path.replace(/^\//, '').split('/').pop() || '' : ''
                        const childIcon = childIconKey ? iconMap[childIconKey] : undefined

                        return {
                            title: child.name,
                            url: childUrl || '#',
                            icon: childIcon,
                            menu_type: child.menu_type,
                            sort: child.order || 0,
                        }
                    })
                // 对子菜单排序
                items?.sort((a, b) => (a.sort || 0) - (b.sort || 0))
            }

            return {
                title: menu.name,
                url: menu.path || '#',
                icon: IconComponent,
                menu_type: menu.menu_type,
                sort: menu.order || 0,
                items,
            }
        })

    // 对主菜单排序
    navItems.sort((a, b) => (a.sort || 0) - (b.sort || 0))
    return navItems
}

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { menus, user } = useAuth();

    // 转换 menus 为 navMain 格式
    const navMainItems = transformMenusToNavMain(menus)

    // 使用用户信息或默认信息
    const userInfo = user ? {
        name: user.username,
        email: user.email,
        avatar: user.avatar || "/avatars/shadcn.jpg",
    } : data.user

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">AI-VTON Admin</span>
                                    <span className="truncate text-xs">管理系统</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMainItems.length > 0 ? navMainItems : []} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userInfo} />
            </SidebarFooter>
        </Sidebar>
    )
}
