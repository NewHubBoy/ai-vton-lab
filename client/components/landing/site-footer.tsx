'use client'

import Link from 'next/link'
import { Sparkles, Twitter, Github, Linkedin, Instagram } from 'lucide-react'
import { useTranslation } from '@/lib/store/languageStore'

export function SiteFooter() {
    const { t } = useTranslation()

    return (
        <footer className="bg-white border-t border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
            <div className="container mx-auto px-4 py-12 lg:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-fuchsia-500">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold text-zinc-900 dark:text-white">AI VTON</span>
                        </Link>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
                            {t.footer.description}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">{t.footer.product}</h4>
                        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <li><Link href="#features" className="hover:text-violet-500">{t.footer.links.features}</Link></li>
                            <li><Link href="#pricing" className="hover:text-violet-500">{t.footer.links.pricing}</Link></li>
                            <li><Link href="#showcase" className="hover:text-violet-500">{t.footer.links.showcase}</Link></li>
                            <li><Link href="/login" className="hover:text-violet-500">{t.footer.links.login}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">{t.footer.legal}</h4>
                        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <li><Link href="#" className="hover:text-violet-500">{t.footer.links.privacy}</Link></li>
                            <li><Link href="#" className="hover:text-violet-500">{t.footer.links.terms}</Link></li>
                            <li><Link href="#" className="hover:text-violet-500">{t.footer.links.cookie}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                        &copy; {new Date().getFullYear()} AI VTON Lab. {t.footer.rights}
                    </p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link href="#" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"><Twitter className="w-5 h-5" /></Link>
                        <Link href="#" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"><Github className="w-5 h-5" /></Link>
                        <Link href="#" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"><Linkedin className="w-5 h-5" /></Link>
                        <Link href="#" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"><Instagram className="w-5 h-5" /></Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
