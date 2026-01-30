'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useTranslation } from '@/lib/store/languageStore'

export function PricingSection() {
    const { t } = useTranslation()

    return (
        <section id="pricing" className="py-24">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl"
                    >
                        {t.pricing.title}
                    </motion.h2>
                    <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                        {t.pricing.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {t.pricing.plans.map((plan: any, index: number) => {
                        // We need to map the 'popular' logic.
                        // Logic: Pro plan (index 1) is popular.
                        const isPopular = index === 1
                        const price = index === 2 ? (plan.name === 'Enterprise' ? 'Custom' : plan.name === '企业版' ? '定制' : '$999') : (index === 1 ? (plan.name === 'Pro' || plan.name === '专业版' ? '$29' : '¥199') : '$0')
                        // Note: Ideally price should also be in dictionary, but for now I kept numbers here or I can hardcode logic 
                        // Actually I forgot to add prices to dictionary.
                        // Let's use hardcoded prices for now and assume translation for labels.
                        // Wait, I should have put prices in dictionary. Let's fix this in dictionary later or just use hardcoded prices based on lang if needed.
                        // Current implementation of dictionary doesn't have prices. I'll stick to a simple mapping or just use strings if possible.
                        // Let's use the index to determine price display.

                        let displayPrice = '$0'
                        if (index === 1) displayPrice = '$29'
                        if (index === 2) displayPrice = 'Custom'

                        return (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "relative flex flex-col p-8 rounded-3xl border transition-all duration-300",
                                    isPopular
                                        ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-2xl scale-105 border-transparent z-10"
                                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-xl hover:-translate-y-1"
                                )}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-violet-500 to-fuchsia-500 rounded-full text-white text-sm font-bold shadow-lg">
                                        {t.pricing.mostPopular}
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">{displayPrice}</span>
                                        <span className={cn("text-sm", isPopular ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400")}>{t.pricing.perMonth}</span>
                                    </div>
                                    <p className={cn("mt-4 text-sm", isPopular ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-600 dark:text-zinc-400")}>
                                        {plan.description}
                                    </p>
                                </div>

                                <ul className="flex-1 space-y-4 mb-8">
                                    {plan.features.map((feature: any) => (
                                        <li key={feature} className="flex items-center gap-3 text-sm">
                                            <Check className={cn("h-5 w-5 shrink-0", isPopular ? "text-violet-400 dark:text-violet-600" : "text-violet-500")} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={cn(
                                        "w-full h-12 font-medium",
                                        isPopular
                                            ? "bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                                            : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                                    )}
                                >
                                    {t.pricing.cta_prefix} {plan.name}
                                </Button>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
