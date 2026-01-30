import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'AI 虚拟试穿 - 专业级 AI 时尚图像生成平台 | AI VTON Lab',
    description: '一站式 AI 时尚图像生成平台。支持虚拟试穿、AI 模特生成、电商详情页制作。秒级生成专业级商业摄影效果，降低拍摄成本，提升运营效率。',
    keywords: ['虚拟试穿', 'AI 模特', 'AI 换装', '电商详情页生成', 'AI 时尚', '智能修图', 'AI 摄影', 'VTON'],
    authors: [{ name: 'AI VTON Lab' }],
    openGraph: {
        title: 'AI 虚拟试穿 - 轻松实现专业级时尚摄影',
        description: '无需昂贵拍摄，AI 一键生成模特试穿效果图。支持多模特、多场景、多风格，助力电商降本增效。',
        url: 'https://vton-lab.com', // Assuming a placeholder URL, user can update
        siteName: 'AI VTON Lab',
        locale: 'zh_CN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI 虚拟试穿 - 重塑时尚摄影工作流',
        description: 'AI 驱动的虚拟试穿与模特生成平台。立即体验高质量、低成本的时尚图像解决方案。',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
}

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
