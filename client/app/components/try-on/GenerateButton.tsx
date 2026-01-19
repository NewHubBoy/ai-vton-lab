'use client';

import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { useTryOnStore } from '@/app/lib/store';

export function GenerateButton() {
  const { canGenerate, isGenerating, setIsGenerating, setError, setResultImage } =
    useTryOnStore();

  // Simulate API call
  const handleGenerate = async () => {
    if (!canGenerate()) return;

    setIsGenerating(true);
    setError(null);
    setResultImage(null);

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // For demo, set a placeholder result
    // In production, this would call the actual API
    setResultImage('https://picsum.photos/800/1200');
    setIsGenerating(false);
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
        className={`w-full relative overflow-hidden group rounded-xl py-2.5 px-4 font-medium text-sm transition-all ${
          canGenerate()
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

      {!canGenerate() && (
        <p className="text-[10px] text-center text-zinc-400 mt-1.5">
          {!useTryOnStore.getState().modelImage
            ? 'Please upload a model image'
            : !useTryOnStore.getState().garmentImages.top &&
              !useTryOnStore.getState().garmentImages.bottom &&
              !useTryOnStore.getState().garmentImages.full
            ? 'Please select a garment'
            : ''}
        </p>
      )}
    </motion.div>
  );
}
