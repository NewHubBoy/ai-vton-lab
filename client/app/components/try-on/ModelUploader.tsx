'use client';

import { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useTryOnStore, ImageFile } from '@/app/lib/store';
import { generateId, cn } from '@/app/lib/utils';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-2', className)}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Model
        </h3>
      </div>

      <AnimatePresence mode="wait">
        {modelImage ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group aspect-6/9 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800"
          >
            <img
              src={modelImage.preview}
              alt="Model preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-zinc-900 rounded-lg text-xs font-medium hover:bg-zinc-100 transition-colors"
              >
                Replace
              </button>
              <button
                onClick={clearModelImage}
                className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors"
              >
                <X className="w-3.5 h-3.5 text-zinc-700" />
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
            className="aspect-6/9 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-violet-400 dark:hover:border-violet-500 cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-800/50"
          >
            <ImageIcon className="w-5 h-5 text-zinc-400" />
            <p className="text-xs text-zinc-500">
              Drag & drop or click to browse
            </p>
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
