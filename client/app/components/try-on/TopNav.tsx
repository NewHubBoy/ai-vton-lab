'use client';

import { motion } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';
import Link from 'next/link';

export function TopNav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between px-5 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800"
    >
      <Link href="/">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">AI VTON</h1>
        </div>
      </Link>

      <nav className="flex items-center gap-1">
        <button className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <User className="w-4 h-4" />
        </button>
      </nav>
    </motion.header>
  );
}
