"use client"

import { useState } from "react"
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

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon: LucideIcon
        isActive?: boolean
        menu_type?: string
        items?: {
            title: string
            url: string
            icon?: LucideIcon
        }[]
    }[]
}) {

    const [openItems, setOpenItems] = useState<Set<string>>(new Set())

    const toggleItem = (title: string) => {
        setOpenItems(prev => {
            const next = new Set(prev)
            if (next.has(title)) {
                next.delete(title)
            } else {
                next.add(title)
            }
            return next
        })
    }

    // 判断是否为 catalog 类型（目录类型，点击展开子菜单，不跳转）
    const isCatalog = (item: typeof items[0]) => item.menu_type === 'catalog' || (!item.url || item.url === '#')

    // 判断是否应该显示展开箭头（catalog 类型或者有子菜单的非 catalog）
    const showToggle = (item: typeof items[0]) => {
        if (item.items && item.items.length > 0) {
            return true
        }
        return false
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel>平台菜单</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={item.isActive || (item.items && item.items.length > 0)}
                        open={isCatalog(item) ? openItems.has(item.title) : undefined}
                        onOpenChange={(open) => {
                            if (isCatalog(item)) {
                                if (open) {
                                    setOpenItems(prev => new Set(prev).add(item.title))
                                } else {
                                    setOpenItems(prev => {
                                        const next = new Set(prev)
                                        next.delete(item.title)
                                        return next
                                    })
                                }
                            }
                        }}
                    >
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={item.title}>
                                {isCatalog(item) ? (
                                    // catalog 类型：不跳转，点击展开/折叠
                                    <button
                                        className="w-full flex items-center gap-2"
                                        onClick={() => showToggle(item) && toggleItem(item.title)}
                                    >
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </button>
                                ) : (
                                    // 非 catalog 类型：正常跳转
                                    <Link href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                )}
                            </SidebarMenuButton>
                            {showToggle(item) && (
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                                        <ChevronRight />
                                        <span className="sr-only">Toggle</span>
                                    </SidebarMenuAction>
                                </CollapsibleTrigger>
                            )}
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {item.items?.map((subItem) => (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton asChild>
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
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
