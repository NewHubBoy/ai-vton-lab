'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, SparklesIcon, ArrowRightIcon, CheckCircleIcon, PhotoIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/20/solid'
import Header from '@/components/Header'

const features = [
  {
    name: '智能换装',
    description: '上传服装照片，AI自动生成模特上身效果，精准还原服装细节与版型。',
    icon: SparklesIcon,
  },
  {
    name: '多场景展示',
    description: '支持多种场景和模特选择，从街头到秀场，全方位展示服装魅力。',
    icon: PhotoIcon,
  },
  {
    name: '极速生成',
    description: '秒级响应，高效批量处理，大幅提升选款与营销效率。',
    icon: ClockIcon,
  },
  {
    name: '隐私安全',
    description: '企业级数据保护，确保您的设计素材安全无忧。',
    icon: ShieldCheckIcon,
  }
]

const steps = [
  {
    number: "01",
    title: "上传服装照片",
    description: "将要展示的服装正面、平整拍摄上传，系统自动识别服装轮廓和细节。",
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80",
  },
  {
    number: "02",
    title: "选择模特与场景",
    description: "从多样化的人台和场景库中选择，或上传参考图片定制专属展示。",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
  },
  {
    number: "03",
    title: "AI智能生成",
    description: "我们的AI引擎精准匹配服装与模特，生成自然真实的穿搭效果图。",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
  },
  {
    number: "04",
    title: "下载与分享",
    description: "一键下载高清效果图，支持多种尺寸导出，满足电商、社交媒体等不同渠道需求。",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80",
  },
]

const showcase = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    title: '春夏新品',
    category: 'Dresses',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
    title: '商务通勤',
    category: 'Suits',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
    title: '休闲运动',
    category: 'Casual',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
    title: '晚宴礼服',
    category: 'Evening',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    title: '时尚外套',
    category: 'Outerwear',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
    title: '精致配饰',
    category: 'Accessories',
  },
]

const testimonials = [
  {
    content: "AI Fashion彻底改变了我们的产品拍摄流程。以前需要一周时间完成的拍摄，现在只需几小时。成本降低了80%，效率大幅提升。",
    author: "张小姐",
    role: "电商运营总监",
    company: "某知名品牌",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    rating: 5,
  },
  {
    content: "生成效果非常自然，服装细节还原度很高。客户看到AI生成的展示图，转化率比实物拍摄还提升了15%。",
    author: "李经理",
    role: "产品经理",
    company: "快时尚品牌",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    rating: 5,
  },
  {
    content: "批量处理功能太强大了，一次性生成上百张不同模特、不同场景的产品图，极大地丰富了我们的素材库。",
    author: "王总监",
    role: "创意总监",
    company: "设计工作室",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    rating: 5,
  },
]

const pricing = [
  {
    name: "免费体验",
    price: "¥0",
    period: "/月",
    description: "适合个人用户和小型测试",
    features: [
      "每月50次AI生成",
      "基础模特选择",
      "标准生成速度",
      "720p 图片下载",
      "Email 支持",
    ],
    cta: "开始免费体验",
    popular: false,
  },
  {
    name: "专业版",
    price: "¥299",
    period: "/月",
    description: "适合中小型电商和创作者",
    features: [
      "每月2000次AI生成",
      "全部模特选择",
      "优先生成速度",
      "4K 图片下载",
      "批量处理功能",
      "API 接入",
      "专属客服",
    ],
    cta: "升级专业版",
    popular: true,
  },
  {
    name: "企业版",
    price: "¥999",
    period: "/月",
    description: "适合大型电商和企业用户",
    features: [
      "无限次AI生成",
      "定制模特训练",
      "最高优先级处理",
      "8K 原图下载",
      "高级 API 接入",
      "私有化部署",
      "专属技术支持",
      " SLA 服务保障",
    ],
    cta: "联系销售",
    popular: false,
  },
]

const stats = [
  { value: "10M+", label: "已生成图片" },
  { value: "50K+", label: "注册用户" },
  { value: "99.9%", label: "服务可用性" },
  { value: "85%", label: "成本节省" },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    )

    document.querySelectorAll('[id^="section-"]').forEach((section) => {
      if (observerRef.current) {
        observerRef.current.observe(section)
      }
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const fadeInUp = (id: string, delay: number = 0) => {
    const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      return { opacity: isVisible[id] ? 1 : 0 }
    }
    return {
      opacity: isVisible[id] ? 1 : 0,
      transform: isVisible[id] ? 'translateY(0)' : 'translateY(30px)',
      transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
    }
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen overscroll-behavior-y-contain">
      <Header />

      <main>
        {/* Hero Section */}
        <section id="section-hero" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100/50 via-transparent to-amber-50/50 dark:from-rose-950/30 dark:via-transparent dark:to-amber-950/30" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-rose-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

          <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div
              id="hero-content"
              style={fadeInUp('section-hero', 0)}
              className="mx-auto max-w-3xl text-center"
            >
              <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-5 py-2.5 shadow-lg border border-stone-200/50 dark:bg-stone-900/80 dark:border-stone-800/50">
                <SparklesIcon className="h-5 w-5 text-rose-500" />
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  AI驱动的时尚革命
                </span>
              </div>

              <h1 className="text-5xl font-bold tracking-tight text-stone-900 sm:text-7xl dark:text-stone-50">
                智能模特换装
                <span className="block mt-3 text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-coral-500 to-amber-500">
                  开启时尚新纪元
                </span>
              </h1>

              <p className="mt-8 text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
                上传服装照片，AI自动生成高质量模特上身效果图。
                无需实物拍摄，降低成本，提升效率，让您的服装展示更加专业。
              </p>

              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#"
                  className="group inline-flex items-center gap-2 rounded-full bg-stone-900 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-stone-800 transition-all duration-300 hover:shadow-xl hover:scale-105 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white w-full sm:w-auto justify-center"
                >
                  立即体验
                  <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#how-it-works"
                  className="text-base font-semibold text-stone-900 hover:text-rose-600 dark:text-stone-50 dark:hover:text-rose-400 transition-colors"
                >
                  了解更多 <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </a>
              </div>
            </div>

            {/* Hero Image */}
            <div
              id="hero-image"
              style={fadeInUp('section-hero', 0.3)}
              className="mt-20 relative"
            >
              <div className="relative mx-auto max-w-5xl">
                <div className="aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-stone-200/50 dark:ring-stone-800/50">
                  <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80"
                    alt="AI Fashion 智能模特换装展示"
                    width="1600"
                    height="900"
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
                <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-gradient-to-br from-rose-400 to-amber-400 rounded-3xl -z-10 opacity-20 blur-3xl" />
                <div className="absolute -top-12 -right-12 w-72 h-72 bg-gradient-to-br from-amber-400 to-rose-400 rounded-3xl -z-10 opacity-20 blur-3xl" />
              </div>
            </div>

            {/* Stats */}
            <div
              id="stats"
              style={fadeInUp('section-hero', 0.5)}
              className="mt-24 grid grid-cols-2 gap-8 sm:grid-cols-4"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="section-features" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div
              id="features-header"
              style={fadeInUp('section-features', 0)}
              className="mx-auto max-w-2xl text-center"
            >
              <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
                核心功能
              </h2>
              <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">
                专业的AI技术，为时尚行业量身定制
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:max-w-none lg:grid-cols-4">
              {features.map((feature, index) => (
                <div
                  key={feature.name}
                  id={`feature-${index}`}
                  style={fadeInUp('section-features', index * 0.1)}
                  className="group relative rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 dark:bg-stone-900 dark:ring-stone-800"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-stone-900 dark:text-stone-50">
                    {feature.name}
                  </h3>
                  <p className="mt-3 text-stone-600 dark:text-stone-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="section-how-it-works" className="py-24 sm:py-32 bg-white dark:bg-stone-900/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div
              id="how-header"
              style={fadeInUp('section-how-it-works', 0)}
              className="mx-auto max-w-2xl text-center mb-16"
            >
              <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
                轻松四步，快速上手
              </h2>
              <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">
                简洁高效的工作流程，让AI换装变得如此简单
              </p>
            </div>

            <div className="relative">
              {/* Connection line - hidden on mobile */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-rose-200 via-amber-200 to-rose-200 dark:from-rose-900/50 dark:via-amber-900/50 dark:to-rose-900/50 hidden lg:block -translate-y-1/2" />

              <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
                {steps.map((step, index) => (
                  <div
                    key={step.number}
                    id={`step-${index}`}
                    style={fadeInUp('section-how-it-works', index * 0.15)}
                    className="relative flex flex-col items-center text-center group"
                  >
                    <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-white text-xl font-bold shadow-lg ring-4 ring-white dark:ring-stone-900 group-hover:scale-110 transition-transform duration-300">
                      {step.number}
                    </div>
                    <div className="mt-8 w-full">
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg mb-6 group-hover:shadow-xl transition-shadow duration-300">
                        <img
                          src={step.image}
                          alt={step.title}
                          width="400"
                          height="300"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Showcase Section */}
        <section id="section-showcase" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div
              id="showcase-header"
              style={fadeInUp('section-showcase', 0)}
              className="mx-auto max-w-2xl text-center mb-16"
            >
              <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
                精选案例
              </h2>
              <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">
                探索AI换装的无限可能
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.map((item, index) => (
                <div
                  key={item.id}
                  id={`showcase-${index}`}
                  style={fadeInUp('section-showcase', index * 0.1)}
                  className="group relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-stone-200 dark:ring-stone-800 cursor-pointer"
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      width="600"
                      height="800"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-sm text-rose-300 font-medium">{item.category}</p>
                      <p className="text-xl font-semibold text-white mt-1">{item.title}</p>
                      <div className="mt-4 flex items-center gap-2 text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <span>查看详情</span>
                        <ArrowRightIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <a
                href="#"
                className="inline-flex items-center gap-2 text-base font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
              >
                查看更多案例 <ArrowRightIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="section-testimonials" className="py-24 sm:py-32 bg-white dark:bg-stone-900/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div
              id="testimonials-header"
              style={fadeInUp('section-testimonials', 0)}
              className="mx-auto max-w-2xl text-center mb-16"
            >
              <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
                用户评价
              </h2>
              <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">
                听听用户怎么说
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.author}
                  id={`testimonial-${index}`}
                  style={fadeInUp('section-testimonials', index * 0.15)}
                  className="relative rounded-2xl bg-stone-50 p-8 shadow-lg ring-1 ring-stone-200 dark:bg-stone-800 dark:ring-stone-700"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      width="48"
                      height="48"
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-rose-200 dark:ring-rose-800"
                    />
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-stone-50">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {testimonial.role} · {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="section-pricing" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div
              id="pricing-header"
              style={fadeInUp('section-pricing', 0)}
              className="mx-auto max-w-2xl text-center mb-16"
            >
              <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
                简单透明的定价
              </h2>
              <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">
                选择适合您的方案，开启AI换装之旅
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {pricing.map((plan, index) => (
                <div
                  key={plan.name}
                  id={`pricing-${index}`}
                  style={fadeInUp('section-pricing', index * 0.15)}
                  className={`relative rounded-2xl p-8 shadow-lg ring-1 transition-all duration-300 hover:shadow-2xl ${
                    plan.popular
                      ? 'bg-stone-900 ring-2 ring-rose-500 scale-105 dark:bg-stone-800 dark:ring-rose-500'
                      : 'bg-white ring-stone-200 dark:bg-stone-900 dark:ring-stone-800'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                        最受欢迎
                      </span>
                    </div>
                  )}
                  <h3 className={`text-xl font-semibold ${
                    plan.popular ? 'text-white' : 'text-stone-900 dark:text-stone-50'
                  }`}>
                    {plan.name}
                  </h3>
                  <p className={`mt-2 text-sm ${
                    plan.popular ? 'text-stone-400' : 'text-stone-500 dark:text-stone-400'
                  }`}>
                    {plan.description}
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className={`text-5xl font-bold tracking-tight ${
                      plan.popular ? 'text-white' : 'text-stone-900 dark:text-stone-50'
                    }`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${
                      plan.popular ? 'text-stone-400' : 'text-stone-500 dark:text-stone-400'
                    }`}>
                      {plan.period}
                    </span>
                  </div>
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircleIcon className={`h-5 w-5 flex-shrink-0 ${
                          plan.popular ? 'text-rose-400' : 'text-rose-500'
                        }`} />
                        <span className={`text-sm ${
                          plan.popular ? 'text-stone-300' : 'text-stone-600 dark:text-stone-300'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#"
                    className={`mt-8 block w-full rounded-full py-3.5 text-center text-sm font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-white text-stone-900 hover:bg-stone-100'
                        : 'bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="section-cta" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div
              id="cta"
              style={fadeInUp('section-cta', 0)}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-6 py-24 sm:px-12 sm:py-32 lg:px-16 dark:from-stone-100 dark:via-stone-200 dark:to-stone-100"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-amber-500/10" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

              <div className="relative mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl dark:text-stone-900">
                  开启您的AI时尚之旅
                </h2>
                <p className="mt-6 text-lg text-stone-300 dark:text-stone-700 leading-relaxed">
                  立即注册，免费体验AI智能换装功能。无需信用卡，立即开始创作。
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="#"
                    className="rounded-full bg-white px-8 py-4 text-base font-semibold text-stone-900 shadow-lg hover:bg-stone-50 transition-all duration-200 hover:shadow-xl hover:scale-105 w-full sm:w-auto justify-center"
                  >
                    免费开始
                  </a>
                  <a
                    href="#"
                    className="text-base font-semibold text-white hover:text-rose-200 dark:text-stone-900 dark:hover:text-stone-600 transition-colors"
                  >
                    预约演示 <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 dark:bg-stone-900 dark:border-stone-800">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-stone-900 dark:text-stone-50">AI Fashion</span>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400 max-w-xs">
                AI驱动的智能模特换装平台，为时尚行业提供创新的视觉解决方案。
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-4">产品</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50 transition-colors">功能特性</a></li>
                <li><a href="#" className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50 transition-colors">定价方案</a></li>
                <li><a href="#" className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50 transition-colors">案例展示</a></li>
                <li><a href="#" className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50 transition-colors">API文档</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-4">公司</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50 transition-colors">关于我们</a></li>
                <li><a href="#" className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50 transition-colors">联系我们</a></li>
                <li><a href="#" className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50 transition-colors">加入我们</a></li>
                <li><a href="#" className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50 transition-colors">新闻中心</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-4">支持</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50 transition-colors">帮助中心</a></li>
                <li><a href="#" className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50 transition-colors">服务条款</a></li>
                <li><a href="#" className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50 transition-colors">隐私政策</a></li>
                <li><a href="#" className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50 transition-colors">联系方式</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                © 2025 AI Fashion. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
                  <span className="sr-only">WeChat</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89l-.006-.033zm-2.634 2.588c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                  </svg>
                </a>
                <a href="#" className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
                  <span className="sr-only">Weibo</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10.098 20c-4.27 0-9.098-1.57-9.098-5.13 0-2.65 2.12-4.88 5.36-5.62.54-.12.42-.47-.12-.8-2.5-1.52-2.62-2.83-2.62-4.32 0-3.26 3.04-4.66 6.9-4.66 3.47 0 5.52 1.35 5.52 4.2 0 3.48-3.06 5.85-4.72 6.23-.46.1-.54.37-.12.72 1.77 1.5 2.89 3.25 2.89 5.26 0 3.35-2.91 6.06-8.03 6.06zm12.41-2.43c0 3.64-4.29 6.18-9.82 6.18s-9.82-2.54-9.82-6.18c0-3.64 4.29-6.18 9.82-6.18s9.82 2.54 9.82 6.18zm-6.39 0c0 1.7-1.63 3.02-3.43 3.02s-3.43-1.32-3.43-3.02c0-1.7 1.63-3.02 3.43-3.02s3.43 1.32 3.43 3.02z"/>
                  </svg>
                </a>
                <a href="#" className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
