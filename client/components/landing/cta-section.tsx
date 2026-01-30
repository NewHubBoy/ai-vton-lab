'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/store/languageStore'

export function CtaSection() {
    const { t } = useTranslation()

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/10 rounded-full blur-[100px] -z-10" />

            <div className="container mx-auto px-4 lg:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl bg-zinc-900 dark:bg-white overflow-hidden px-6 py-20 sm:px-12 sm:py-24 text-center"
                >
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                    <div className="absolute top-0 right-0 p-20 bg-fuchsia-500/30 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 p-20 bg-violet-500/30 rounded-full blur-[100px]" />

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold tracking-tight text-white dark:text-zinc-900 sm:text-4xl mb-6">
                            {t.cta.title}
                        </h2>
                        <p className="text-lg text-zinc-300 dark:text-zinc-600 mb-10">
                            {t.cta.description}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button asChild size="lg" className="h-12 px-8 text-base bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800">
                                <Link href="/login">
                                    {t.cta.primary}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 backdrop-blur-sm">
                                <Link href="#contact">
                                    {t.cta.secondary}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
