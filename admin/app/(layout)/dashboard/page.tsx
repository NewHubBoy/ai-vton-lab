'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCog, Menu as MenuIcon, Building2, Shield, Activity } from 'lucide-react'
import { VisitorChart, RequestChart } from '@/components/dashboard-charts'

export default function DashboardPage() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString('zh-CN'))
  }, [])

  const stats = [
    {
      title: '用户总数',
      value: '1,234',
      icon: Users,
      description: '较上周增长 12%',
    },
    {
      title: '角色数量',
      value: '8',
      icon: UserCog,
      description: '系统预设角色',
    },
    {
      title: '菜单数量',
      value: '45',
      icon: MenuIcon,
      description: '系统菜单',
    },
    {
      title: '部门数量',
      value: '12',
      icon: Building2,
      description: '组织架构',
    },
    {
      title: 'API接口',
      value: '128',
      icon: Shield,
      description: '后端接口',
    },
    {
      title: '今日请求',
      value: '5,678',
      icon: Activity,
      description: '访问量统计',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">仪表盘</h1>
          <p className="text-muted-foreground">
            欢迎回来，{user?.username || '管理员'}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid gap-4 md:grid-cols-2">
        <VisitorChart />
        <RequestChart />
      </div>

      {/* Recent activity and quick actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>系统概览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">系统状态</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  运行正常
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">后端服务</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  在线
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">数据库连接</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  已连接
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">最后更新时间</span>
                <span className="text-sm">{currentTime || '加载中...'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>快捷操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <a
                href="/system/users"
                className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <Users className="h-4 w-4" />
                <span className="text-sm">用户管理</span>
              </a>
              <a
                href="/system/roles"
                className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <UserCog className="h-4 w-4" />
                <span className="text-sm">角色管理</span>
              </a>
              <a
                href="/system/menus"
                className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <MenuIcon className="h-4 w-4" />
                <span className="text-sm">菜单管理</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
