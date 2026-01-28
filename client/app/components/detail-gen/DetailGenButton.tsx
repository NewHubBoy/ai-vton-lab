'use client';

import { motion } from 'framer-motion';
import { Sparkles, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useGeneration } from '@/hooks/useGeneration';

export function DetailGenButton() {
  const { generate, isGenerating, wsConnected } = useGeneration();

  const handleGenerate = async () => {
    if (isGenerating) return;
    await generate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="pt-2"
    >
      <motion.button
        onClick={handleGenerate}
        disabled={isGenerating}
        whileHover={!isGenerating ? { scale: 1.02 } : {}}
        whileTap={!isGenerating ? { scale: 0.98 } : {}}
        className={`w-full relative overflow-hidden group rounded-2xl py-3.5 px-6 font-semibold text-sm transition-all ${
          !isGenerating
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40'
            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
        }`}
      >
        {/* 背景光效 */}
        {!isGenerating && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-30 transition-opacity"
            initial={false}
          />
        )}

        <div className="relative flex items-center justify-center gap-2">
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>生成中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>生成详情页</span>
            </>
          )}
        </div>
      </motion.button>

      {/* 状态提示 */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <div className="flex items-center gap-1">
          {wsConnected ? (
            <Wifi className="w-3 h-3 text-emerald-500" />
          ) : (
            <WifiOff className="w-3 h-3 text-zinc-400" />
          )}
          <span className="text-[10px] text-zinc-400">
            {wsConnected ? '实时连接' : '轮询模式'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
