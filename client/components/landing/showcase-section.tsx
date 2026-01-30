'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

import { useTranslation } from '@/lib/store/languageStore'

const showcaseImages = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
]

export function ShowcaseSection() {
    const { t } = useTranslation()

    return (
        <section id="showcase" className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
                    <div className="max-w-2xl">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl"
                        >
                            {t.showcase.title}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="mt-4 text-zinc-600 dark:text-zinc-400"
                        >
                            {t.showcase.subtitle}
                        </motion.p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {t.showcase.items.map((item: any, index: number) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative aspect-3/4 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800"
                        >
                            <img
                                src={showcaseImages[index]}
                                alt={item.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-0 left-0 p-6">
                                    <p className="text-xs font-semibold text-violet-300 mb-1">{item.category}</p>
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        {item.title}
                                        <ArrowUpRight className="h-4 w-4" />
                                    </h3>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
