'use client';

import { motion } from 'framer-motion';
import { Clock, RefreshCw, Loader2 } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTaskHistory } from '@/hooks/useTaskHistory';
import { ImageTaskDetail } from '@/lib/api';

// 格式化时间
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function HistoryCard({ task }: { task: ImageTaskDetail }) {
  const [open, setOpen] = useState(false);
  const thumbnail = task.result?.images?.[0]?.url || 'https://via.placeholder.com/200x300?text=No+Image';
  const time = formatTime(task.created_at);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div
          className="group relative rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer w-32"
        >
          <AspectRatio ratio={6 / 9}>
            <img
              src={thumbnail}
              alt={`Task ${task.task_id}`}
              className="w-full h-full object-cover"
            />
            {/* 状态指示器 */}
            {task.status === 'queued' || task.status === 'running' ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            ) : task.status === 'failed' ? (
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/40">
                <span className="text-xs text-white font-medium">Failed</span>
              </div>
            ) : null}
          </AspectRatio>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent px-2 py-1.5">
            <span className="text-[10px] text-white font-medium">{time}</span>
          </div>
        </motion.div>
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay className="bg-black/85 backdrop-blur-md" />
        <DialogContent className="max-w-3xl h-[90vh] p-0 flex items-center justify-center bg-transparent border-none shadow-none">
          <VisuallyHidden>
            <DialogTitle>{task.prompt}</DialogTitle>
          </VisuallyHidden>
          <motion.div
            className="relative w-full h-full flex items-center justify-center"
          >
            <DialogClose />

            <img
              src={thumbnail}
              alt={`Task ${task.task_id}`}
              className="h-full object-contain rounded-xl"
            />

            {/* Prompt badge */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm max-w-md">
              <span className="text-sm text-white font-medium line-clamp-2">{task.prompt}</span>
            </div>
          </motion.div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export function HistoryPanel() {
  const { tasks, isLoading, error, refresh, hasMore, loadMore } = useTaskHistory({ limit: 20 });

  // 过滤只显示完成的任务
  const completedTasks = tasks.filter(t => t.status === 'succeeded' && t.result?.images?.[0]?.url);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">History</h3>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative h-[calc(100vh-201px)]">
        {/* Top fade gradient */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-linear-to-b from-white dark:from-zinc-900 to-transparent z-10 pointer-events-none" />

        <ScrollArea className="h-full [&>[data-slot=scroll-area-scrollbar]]:hidden">
          <div className="grid gap-4 py-2 px-1">
            {isLoading && completedTasks.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-xs text-red-500">{error}</p>
                <button
                  onClick={refresh}
                  className="mt-2 text-xs text-zinc-500 hover:text-zinc-700"
                >
                  Retry
                </button>
              </div>
            ) : completedTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-zinc-400">No history yet</p>
              </div>
            ) : (
              <>
                {completedTasks.map((task) => (
                  <HistoryCard key={task.task_id} task={task} />
                ))}
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="text-xs text-zinc-500 hover:text-zinc-700 py-2"
                  >
                    {isLoading ? 'Loading...' : 'Load more'}
                  </button>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Bottom fade gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-white dark:from-zinc-900 to-transparent z-10 pointer-events-none" />
      </div>
    </motion.div>
  );
}
