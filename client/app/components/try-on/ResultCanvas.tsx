'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useTryOnStore } from '@/lib/store';
import { cn } from '@/lib/utils';

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
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-3"
        >
          <ImageIcon className="w-5 h-5 text-zinc-400" />
        </motion.div>
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          No result yet
        </h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs">
          Upload your model image and garment, then click "Generate" to see the result here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[300px] bg-zinc-50 dark:bg-zinc-900 rounded-xl overflow-hidden">
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
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 rounded-full border-3 border-zinc-200 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white"
              />
            </div>
            <p className="mt-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Processing...
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6"
          >
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
              Generation failed
            </h3>
            <p className="text-xs text-zinc-500 mt-1 text-center">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-3 px-4 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Try Again
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
            <div className="absolute inset-0 p-3">
              <img
                src={resultImage}
                alt="AI Try-On Result"
                className="w-full h-full object-contain rounded-lg"
                onLoad={() => setIsLoading(false)}
              />
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full"
            >
              <button
                onClick={handleDownload}
                className="p-1.5 text-white/90 hover:text-white transition-colors"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3.5 bg-white/20" />
              <button
                onClick={handleRetry}
                className="p-1.5 text-white/90 hover:text-white transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </motion.div>

            {/* Success indicator */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-green-500/90 backdrop-blur-md rounded-full"
            >
              <CheckCircle2 className="w-3 h-3 text-white" />
              <span className="text-[10px] font-medium text-white">Complete</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
