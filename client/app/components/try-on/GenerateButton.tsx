'use client';

import { motion } from 'framer-motion';
import { Sparkles, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useTryOnStore } from '@/lib/store';
import { useGeneration } from '@/hooks/useGeneration';

export function GenerateButton() {
  const { canGenerate } = useTryOnStore();
  const { generate, isGenerating, wsConnected } = useGeneration();

  const handleGenerate = async () => {
    if (!canGenerate()) return;
    await generate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="pt-1"
    >
      <motion.button
        onClick={handleGenerate}
        disabled={!canGenerate()}
        whileHover={canGenerate() ? { scale: 1.02 } : {}}
        whileTap={canGenerate() ? { scale: 0.98 } : {}}
        className={`w-full relative overflow-hidden group rounded-xl py-2.5 px-4 font-medium text-sm transition-all ${canGenerate()
            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90'
            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
          }`}
      >
        <div className="relative flex items-center justify-center gap-2">
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate</span>
            </>
          )}
        </div>
      </motion.button>

      {/* 状态提示 */}
      <div className="flex items-center justify-center gap-1.5 mt-1.5">
        {/* WS 连接状态指示器 */}
        <div className="flex items-center gap-1">
          {wsConnected ? (
            <Wifi className="w-3 h-3 text-green-500" />
          ) : (
            <WifiOff className="w-3 h-3 text-zinc-400" />
          )}
          <span className="text-[9px] text-zinc-400">
            {wsConnected ? 'Live' : 'Polling'}
          </span>
        </div>

        {/* 操作提示 */}
        {!canGenerate() && (
          <p className="text-[10px] text-zinc-400">
            {!useTryOnStore.getState().modelImage
              ? '• Upload a model image'
              : !useTryOnStore.getState().garmentImages.top &&
                !useTryOnStore.getState().garmentImages.bottom &&
                !useTryOnStore.getState().garmentImages.full
                ? '• Select a garment'
                : ''}
          </p>
        )}
      </div>
    </motion.div>
  );
}
