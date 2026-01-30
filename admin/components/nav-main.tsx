"use client"

import { useState, useEffect } from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { type MenuType } from "./auth-provider"

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon: LucideIcon
        isActive?: boolean
        menu_type?: MenuType | null
        items?: {
            title: string
            url: string
            icon?: LucideIcon
            isActive?: boolean
        }[]
    }[]
}) {
    // 跟踪当前展开的父级菜单（同一时间只展开一个）
    const [openMenu, setOpenMenu] = useState<string | null>(null)

    // 当 items 或 isActive 变化时，更新展开状态
    useEffect(() => {
        const activeItem = items.find(item => item.isActive)
        if (activeItem) {
            setOpenMenu(activeItem.title)
        }
    }, [items])

    // 处理菜单展开/收起
    const toggleMenu = (title: string) => {
        setOpenMenu(prev => prev === title ? null : title)
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel>平台菜单</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasChildren = item.items && item.items.length > 0
                    // 如果是目录类型或者有子菜单，则启用折叠功能
                    const isCollapsible = hasChildren || item.menu_type === 'catalog'
                    // 如果是纯目录（不允许跳转），则主按钮作为触发器
                    const isCatalog = item.menu_type === 'catalog'
                    const isOpen = openMenu === item.title

                    if (!isCollapsible) {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                                    <Link href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    }

                    return (
                        <Collapsible
                            key={item.title}
                            asChild
                            open={isOpen}
                            onOpenChange={() => toggleMenu(item.title)}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                {isCatalog ? (
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip={item.title} isActive={item.isActive}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                ) : (
                                    <>
                                        <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuAction className="transition-transform duration-200 data-[state=open]:rotate-90">
                                                <ChevronRight />
                                                <span className="sr-only">Toggle</span>
                                            </SidebarMenuAction>
                                        </CollapsibleTrigger>
                                    </>
                                )}
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items?.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                                                    <Link href={subItem.url}>
                                                        {subItem.icon && <subItem.icon className="h-4 w-4 mr-2" />}
                                                        <span>{subItem.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}
