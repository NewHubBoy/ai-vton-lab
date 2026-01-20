'use client'

import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: '首页', href: '/' },
  { name: '功能', href: '#features' },
  { name: '案例', href: '#showcase' },
  { name: '关于', href: '#about' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white/80 backdrop-blur-md dark:bg-stone-950/80 sticky top-0 z-50 border-b border-stone-200/50 dark:border-stone-800/50">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <div className="flex items-center gap-x-8">
          <a href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <span className="sr-only">AI Fashion</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-stone-900 dark:text-stone-50">AI Fashion</span>
          </a>
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors dark:text-stone-400 dark:hover:text-stone-50"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-x-4">
          <div className="hidden lg:flex lg:items-center lg:gap-x-4">
            <a
              href="#"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors dark:text-stone-400 dark:hover:text-stone-50"
            >
              登录
            </a>
            <a
              href="#"
              className="rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 transition-colors dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
            >
              免费注册
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="打开主菜单"
              className="-m-2.5 inline-flex items-center justify-center rounded-lg p-2.5 text-stone-700 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 tap-highlight-transparent"
            >
              <span className="sr-only">打开主菜单</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
        </div>
      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-stone-950 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-stone-900/10 dark:sm:ring-stone-100/10">
          <div className="flex items-center justify-between">
            <a href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
              <span className="sr-only">AI Fashion</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-stone-900 dark:text-stone-50">AI Fashion</span>
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="关闭菜单"
              className="-m-2.5 rounded-lg p-2.5 text-stone-700 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 tap-highlight-transparent"
            >
              <span className="sr-only">关闭菜单</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-stone-500/10 dark:divide-stone-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-3 text-base font-semibold text-stone-900 hover:bg-stone-50 dark:text-stone-50 dark:hover:bg-stone-800"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="space-y-2 py-6">
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-3 text-base font-semibold text-stone-900 hover:bg-stone-50 dark:text-stone-50 dark:hover:bg-stone-800"
                >
                  登录
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg bg-stone-900 px-3 py-3 text-center text-base font-semibold text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
                >
                  免费注册
                </a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
