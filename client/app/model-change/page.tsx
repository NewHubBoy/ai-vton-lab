'use client';

import { motion } from 'framer-motion';
import { TopNav } from '../components/try-on/TopNav';
import { ModelUploader } from '../components/try-on/ModelUploader';
import { GarmentSelector } from '../components/try-on/GarmentSelector';
import { AdvancedSettings } from '../components/try-on/AdvancedSettings';
import { GenerateButton } from '../components/try-on/GenerateButton';
import { ResultCanvas } from '../components/try-on/ResultCanvas';
import { HistoryPanel } from '../components/try-on/HistoryPanel';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TryOnPage() {
  return (
    <div className="min-h-screen dark:bg-black flex flex-col">
      <TopNav />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        <ScrollArea className="h-[calc(100vh-57px)]">
          <motion.aside
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-[320px] flex-shrink-0 overflow-y-auto border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-4"
          >
            <ModelUploader />
            <GarmentSelector />
            <AdvancedSettings />
            <GenerateButton />
          </motion.aside>
        </ScrollArea>

        {/* Right Panel - Result & History */}
        <motion.main
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex-1 overflow-hidden p-4"
        >
          <div className="h-full flex flex-row gap-4">
            {/* Result Canvas */}
            <div className="flex-1 min-h-0">
              <ResultCanvas />
            </div>
            {/* History Panel */}
            <HistoryPanel />
          </div>
        </motion.main>
      </main>
    </div>
  );
}
