'use client'

import { motion } from 'framer-motion'
import { Shirt, UserRound, FileImage, Zap, Shield, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

import { useTranslation } from '@/lib/store/languageStore'

export function FeaturesSection() {
    const { t } = useTranslation()

    // Icon mapping helper
    const getIcon = (index: number) => {
        const icons = [Shirt, UserRound, FileImage, Zap]
        return icons[index] || Sparkles
    }

    const getGradient = (index: number) => {
        const gradients = [
            'from-violet-500/20 to-purple-500/20',
            'from-fuchsia-500/20 to-pink-500/20',
            'from-blue-500/20 to-cyan-500/20',
            'from-amber-500/20 to-orange-500/20',
        ]
        return gradients[index]
    }

    const getClass = (index: number) => {
        if (index === 0 || index === 3) return 'md:col-span-2 lg:col-span-2'
        return 'md:col-span-1 lg:col-span-1'
    }

    return (
        <section id="features" className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl"
                    >
                        {t.features.title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-zinc-600 dark:text-zinc-400"
                    >
                        {t.features.subtitle}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {t.features.items.map((feature: any, index: number) => {
                        const Icon = getIcon(index)
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1",
                                    getClass(index)
                                )}
                            >
                                <div className={cn(
                                    "absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                                    getGradient(index)
                                )} />

                                <div className="relative z-10">
                                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white group-hover:scale-110 transition-transform duration-300">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-zinc-600 dark:text-zinc-400">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
