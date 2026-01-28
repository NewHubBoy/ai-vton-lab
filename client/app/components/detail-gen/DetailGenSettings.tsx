'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DetailGenSettings() {
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setProductImage(url);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProductImage(url);
    }
  }, []);

  const handleRemove = useCallback(() => {
    setProductImage(null);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* 商品图片上传 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 tracking-wide">
          商品图片
        </label>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            'relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden',
            isDragging
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
              : productImage
              ? 'border-transparent'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
          )}
        >
          <AnimatePresence mode="wait">
            {productImage ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative aspect-square"
              >
                <img
                  src={productImage}
                  alt="商品预览"
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </motion.div>
            ) : (
              <motion.label
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10 cursor-pointer"
              >
                <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/30 mb-3">
                  <Upload className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  上传商品图片
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  拖拽或点击上传
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </motion.label>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 详情页风格选择 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 tracking-wide">
          详情页风格
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['简约现代', '时尚潮流', '复古经典', '清新自然'].map((style) => (
            <button
              key={style}
              className="py-2.5 px-3 text-sm font-medium rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* 布局选择 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 tracking-wide">
          布局模式
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'vertical', label: '竖版' },
            { id: 'horizontal', label: '横版' },
            { id: 'grid', label: '网格' },
          ].map((layout) => (
            <button
              key={layout.id}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
            >
              <ImageIcon className="w-5 h-5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {layout.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
