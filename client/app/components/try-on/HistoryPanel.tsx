'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
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

// Mock history data
const historyItems = [
  { id: 1, thumbnail: 'https://picsum.photos/200/300?random=1', time: '2 min ago' },
  { id: 2, thumbnail: 'https://picsum.photos/200/300?random=2', time: '5 min ago' },
  { id: 3, thumbnail: 'https://picsum.photos/200/300?random=3', time: '10 min ago' },
  { id: 4, thumbnail: 'https://picsum.photos/200/300?random=4', time: '15 min ago' },
  { id: 5, thumbnail: 'https://picsum.photos/200/300?random=5', time: '20 min ago' },
  { id: 6, thumbnail: 'https://picsum.photos/200/300?random=6', time: '25 min ago' },
  { id: 7, thumbnail: 'https://picsum.photos/200/300?random=7', time: '30 min ago' },
  { id: 8, thumbnail: 'https://picsum.photos/200/300?random=8', time: '35 min ago' },
  { id: 9, thumbnail: 'https://picsum.photos/200/300?random=9', time: '40 min ago' },
  { id: 10, thumbnail: 'https://picsum.photos/200/300?random=10', time: '45 min ago' },
  { id: 11, thumbnail: 'https://picsum.photos/200/300?random=11', time: '50 min ago' },
  { id: 12, thumbnail: 'https://picsum.photos/200/300?random=12', time: '55 min ago' },
  { id: 13, thumbnail: 'https://picsum.photos/200/300?random=13', time: '60 min ago' },
  { id: 14, thumbnail: 'https://picsum.photos/200/300?random=14', time: '65 min ago' },
];

function HistoryCard({ item }: { item: typeof historyItems[0] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div
          className="group relative rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer w-32"
        >
          <AspectRatio ratio={6 / 9}>
            <img
              src={item.thumbnail}
              alt={`History ${item.id}`}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent px-2 py-1.5">
            <span className="text-[10px] text-white font-medium">{item.time}</span>
          </div>
        </motion.div>
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay className="bg-black/85 backdrop-blur-md" />
        <DialogContent className="max-w-3xl h-[90vh] p-0 flex items-center justify-center bg-transparent border-none shadow-none">
          <VisuallyHidden>
            <DialogTitle>{item.id}</DialogTitle>
          </VisuallyHidden>
          <motion.div
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Close button */}
            <DialogClose />

            {/* Image */}
            <img
              src={item.thumbnail}
              alt={`History ${item.id}`}
              className="h-full object-contain rounded-xl"
            />

            {/* Time badge */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm">
              <span className="text-sm text-white font-medium">{item.time}</span>
            </div>
          </motion.div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export function HistoryPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-zinc-400" />
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">History</h3>
      </div>

      <div className="relative h-[calc(100vh-121px)]">
        {/* Top fade gradient */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-linear-to-b from-white dark:from-zinc-900 to-transparent z-10 pointer-events-none" />

        <ScrollArea className="h-full [&>[data-slot=scroll-area-scrollbar]]:hidden">
          <div className="grid gap-4 py-2 px-1">
            {historyItems.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>
        </ScrollArea>

        {/* Bottom fade gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-white dark:from-zinc-900 to-transparent z-10 pointer-events-none" />
      </div>
    </motion.div>
  );
}
