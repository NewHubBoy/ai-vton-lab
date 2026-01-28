'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  RefreshCw,
  UserRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useTryOnStore } from '@/lib/store';

export function ModelGenCanvas() {
  const { resultImage, isGenerating, error, setResultImage } = useTryOnStore();
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = useCallback(() => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'ai-model-result.png';
    link.click();
  }, [resultImage]);

  const handleRetry = useCallback(() => {
    setResultImage(null);
  }, [setResultImage]);

  if (!resultImage && !isGenerating && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 mb-4"
        >
          <UserRound className="w-8 h-8 text-violet-600 dark:text-violet-400" />
        </motion.div>
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
          等待生成模特
        </h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-xs leading-relaxed">
          在左侧选择模特的性别、年龄、肤色等参数，然后点击「生成模特」按钮
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[400px] bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Loading State */}
        {isGenerating && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-full border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <UserRound className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </motion.div>
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              正在生成模特...
            </p>
            <p className="mt-1 text-xs text-zinc-400">AI 正在创作中，请稍候</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
          >
            <div className="p-4 rounded-2xl bg-red-100 dark:bg-red-900/30 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              生成失败
            </h3>
            <p className="text-sm text-zinc-500 mt-2 text-center max-w-xs">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-4 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              重新尝试
            </button>
          </motion.div>
        )}

        {/* Result */}
        {resultImage && !isGenerating && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-full"
          >
            <div className="absolute inset-0 p-4">
              <img
                src={resultImage}
                alt="AI 生成的模特"
                className="w-full h-full object-contain rounded-xl"
                onLoad={() => setIsLoading(false)}
              />
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-md rounded-full"
            >
              <button
                onClick={handleDownload}
                className="p-2 text-white/90 hover:text-white transition-colors"
                title="下载"
              >
                <Download className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-white/20" />
              <button
                onClick={handleRetry}
                className="p-2 text-white/90 hover:text-white transition-colors"
                title="重新生成"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Success indicator */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md rounded-full"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-medium text-white">生成完成</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
