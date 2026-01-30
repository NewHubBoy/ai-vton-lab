'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/store/languageStore'

export function HeroSection() {
    const { t } = useTranslation()

    return (
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-violet-500/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute top-40 right-20 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-6">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 mb-8"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">{t.hero.badge}</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6"
                    >
                        {t.hero.title_prefix} <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 via-fuchsia-600 to-indigo-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-indigo-400">
                            {t.hero.title_highlight}
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl"
                    >
                        {t.hero.description}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-4"
                    >
                        <Button asChild size="lg" className="h-12 px-8 text-base bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-xl shadow-violet-500/20">
                            <Link href="/login">
                                {t.hero.cta_primary}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 backdrop-blur-sm">
                            <Link href="#showcase">
                                <Wand2 className="w-4 h-4 ml-2" />
                                {t.hero.cta_secondary}
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                {/* Hero Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-20 relative mx-auto max-w-5xl"
                >
                    <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-zinc-900/5 aspect-video lg:aspect-[2.4/1]">
                        <div className="absolute inset-0 bg-linear-to-br from-zinc-900 to-black">
                            <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-zinc-400 dark:text-zinc-600 font-medium">Interactive Demo / Hero Video</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
