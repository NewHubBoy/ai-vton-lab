'use client'

import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Sparkles } from 'lucide-react'

const navigation = [
  { name: '首页', href: '/' },
  { name: '功能', href: '#features' },
  { name: '案例', href: '#showcase' },
  { name: '定价', href: '#pricing' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <div className="flex items-center gap-x-8">
          <a href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <span className="sr-only">AI VTON</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">AI VTON</span>
          </a>
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-white"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-x-4">
          <div className="hidden lg:flex lg:items-center lg:gap-x-4">
            <a
              href="/try-on"
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-white"
            >
              登录
            </a>
            <a
              href="/try-on"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:bg-zinc-800 transition-all hover:shadow-violet-500/40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              免费试穿
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="打开主菜单"
              className="-m-2.5 inline-flex items-center justify-center rounded-lg p-2.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 tap-highlight-transparent"
            >
              <span className="sr-only">打开主菜单</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
        </div>
      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-zinc-950 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-zinc-900/10 dark:sm:ring-zinc-100/10">
          <div className="flex items-center justify-between">
            <a href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
              <span className="sr-only">AI VTON</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-semibold text-zinc-900 dark:text-white">AI VTON</span>
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="关闭菜单"
              className="-m-2.5 rounded-lg p-2.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 tap-highlight-transparent"
            >
              <span className="sr-only">关闭菜单</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-zinc-500/10 dark:divide-zinc-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-3 text-base font-semibold text-zinc-900 hover:bg-zinc-50 dark:text-white dark:hover:bg-zinc-800"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="space-y-2 py-6">
                <a
                  href="/try-on"
                  className="-mx-3 block rounded-lg px-3 py-3 text-base font-semibold text-zinc-900 hover:bg-zinc-50 dark:text-white dark:hover:bg-zinc-800"
                >
                  登录
                </a>
                <a
                  href="/try-on"
                  className="-mx-3 block rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-3 text-center text-base font-semibold text-white shadow-lg shadow-violet-500/25"
                >
                  免费试穿
                </a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
