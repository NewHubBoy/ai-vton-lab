'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Check, Zap, Layers, Image as ImageIcon, Shield, UserRound, FileImage, Shirt, Sparkle } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { Button } from '@/components/ui/button'

const features = [
    {
        name: 'AI 虚拟试穿',
        description: '上传服装和模特照片，AI 精准匹配，生成自然真实的穿搭效果图。',
        icon: Shirt,
    },
    {
        name: 'AI 模特生成',
        description: '选择性别、年龄、风格等参数，快速生成专业级 AI 模特照片。',
        icon: UserRound,
    },
    {
        name: '详情页生成',
        description: '上传商品图片，自动生成电商详情页，大幅提升运营效率。',
        icon: FileImage,
    },
    {
        name: '多样场景',
        description: '支持多种场景选择，从街拍到秀场，满足不同风格的服装展示需求。',
        icon: Layers,
    },
    {
        name: '极速生成',
        description: '秒级响应，支持批量处理，大幅提升电商选款和营销素材制作效率。',
        icon: Zap,
    },
    {
        name: '隐私安全',
        description: '企业级数据保护，您的设计素材和商业数据安全无忧。',
        icon: Shield,
    },
]

const steps = [
    {
        number: '01',
        title: '选择功能',
        description: '根据需求选择换装试穿、模特生成或详情页生成，一键切换。',
    },
    {
        number: '02',
        title: '上传素材',
        description: '上传服装、模特照片或商品图片，系统自动识别并优化处理。',
    },
    {
        number: '03',
        title: '配置参数',
        description: '选择分辨率、宽高比、贴合度等专业参数，打造专属效果。',
    },
    {
        number: '04',
        title: '下载使用',
        description: '一键下载高清效果图，支持多种尺寸导出，满足各类渠道需求。',
    },
]

const showcase = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
        title: '虚拟试穿 - 连衣裙',
        tag: '换装试穿',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
        title: 'AI 模特 - 商务风格',
        tag: '模特生成',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80',
        title: '详情页 - 女装套装',
        tag: '详情页生成',
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
        title: '虚拟试穿 - 时尚外套',
        tag: '换装试穿',
    },
]

const pricing = [
    {
        name: '免费版',
        price: '¥0',
        description: '适合个人用户和体验测试',
        features: ['50 次 AI 生成', '基础模特选择', '标准生成速度', '720p 下载', '社区支持'],
    },
    {
        name: '专业版',
        price: '¥299',
        popular: true,
        description: '适合中小型电商和创作者',
        features: ['2000 次 AI 生成', '全部模特选择', '优先处理速度', '4K 下载', '批量处理', 'API 接入', '专属客服'],
    },
    {
        name: '企业版',
        price: '¥999',
        description: '适合大型电商和企业用户',
        features: ['无限次生成', '定制模特训练', '最高优先级', '8K 原图', '高级 API', '私有化部署', '技术支持'],
    },
]

const stats = [
    { value: '10M+', label: '已生成图片' },
    { value: '50K+', label: '注册用户' },
    { value: '99.9%', label: '服务可用性' },
    { value: '85%', label: '成本节省' },
]

export default function LandingPage() {
    const [isVisible, setIsVisible] = useState<Record<string, boolean>>({})
    const observerRef = useRef<IntersectionObserver | null>(null)

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
                    }
                })
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        )

        document.querySelectorAll('[id^="section-"]').forEach((section) => {
            if (observerRef.current) observerRef.current.observe(section)
        })

        return () => {
            if (observerRef.current) observerRef.current.disconnect()
        }
    }, [])

    const fadeInUp = (id: string, delay: number = 0) => {
        const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reducedMotion) return { opacity: isVisible[id] ? 1 : 0 }
        return {
            opacity: isVisible[id] ? 1 : 0,
            transform: isVisible[id] ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 0.5s ease-out ${delay}s, transform 0.5s ease-out ${delay}s`,
        }
    }

    return (
        <div className="bg-white dark:bg-zinc-950 min-h-screen">
            <LandingHeader />

            <main>
                {/* Hero Section */}
                <section id="section-hero" className="relative overflow-hidden pt-20">
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-fuchsia-50/50 dark:from-violet-950/20 dark:via-transparent dark:fuchsia-950/20" />
                    <div className="absolute top-24 left-10 w-72 h-72 bg-violet-400/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-24 right-10 w-96 h-96 bg-fuchsia-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

                    <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                        <div style={fadeInUp('section-hero', 0)} className="mx-auto max-w-3xl text-center">
                            {/* Badge */}
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white dark:bg-zinc-900 px-4 py-2 shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-800">
                                <Sparkles className="w-4 h-4 text-violet-500" />
                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    AI 驱动的时尚图像生成
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl dark:text-white">
                                轻松实现
                                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
                                    AI 时尚图像生成
                                </span>
                            </h1>

                            {/* Description */}
                            <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                                虚拟试穿、模特生成、详情页制作，一站式 AI 图像生成平台。
                                降低拍摄成本，提升效率，让时尚展示更加专业。
                            </p>

                            {/* 功能入口 */}
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                                >
                                    <Shirt className="w-4 h-4" />
                                    <span className="text-sm font-medium">虚拟试穿</span>
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/50 transition-colors"
                                >
                                    <UserRound className="w-4 h-4" />
                                    <span className="text-sm font-medium">模特生成</span>
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                                >
                                    <FileImage className="w-4 h-4" />
                                    <span className="text-sm font-medium">详情页生成</span>
                                </Link>
                            </div>

                            {/* CTA */}
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button asChild size="lg" className="bg-zinc-900 shadow-lg shadow-violet-500/25 hover:bg-zinc-800 hover:shadow-violet-500/40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                                    <Link href="/login">
                                        立即体验
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                                <Link
                                    href="#features"
                                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                                >
                                    了解更多
                                </Link>
                            </div>
                        </div>

                        {/* Hero Cover Image */}
                        <div style={fadeInUp('section-hero', 0.3)} className="mt-16 relative">
                            <div className="relative mx-auto max-w-5xl">
                                <div className="aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-zinc-200 dark:ring-zinc-800">
                                    <img
                                        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80"
                                        alt="AI VTON 虚拟试穿展示"
                                        width="1600"
                                        height="900"
                                        className="w-full h-full object-cover"
                                        loading="eager"
                                    />
                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/30 via-transparent to-transparent" />
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={fadeInUp('section-hero', 0.5)} className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
                            {stats.map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
                                        {stat.value}
                                    </div>
                                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="section-features" className="py-24 sm:py-32 bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div style={fadeInUp('section-features', 0)} className="mx-auto max-w-2xl text-center mb-16">
                            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                                核心功能
                            </h2>
                            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                                专业 AI 技术，为时尚行业量身定制
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <div
                                    key={feature.name}
                                    style={fadeInUp('section-features', (index + 1) * 0.1)}
                                    className="group rounded-2xl bg-white p-6 shadow-lg ring-1 ring-zinc-200 transition-all hover:shadow-xl hover:-translate-y-1 dark:bg-zinc-900 dark:ring-zinc-800"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                                        {feature.name}
                                    </h3>
                                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="section-how" className="py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div style={fadeInUp('section-how', 0)} className="mx-auto max-w-2xl text-center mb-16">
                            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                                简单四步，快速上手
                            </h2>
                            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                                简洁高效的工作流程，让 AI 换装变得如此简单
                            </p>
                        </div>

                        <div className="relative">
                            {/* Connection line */}
                            <div className="absolute top-12 left-0 w-full h-px bg-gradient-to-r from-violet-200 via-fuchsia-200 to-violet-200 dark:from-violet-900 dark:via-fuchsia-900 dark:to-violet-900 hidden lg:block" />

                            <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
                                {steps.map((step, index) => (
                                    <div
                                        key={step.number}
                                        style={fadeInUp('section-how', index * 0.15)}
                                        className="relative flex flex-col items-center text-center"
                                    >
                                        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-bold text-sm shadow-lg ring-4 ring-white dark:ring-zinc-950">
                                            {step.number}
                                        </div>
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                                {step.title}
                                            </h3>
                                            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Showcase */}
                <section id="section-showcase" className="py-24 sm:py-32 bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div style={fadeInUp('section-showcase', 0)} className="mx-auto max-w-2xl text-center mb-16">
                            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                                精选案例
                            </h2>
                            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                                探索 AI 虚拟试穿的无限可能
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {showcase.map((item, index) => (
                                <div
                                    key={item.id}
                                    style={fadeInUp('section-showcase', index * 0.1)}
                                    className="group relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-800 cursor-pointer"
                                >
                                    <div className="aspect-[3/4]">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            width="400"
                                            height="533"
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    </div>
                                    {/* Tag */}
                                    <div className="absolute top-3 left-3">
                                        <span className="inline-flex items-center rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-sm">
                                            {item.tag}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity">
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <p className="text-lg font-semibold text-white">{item.title}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <section id="section-pricing" className="py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div style={fadeInUp('section-pricing', 0)} className="mx-auto max-w-2xl text-center mb-16">
                            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                                简单透明的定价
                            </h2>
                            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                                选择适合您的方案，开启 AI 换装之旅
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {pricing.map((plan, index) => (
                                <div
                                    key={plan.name}
                                    style={fadeInUp('section-pricing', index * 0.15)}
                                    className={`relative rounded-2xl p-8 shadow-lg ring-1 transition-all hover:shadow-xl ${plan.popular
                                            ? 'bg-zinc-900 ring-2 ring-violet-500 dark:bg-zinc-800 dark:ring-violet-500'
                                            : 'bg-white ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800'
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                                                最受欢迎
                                            </span>
                                        </div>
                                    )}
                                    <h3 className={`text-lg font-semibold ${plan.popular ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                                        {plan.name}
                                    </h3>
                                    <p className={`mt-2 text-sm ${plan.popular ? 'text-zinc-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                        {plan.description}
                                    </p>
                                    <div className="mt-6 flex items-baseline">
                                        <span className={`text-4xl font-bold tracking-tight ${plan.popular ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                                            {plan.price}
                                        </span>
                                    </div>
                                    <ul className="mt-8 space-y-3">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-3">
                                                <Check className={`h-5 w-5 ${plan.popular ? 'text-violet-400' : 'text-violet-500'}`} />
                                                <span className={`text-sm ${plan.popular ? 'text-zinc-300' : 'text-zinc-600 dark:text-zinc-300'}`}>
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        asChild
                                        className={`mt-8 w-full ${plan.popular
                                                ? 'bg-white text-zinc-900 hover:bg-zinc-100'
                                                : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100'
                                            }`}
                                    >
                                        <Link href="/login">开始使用</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section id="section-cta" className="py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div
                            style={fadeInUp('section-cta', 0)}
                            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 px-6 py-16 sm:px-12 sm:py-20 lg:px-16 dark:from-zinc-100 dark:to-zinc-200"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10" />
                            <div className="relative mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl dark:text-zinc-900">
                                    开启您的 AI 时尚之旅
                                </h2>
                                <p className="mt-4 text-zinc-300 dark:text-zinc-700">
                                    立即注册，免费体验三大 AI 图像生成功能。无需信用卡，立即开始创作。
                                </p>
                                {/* 功能特色 */}
                                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-400 dark:text-zinc-600">
                                    <span className="flex items-center gap-1.5">
                                        <Sparkle className="w-4 h-4" />
                                        虚拟试穿
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-600 dark:bg-zinc-400" />
                                    <span className="flex items-center gap-1.5">
                                        <Sparkle className="w-4 h-4" />
                                        模特生成
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-600 dark:bg-zinc-400" />
                                    <span className="flex items-center gap-1.5">
                                        <Sparkle className="w-4 h-4" />
                                        详情页制作
                                    </span>
                                </div>
                                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Button asChild size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100">
                                        <Link href="/login">
                                            免费开始
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </Button>
                                    <Link
                                        href="#features"
                                        className="text-sm font-semibold text-white hover:text-zinc-200 dark:text-zinc-900 dark:hover:text-zinc-600 transition-colors"
                                    >
                                        了解更多
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base font-semibold text-zinc-900 dark:text-white">AI VTON</span>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            &copy; 2025 AI VTON. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
