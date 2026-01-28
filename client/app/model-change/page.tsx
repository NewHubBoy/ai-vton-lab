'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Easing } from 'framer-motion';
import { TopNav } from '../components/try-on/TopNav';
import { TabSwitcher, TabType } from '../components/try-on/TabSwitcher';
import { ModelUploader } from '../components/try-on/ModelUploader';
import { GarmentSelector } from '../components/try-on/GarmentSelector';
import { AdvancedSettings } from '../components/try-on/AdvancedSettings';
import { GenerateButton } from '../components/try-on/GenerateButton';
import { ResultCanvas } from '../components/try-on/ResultCanvas';
import { HistoryPanel } from '../components/try-on/HistoryPanel';
import { ModelGenSettings } from '../components/model-gen/ModelGenSettings';
import { ModelGenButton } from '../components/model-gen/ModelGenButton';
import { ModelGenCanvas } from '../components/model-gen/ModelGenCanvas';
import { DetailGenSettings } from '../components/detail-gen/DetailGenSettings';
import { DetailGenButton } from '../components/detail-gen/DetailGenButton';
import { DetailGenCanvas } from '../components/detail-gen/DetailGenCanvas';
import { ScrollArea } from '@/components/ui/scroll-area';

// 页面过渡动画配置
const easeInOut: Easing = [0.4, 0, 0.2, 1];
const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: easeInOut },
};

export default function ModelChangePage() {
  const [activeTab, setActiveTab] = useState<TabType>('try-on');

  return (
    <div className="h-screen bg-linear-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col overflow-hidden">
      <TopNav />

      {/* Tab 切换栏 */}
      <div className="shrink-0 px-6 py-4 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto">
          <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      <main className="flex-1 flex min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === 'try-on' && (
            <motion.div
              key="try-on"
              {...pageTransition}
              className="flex-1 flex min-h-0"
            >
              {/* 换装试穿 - 左侧控制面板 */}
              <ScrollArea className="h-full w-85 shrink-0 border-r border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                <motion.aside
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="p-5 space-y-5"
                >
                  <ModelUploader />
                  <GarmentSelector />
                  <AdvancedSettings />
                  <GenerateButton />
                </motion.aside>
              </ScrollArea>

              {/* 换装试穿 - 右侧结果面板 */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex-1 min-h-0 p-5 overflow-auto"
              >
                <div className="h-full flex flex-row gap-5">
                  <div className="flex-1 min-h-0">
                    <ResultCanvas />
                  </div>
                  <HistoryPanel />
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'model-gen' && (
            <motion.div
              key="model-gen"
              {...pageTransition}
              className="flex-1 flex min-h-0"
            >
              {/* 模特生成 - 左侧配置面板 */}
              <ScrollArea className="h-full w-85 shrink-0 border-r border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                <motion.aside
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="p-5"
                >
                  {/* 模特生成标题 */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                      模特生成
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">
                      选择参数生成 AI 模特照片
                    </p>
                  </div>

                  {/* 配置选项 */}
                  <ModelGenSettings />

                  {/* 生成按钮 */}
                  <div className="mt-6">
                    <ModelGenButton />
                  </div>
                </motion.aside>
              </ScrollArea>

              {/* 模特生成 - 右侧结果面板 */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex-1 min-h-0 p-5 overflow-auto"
              >
                <div className="h-full flex flex-row gap-5">
                  <div className="flex-1 min-h-0">
                    <ModelGenCanvas />
                  </div>
                  <HistoryPanel />
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'detail-gen' && (
            <motion.div
              key="detail-gen"
              {...pageTransition}
              className="flex-1 flex min-h-0"
            >
              {/* 详情页生成 - 左侧配置面板 */}
              <ScrollArea className="h-full w-85 shrink-0 border-r border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                <motion.aside
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="p-5"
                >
                  {/* 详情页生成标题 */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                      详情页生成
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">
                      上传商品图片生成详情页
                    </p>
                  </div>

                  {/* 配置选项 */}
                  <DetailGenSettings />

                  {/* 生成按钮 */}
                  <div className="mt-6">
                    <DetailGenButton />
                  </div>
                </motion.aside>
              </ScrollArea>

              {/* 详情页生成 - 右侧结果面板 */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex-1 min-h-0 p-5 overflow-auto"
              >
                <div className="h-full flex flex-row gap-5">
                  <div className="flex-1 min-h-0">
                    <DetailGenCanvas />
                  </div>
                  <HistoryPanel />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
