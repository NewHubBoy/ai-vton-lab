'use client'

import { motion } from 'framer-motion'
import { Upload, Sliders, Download, Camera } from 'lucide-react'

import { useTranslation } from '@/lib/store/languageStore'

export function HowItWorksSection() {
    const { t } = useTranslation()

    // Icon Helper
    const getIcon = (index: number) => {
        const icons = [Sliders, Upload, Camera, Download]
        return icons[index]
    }

    return (
        <section id="how-it-works" className="py-24 overflow-hidden">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl"
                    >
                        {t.howItWorks.title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-zinc-600 dark:text-zinc-400"
                    >
                        {t.howItWorks.subtitle}
                    </motion.p>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    {/* Connecting Line (Desktop) */}
                    <div className="absolute top-12 left-0 w-full h-0.5 bg-linear-to-r from-violet-500/0 via-violet-500/20 to-violet-500/0 hidden lg:block" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {t.howItWorks.steps.map((step: any, index: number) => {
                            const Icon = getIcon(index)
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15 }}
                                    className="relative flex flex-col items-center text-center group"
                                >
                                    <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-800 mb-8 transition-transform group-hover:scale-110 duration-300">
                                        <Icon className="h-10 w-10 text-violet-600 dark:text-violet-400" />
                                        <div className="absolute -top-3 -right-3 h-8 w-8 flex items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm border-4 border-white dark:border-zinc-950">
                                            {String(index + 1).padStart(2, '0')}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                        {step.description}
                                    </p>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
