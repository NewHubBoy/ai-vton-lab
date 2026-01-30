"use client"

import * as React from "react"
import {
    Command,
    SquareTerminal,
    type LucideIcon,
} from "lucide-react"
import { usePathname } from "next/navigation"
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
import { useAuth, type MenuItem, type MenuType } from "./auth-provider"
import { getIconComponent } from "./icon-picker"

// NavSubItem definition for children
interface NavSubItem {
    title: string
    url: string
    icon?: LucideIcon
    menu_type?: MenuType | null
    sort?: number
    isActive?: boolean
}

// NavMain item 类型
interface NavMainItem {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    sort: number
    menu_type?: MenuType | null
    items?: NavSubItem[]
}

// 判断路径是否匹配（用于设置 isActive）
function isPathActive(currentPath: string, targetPath: string): boolean {
    // 规范化路径（去除尾部斜杠）
    const normalizedCurrent = currentPath.replace(/\/$/, '')
    const normalizedTarget = targetPath.replace(/\/$/, '')

    // 精确匹配
    if (normalizedCurrent === normalizedTarget) return true
    // 父路径匹配（如当前路径 /dashboard/users，父路径 /dashboard）
    if (normalizedCurrent.startsWith(normalizedTarget + '/')) return true
    return false
}

// 转换函数：将 menus 转换成 navMain 格式 都通过 sort 排序
function transformMenusToNavMain(menus: MenuItem[], currentPath: string): NavMainItem[] {
    if (!menus || menus.length === 0) return []

    const navItems = menus
        .filter(menu => !menu.is_hidden)
        .map((menu) => {
            // 获取 icon：优先使用数据库中存储的 icon 字段
            const IconComponent = menu.icon ? (getIconComponent(menu.icon) || SquareTerminal) : SquareTerminal

            // 父级 path（用于拼接子菜单 URL）
            const parentPath = menu.path || ''

            // 转换子菜单
            let items: NavSubItem[] | undefined
            if (menu.children && menu.children.length > 0) {
                items = menu.children
                    .filter((child: MenuItem) => !child.is_hidden && (child.menu_type as string) !== 'button')
                    .map((child: MenuItem) => {
                        // 拼接 URL：父级 path + 子菜单 path
                        const childUrl = parentPath.endsWith('/') ? parentPath + (child.path || '') : parentPath + "/" + (child.path || '')

                        // 子菜单 icon：优先使用数据库中存储的 icon 字段
                        const childIcon = child.icon ? getIconComponent(child.icon) || undefined : undefined

                        // 判断子菜单是否激活
                        const isChildActive = isPathActive(currentPath, childUrl)

                        return {
                            title: child.name,
                            url: childUrl || '#',
                            icon: childIcon,
                            menu_type: child.menu_type as MenuType | null,
                            sort: child.order || 0,
                            isActive: isChildActive,
                        }
                    })
                // 对子菜单排序
                items?.sort((a, b) => (a.sort || 0) - (b.sort || 0))
            }

            // 判断当前菜单是否激活（精确匹配或父路径匹配）
            const menuUrl = menu.path || '#'
            const isMenuActive = isPathActive(currentPath, menuUrl)

            // 如果父菜单不激活，但有子菜单激活，则父菜单也应该展开
            const parentShouldBeOpen = isMenuActive || (items && items.length > 0 && items.some(item => isPathActive(currentPath, item.url)))

            return {
                title: menu.name,
                url: menuUrl,
                icon: IconComponent,
                isActive: parentShouldBeOpen,
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
    const pathname = usePathname()
    const { menus, user } = useAuth();

    // 转换 menus 为 navMain 格式，传入当前路径用于计算 isActive
    const navMainItems = transformMenusToNavMain(menus, pathname)

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
