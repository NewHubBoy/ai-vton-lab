
import { Shirt, UserRound, FileImage, Zap, Sliders, Upload, Camera, Download } from 'lucide-react'

export type Language = 'en' | 'zh'

export const dictionaries = {
    en: {
        header: {
            nav: {
                home: 'Home',
                features: 'Features',
                showcase: 'Showcase',
                pricing: 'Pricing',
            },
            login: 'Login',
            cta: 'Try for Free',
        },
        hero: {
            badge: 'New Generation AI VTON Technology',
            title_prefix: 'Redefine Fashion with',
            title_highlight: 'AI Virtual Try-On',
            description: 'Experience the future of e-commerce. Generate photorealistic model images and virtual try-ons in seconds, reducing costs and boosting conversion.',
            cta_primary: 'Get Started Free',
            cta_secondary: 'View Showcase',
        },
        features: {
            title: 'Powerful Features for Modern Fashion',
            subtitle: 'Everything you need to automate your fashion photography workflow.',
            items: [
                {
                    title: 'AI Virtual Try-On',
                    description: 'Realistic clothing transfer onto any model. Preserve garment details and texture seamlessly.',
                },
                {
                    title: 'AI Model Generation',
                    description: 'Generate professional fashion models with custom attributes like age, ethnicity, and style.',
                },
                {
                    title: 'E-commerce Ready',
                    description: 'Auto-generate product detail pages and marketing assets in high resolution.',
                },
                {
                    title: 'Lightning Fast',
                    description: 'Generate results in seconds suitable for high-volume production workflows.',
                },
            ]
        },
        howItWorks: {
            title: 'How It Works',
            subtitle: 'From upload to final result in four simple steps.',
            steps: [
                {
                    title: 'Select Mode',
                    description: 'Choose between Virtual Try-On, Model Generation, or Product Details.',
                },
                {
                    title: 'Upload Assets',
                    description: 'Upload your garment images and model photos. Our system supports all standard formats.',
                },
                {
                    title: 'AI Processing',
                    description: 'Our advanced AI analyzes the clothing structure and maps it perfectly to the model.',
                },
                {
                    title: 'Download Result',
                    description: 'Get high-resolution, photorealistic images ready for your store.',
                },
            ]
        },
        showcase: {
            title: 'Made with AI VTON',
            subtitle: 'See what our customers are creating with our AI tools.',
            items: [
                { title: 'Virtual Try-On', category: 'Dress' },
                { title: 'AI Model', category: 'Business' },
                { title: 'Product Detail', category: 'E-commerce' },
                { title: 'Virtual Try-On', category: 'Casual' },
            ]
        },
        pricing: {
            title: 'Simple, Transparent Pricing',
            subtitle: 'Start for free, upgrade as you grow.',
            perMonth: '/month',
            cta_prefix: 'Choose',
            mostPopular: 'Most Popular',
            plans: [
                {
                    name: 'Free',
                    description: 'Perfect for testing and personal use.',
                    features: ['50 AI Generations / mo', 'Standard Speed', '720p Download Resolution', 'Community Support'],
                },
                {
                    name: 'Pro',
                    description: 'For creators and emerging brands.',
                    features: ['2000 AI Generations / mo', 'Fast Generation Speed', '4K Download Resolution', 'Commercial License', 'Priority Support'],
                },
                {
                    name: 'Enterprise',
                    description: 'For large retailers and platforms.',
                    features: ['Unlimited Generations', 'Dedicated GPU Clusters', 'API Access', 'Custom Model Training', 'SLA Support'],
                }
            ]
        },
        cta: {
            title: 'Ready to Transform Your Fashion Business?',
            description: 'Join thousands of creators and brands using AI to generate professional fashion imagery in seconds.',
            primary: 'Start Creating for Free',
            secondary: 'Contact Sales',
        },
        footer: {
            description: 'Revolutionizing fashion e-commerce with AI-powered virtual try-on and model generation technology.',
            product: 'Product',
            legal: 'Legal',
            links: {
                features: 'Features',
                pricing: 'Pricing',
                showcase: 'Showcase',
                login: 'Login',
                privacy: 'Privacy Policy',
                terms: 'Terms of Service',
                cookie: 'Cookie Policy',
            },
            rights: 'All rights reserved.'
        }
    },
    zh: {
        header: {
            nav: {
                home: '首页',
                features: '功能',
                showcase: '案例',
                pricing: '定价',
            },
            login: '登录',
            cta: '免费试用',
        },
        hero: {
            badge: '新一代 AI 虚拟试穿技术',
            title_prefix: '用 AI 重塑时尚',
            title_highlight: '虚拟试穿体验',
            description: '体验电商的未来。秒级生成逼真的模特图和虚拟试穿效果，降低拍摄成本，提升转化率。',
            cta_primary: '免费开始',
            cta_secondary: '查看案例',
        },
        features: {
            title: '专为现代时尚打造的强大功能',
            subtitle: '自动化时尚摄影工作流所需的一切。',
            items: [
                {
                    title: 'AI 虚拟试穿',
                    description: '将服装逼真地迁移到任何模特身上。完美保留服装细节和纹理。',
                },
                {
                    title: 'AI 模特生成',
                    description: '生成具有自定义属性（如年龄、种族和风格）的专业时尚模特。',
                },
                {
                    title: '电商详情页',
                    description: '自动生成高分辨率的商品详情页和营销素材。',
                },
                {
                    title: '极速生成',
                    description: '秒级生成结果，适用于高并发的生产工作流。',
                },
            ]
        },
        howItWorks: {
            title: '如何使用',
            subtitle: '只需简单四步，从上传到获取最终结果。',
            steps: [
                {
                    title: '选择模式',
                    description: '选择虚拟试穿、模特生成或商品详情页模式。',
                },
                {
                    title: '上传素材',
                    description: '上传您的服装图片和模特照片。系统支持所有标准格式。',
                },
                {
                    title: 'AI 处理',
                    description: '我们先进的 AI 会分析服装结构并将其完美映射到模特身上。',
                },
                {
                    title: '下载结果',
                    description: '获取可直接用于店铺的高清逼真图片。',
                },
            ]
        },
        showcase: {
            title: '由 AI VTON 创造',
            subtitle: '看看我们的客户使用 AI 工具创造了什么。',
            items: [
                { title: '虚拟试穿', category: '连衣裙' },
                { title: 'AI 模特', category: '商务风' },
                { title: '商品详情', category: '电商' },
                { title: '虚拟试穿', category: '休闲' },
            ]
        },
        pricing: {
            title: '简单透明的定价',
            subtitle: '免费开始，随业务增长升级。',
            perMonth: '/月',
            cta_prefix: '选择',
            mostPopular: '最受欢迎',
            plans: [
                {
                    name: '免费版',
                    description: '适合测试和个人使用。',
                    features: ['每月 50 次 AI 生成', '标准速度', '720p 下载分辨率', '社区支持'],
                },
                {
                    name: '专业版',
                    description: '适合创作者和新兴品牌。',
                    features: ['每月 2000 次 AI 生成', '极速生成', '4K 下载分辨率', '商用授权', '优先支持'],
                },
                {
                    name: '企业版',
                    description: '适合大型零售商和平台。',
                    features: ['无限次生成', '专用 GPU 集群', 'API 接入', '定制模型训练', 'SLA 支持'],
                }
            ]
        },
        cta: {
            title: '准备好改变您的时尚业务了吗？',
            description: '加入成千上万的创作者和品牌，使用 AI 秒级生成专业时尚图像。',
            primary: '免费开始创作',
            secondary: '联系销售',
        },
        footer: {
            description: '利用 AI 驱动的虚拟试穿和模特生成技术，彻底改变时尚电商。',
            product: '产品',
            legal: '法律',
            links: {
                features: '功能',
                pricing: '定价',
                showcase: '案例',
                login: '登录',
                privacy: '隐私政策',
                terms: '服务条款',
                cookie: 'Cookie 策略',
            },
            rights: '保留所有权利。'
        }
    }
}
