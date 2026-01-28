'use client';

import { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useTryOnStore, ImageFile } from '@/lib/store';
import { generateId, cn } from '@/lib/utils';

interface ModelUploaderProps {
  className?: string;
}

export function ModelUploader({ className }: ModelUploaderProps) {
  const { modelImage, setModelImage, clearModelImage } = useTryOnStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;

      const imageFile: ImageFile = {
        id: generateId(),
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      };
      setModelImage(imageFile);
    },
    [setModelImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('space-y-2', className)}
    >
      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 tracking-wide">
        模特图片
      </label>

      <AnimatePresence mode="wait">
        {modelImage ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800"
          >
            <img
              src={modelImage.preview}
              alt="模特预览"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white text-zinc-900 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors"
              >
                更换图片
              </button>
              <button
                onClick={clearModelImage}
                className="p-2 bg-white/90 rounded-xl hover:bg-white transition-colors"
              >
                <X className="w-4 h-4 text-zinc-700" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="aspect-[3/4] rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 bg-zinc-50 dark:bg-zinc-800/50"
          >
            <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <ImageIcon className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                上传模特图片
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                拖拽或点击上传
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
