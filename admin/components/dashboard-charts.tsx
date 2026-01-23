"use client"

import { TrendingUp, Activity } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

const visitorData = [
  { date: "周一", visitors: 1200 },
  { date: "周二", visitors: 1800 },
  { date: "周三", visitors: 1500 },
  { date: "周四", visitors: 2100 },
  { date: "周五", visitors: 2400 },
  { date: "周六", visitors: 3200 },
  { date: "周日", visitors: 2800 },
]

const requestData = [
  { time: "00:00", requests: 120 },
  { time: "04:00", requests: 80 },
  { time: "08:00", requests: 450 },
  { time: "12:00", requests: 890 },
  { time: "16:00", requests: 1200 },
  { time: "20:00", requests: 750 },
  { time: "23:59", requests: 380 },
]

const chartConfig = {
  visitors: {
    label: "访客数",
    color: "var(--chart-1)",
  },
  requests: {
    label: "请求数",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function VisitorChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>访客统计</CardTitle>
        <CardDescription>本周每日访客数量</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={visitorData}
            margin={{ left: 12, right: 12, top: 10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="visitors"
              type="monotone"
              fill="var(--color-visitors)"
              fillOpacity={0.3}
              stroke="var(--color-visitors)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            <TrendingUp className="h-4 w-4 text-green-500" />
            增长 15.3% <span className="text-muted-foreground font-normal">本周</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export function RequestChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>请求趋势</CardTitle>
        <CardDescription>今日各时段请求数量</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={requestData}
            margin={{ left: 12, right: 12, top: 10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="requests"
              type="monotone"
              fill="var(--color-requests)"
              fillOpacity={0.3}
              stroke="var(--color-requests)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            <Activity className="h-4 w-4 text-blue-500" />
            峰值 1200 <span className="text-muted-foreground font-normal">16:00</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
