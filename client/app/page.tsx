import Link from 'next/link';
import { Scissors, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-zinc-900 dark:text-white">
            AI Try-On Studio
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
              Virtual Try-On Made Simple
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Upload a model photo and your desired outfit to see realistic
              AI-generated try-on results in seconds.
            </p>
          </div>

          <Link
            href="/model-change"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-2xl shadow-lg shadow-violet-500/25 hover:from-violet-600 hover:to-fuchsia-600 transition-all hover:scale-105"
          >
            <span>Start Trying On</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-500">
              Powered by Google GenAI Technology
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
