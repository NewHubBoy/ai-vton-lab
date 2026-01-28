'use client';

import { motion } from 'framer-motion';
import { Shirt, UserRound, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'try-on' | 'model-gen' | 'detail-gen';

interface TabSwitcherProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'try-on' as TabType, label: '换装试穿', icon: Shirt },
  { id: 'model-gen' as TabType, label: '模特生成', icon: UserRound },
  { id: 'detail-gen' as TabType, label: '详情页生成', icon: FileImage },
];

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const tabCount = tabs.length;

  return (
    <div className="relative flex p-1 bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl">
      {/* 滑动背景指示器 */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-xl bg-white dark:bg-zinc-700 shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/50"
        initial={false}
        animate={{
          left: `calc(${(activeIndex * 100) / tabCount}% + 4px)`,
          width: `calc(${100 / tabCount}% - 8px)`,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
      />

      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-sm transition-colors duration-200',
              isActive
                ? 'text-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            )}
          >
            <Icon
              className={cn(
                'w-4 h-4 transition-all duration-200',
                isActive && 'scale-110'
              )}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
