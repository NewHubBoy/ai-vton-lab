'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  RefreshCw,
  Shirt,
  AlertCircle,
} from 'lucide-react';
import { useTryOnStore } from '@/lib/store';

export function ResultCanvas() {
  const { resultImage, isGenerating, error, setResultImage } = useTryOnStore();
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = useCallback(() => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'ai-tryon-result.png';
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
          className="p-4 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 mb-4"
        >
          <Shirt className="w-8 h-8 text-zinc-500 dark:text-zinc-400" />
        </motion.div>
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
          等待生成结果
        </h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-xs leading-relaxed">
          在左侧上传模特和服装图片，然后点击「开始换装」按钮
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
                className="w-16 h-16 rounded-full border-4 border-zinc-200 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Shirt className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
              </motion.div>
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              正在生成换装效果...
            </p>
            <p className="mt-1 text-xs text-zinc-400">AI 正在处理中，请稍候</p>
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
                alt="AI 换装结果"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
