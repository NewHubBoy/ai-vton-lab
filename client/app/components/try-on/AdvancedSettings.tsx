'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, ChevronDown } from 'lucide-react';
import { useTryOnStore } from '@/app/lib/store';
import { cn } from '@/app/lib/utils';

const resolutions = ['1K', '2K', '4K'] as const;
const aspectRatios = ['1:1', '4:5', '9:16', '16:9'] as const;
const fitOptions = [
  { value: 'loose', label: 'Loose' },
  { value: 'fit', label: 'Regular' },
  { value: 'tight', label: 'Slim' },
] as const;

export function AdvancedSettings() {
  const {
    advancedSettingsOpen,
    setAdvancedSettingsOpen,
    resolution,
    setResolution,
    aspectRatio,
    setAspectRatio,
    fit,
    setFit,
    preserveIdentity,
    setPreserveIdentity,
  } = useTryOnStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="space-y-2"
    >
      <button
        onClick={() => setAdvancedSettingsOpen(!advancedSettingsOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Advanced Settings
          </span>
        </div>
        <motion.div
          animate={{ rotate: advancedSettingsOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {advancedSettingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
              {/* Fit */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
                  Fit
                </label>
                <div className="flex gap-1.5">
                  {fitOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFit(opt.value as 'loose' | 'fit' | 'tight')}
                      className={cn(
                        'flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all',
                        fit === opt.value
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
                  Resolution
                </label>
                <div className="flex gap-1.5">
                  {resolutions.map((r) => (
                    <button
                      key={r}
                      onClick={() => setResolution(r)}
                      className={cn(
                        'flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all',
                        resolution === r
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {aspectRatios.map((r) => (
                    <button
                      key={r}
                      onClick={() => setAspectRatio(r)}
                      className={cn(
                        'py-1.5 px-2 text-xs font-medium rounded-md transition-all',
                        aspectRatio === r
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preserve Identity */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  Preserve Identity
                </span>
                <button
                  onClick={() => setPreserveIdentity(!preserveIdentity)}
                  className={cn(
                    'relative w-8 h-4.5 rounded-full transition-colors',
                    preserveIdentity ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-600'
                  )}
                >
                  <motion.div
                    animate={{ x: preserveIdentity ? 16 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white dark:bg-zinc-900 rounded-full shadow-sm"
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
