'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/store/languageStore'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'

export function LandingHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { t, language, setLanguage } = useTranslation()

    const navigation = [
        { name: t.header.nav.home, href: '/' },
        { name: t.header.nav.features, href: '#features' },
        { name: t.header.nav.showcase, href: '#showcase' },
        { name: t.header.nav.pricing, href: '#pricing' },
    ]

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'zh' : 'en')
    }

    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
            <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
                <div className="flex items-center gap-x-8">
                    <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                        <span className="sr-only">AI VTON</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-fuchsia-500">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">AI VTON</span>
                    </Link>
                    <div className="hidden lg:flex lg:gap-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-white"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-x-4">
                    {/* Language Switcher */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleLanguage}
                        className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    >
                        {language === 'en' ? '中文' : 'En'}
                    </Button>

                    <div className="hidden lg:flex lg:items-center lg:gap-x-4">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-white"
                        >
                            {t.header.login}
                        </Link>
                        <Button asChild className="bg-zinc-900 shadow-lg shadow-violet-500/25 hover:bg-zinc-800 hover:shadow-violet-500/40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                            <Link href="/login">{t.header.cta}</Link>
                        </Button>
                    </div>
                    <div className="flex lg:hidden">
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Open menu">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-sm">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-fuchsia-500">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <span>AI VTON</span>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="mt-6 flow-root">
                                    <div className="-my-6 divide-y divide-zinc-500/10 dark:divide-zinc-500/10">
                                        <div className="space-y-2 py-6">
                                            {navigation.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="-mx-3 block rounded-lg px-3 py-3 text-base font-semibold text-zinc-900 hover:bg-zinc-50 dark:text-white dark:hover:bg-zinc-800"
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="space-y-2 py-6">
                                            <Link
                                                href="/login"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="-mx-3 block rounded-lg px-3 py-3 text-base font-semibold text-zinc-900 hover:bg-zinc-50 dark:text-white dark:hover:bg-zinc-800"
                                            >
                                                {t.header.login}
                                            </Link>
                                            <Link
                                                href="/login"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="-mx-3 block rounded-lg bg-linear-to-r from-violet-500 to-fuchsia-500 px-3 py-3 text-center text-base font-semibold text-white shadow-lg shadow-violet-500/25"
                                            >
                                                {t.header.cta}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </nav>
        </header>
    )
}
