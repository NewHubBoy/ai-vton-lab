'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, ChevronDown, Loader2 } from 'lucide-react';
import { useTryOnStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { usePromptConfig } from '@/hooks/usePromptConfig';
import { PromptConfigGroupWithOptions, PromptConfigOption, ConfigType } from '@/lib/api/prompt-config';

// 渲染单选按钮组 - 滑块式 Tab 样式
function RadioGroup({
  group,
  selectedValue,
  onChange,
}: {
  group: PromptConfigGroupWithOptions;
  selectedValue: string;
  onChange: (value: string) => void;
}) {
  const activeIndex = group.options.findIndex((opt) => opt.option_key === selectedValue);
  const optionCount = group.options.length;

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
        {group.group_name}
      </label>
      <div className="relative flex gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
        {group.options.map((option) => (
          <button
            key={option.option_key}
            onClick={() => onChange(option.option_key)}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors z-10',
              selectedValue === option.option_key
                ? 'text-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            )}
          >
            {option.option_label}
          </button>
        ))}
        {/* Animated tab indicator */}
        {activeIndex >= 0 && (
          <motion.div
            className="absolute top-0.5 bottom-0.5 rounded-md bg-white dark:bg-zinc-700 shadow-sm"
            initial={false}
            animate={{
              left: `calc(${activeIndex * (100 / optionCount)}% + 2px)`,
              width: `calc(${100 / optionCount}% - 4px)`,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
          />
        )}
      </div>
    </div>
  );
}

// 渲染选择框
function SelectGroup({
  group,
  selectedValue,
  onChange,
}: {
  group: PromptConfigGroupWithOptions;
  selectedValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
        {group.group_name}
      </label>
      <select
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-1.5 px-2 text-xs font-medium rounded-md bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
      >
        {group.options.map((option) => (
          <option key={option.option_key} value={option.option_key}>
            {option.option_label}
          </option>
        ))}
      </select>
    </div>
  );
}

// 渲染开关
function ToggleGroup({
  group,
  selectedValue,
  onChange,
}: {
  group: PromptConfigGroupWithOptions;
  selectedValue: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between pt-1">
      <span className="text-xs text-zinc-600 dark:text-zinc-400">
        {group.group_name}
      </span>
      <button
        onClick={() => onChange(!selectedValue)}
        className={cn(
          'relative w-8 h-4.5 rounded-full transition-colors',
          selectedValue ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-600'
        )}
      >
        <motion.div
          animate={{ x: selectedValue ? 16 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white dark:bg-zinc-900 rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}

// 渲染圆形单选框组（radiobox）- 传统单选框样式
function RadioboxGroup({
  group,
  selectedValue,
  onChange,
}: {
  group: PromptConfigGroupWithOptions;
  selectedValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
        {group.group_name}
      </label>
      <div className="space-y-1.5">
        {group.options.map((option) => {
          const isSelected = selectedValue === option.option_key;
          return (
            <motion.button
              key={option.option_key}
              onClick={() => onChange(option.option_key)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200',
                'border text-left',
                isSelected
                  ? 'bg-zinc-50 dark:bg-zinc-800 border-zinc-900 dark:border-white'
                  : 'bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
              )}
            >
              {/* 圆形单选框 */}
              <div
                className={cn(
                  'shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                  isSelected
                    ? 'border-zinc-900 dark:border-white'
                    : 'border-zinc-300 dark:border-zinc-600'
                )}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* 标签和描述 */}
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    'text-xs font-medium transition-colors duration-200',
                    isSelected
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-zinc-600 dark:text-zinc-400'
                  )}
                >
                  {option.option_label}
                </span>
                {option.description && (
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                    {option.description}
                  </p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// 渲染复选框组（多选）- 带勾选动画的卡片式设计
function CheckboxGroup({
  group,
  selectedValues,
  onChange,
}: {
  group: PromptConfigGroupWithOptions;
  selectedValues: string[];
  onChange: (values: string[]) => void;
}) {
  const handleToggle = (optionKey: string) => {
    if (selectedValues.includes(optionKey)) {
      onChange(selectedValues.filter((v) => v !== optionKey));
    } else {
      onChange([...selectedValues, optionKey]);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
        {group.group_name}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {group.options.map((option) => {
          const isSelected = selectedValues.includes(option.option_key);
          return (
            <motion.button
              key={option.option_key}
              onClick={() => handleToggle(option.option_key)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200',
                'border text-left',
                isSelected
                  ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white'
                  : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
              )}
            >
              {/* 自定义复选框 */}
              <div
                className={cn(
                  'flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200',
                  isSelected
                    ? 'bg-white dark:bg-zinc-900 border-white dark:border-zinc-900'
                    : 'border-zinc-300 dark:border-zinc-600'
                )}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.svg
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-2.5 h-2.5 text-zinc-900 dark:text-white"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 6l3 3 5-6" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </div>

              {/* 标签文字 */}
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-200',
                  isSelected
                    ? 'text-white dark:text-zinc-900'
                    : 'text-zinc-600 dark:text-zinc-400'
                )}
              >
                {option.option_label}
              </span>

              {/* 选中时的光晕效果 */}
              {isSelected && (
                <motion.div
                  layoutId={`checkbox-glow-${option.option_key}`}
                  className="absolute inset-0 rounded-lg bg-zinc-900/5 dark:bg-white/5 -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// 渲染带图片的选项（用于带 image_url 的选项）
function ImageOptionGroup({
  group,
  selectedValue,
  onChange,
}: {
  group: PromptConfigGroupWithOptions;
  selectedValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
        {group.group_name}
      </label>
      <div className="grid grid-cols-4 gap-1.5">
        {group.options.map((option) => (
          <button
            key={option.option_key}
            onClick={() => onChange(option.option_key)}
            className={cn(
              'relative aspect-square rounded-md overflow-hidden transition-all border-2',
              selectedValue === option.option_key
                ? 'border-zinc-900 dark:border-white'
                : 'border-transparent'
            )}
          >
            {option.image_url ? (
              <img
                src={option.image_url}
                alt={option.option_label}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-500">
                {option.option_label}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// 根据配置组类型渲染对应组件
function ConfigGroupRenderer({
  group,
  value,
  onChange,
}: {
  group: PromptConfigGroupWithOptions;
  value: string | string[] | boolean;
  onChange: (value: string | string[] | boolean) => void;
}) {
  // 如果有图片选项，使用图片渲染器
  const hasImageOptions = group.options.some((opt) => opt.image_url);

  switch (group.input_type) {
    case 'toggle':
      return (
        <ToggleGroup
          group={group}
          selectedValue={value as boolean}
          onChange={onChange}
        />
      );
    case 'radiobox':
      return (
        <RadioboxGroup
          group={group}
          selectedValue={value as string}
          onChange={onChange}
        />
      );
    case 'checkbox':
      return (
        <CheckboxGroup
          group={group}
          selectedValues={(value as string[]) || []}
          onChange={onChange}
        />
      );
    case 'select':
      return (
        <SelectGroup
          group={group}
          selectedValue={value as string}
          onChange={onChange}
        />
      );
    case 'radio':
    default:
      if (hasImageOptions) {
        return (
          <ImageOptionGroup
            group={group}
            selectedValue={value as string}
            onChange={onChange}
          />
        );
      }
      return (
        <RadioGroup
          group={group}
          selectedValue={value as string}
          onChange={onChange}
        />
      );
  }
}

interface AdvancedSettingsProps {
  configType?: ConfigType;
}

export function AdvancedSettings({ configType = 'tryon' }: AdvancedSettingsProps) {
  const {
    advancedSettingsOpen,
    setAdvancedSettingsOpen,
    dynamicConfigs,
    setDynamicConfig,
    setDynamicConfigs,
  } = useTryOnStore();

  const { configs, isLoading, error } = usePromptConfig({ configType });

  // 初始化默认值
  useEffect(() => {
    if (configs.length > 0) {
      const defaults: Record<string, string | string[] | boolean> = {};
      configs.forEach((group) => {
        // 如果已有值则跳过
        if (dynamicConfigs[group.group_key] !== undefined) return;

        if (group.input_type === 'toggle') {
          defaults[group.group_key] = group.default_option_key === 'true';
        } else if (group.input_type === 'checkbox' || group.is_multiple) {
          const defaultOptions = group.options
            .filter((opt) => opt.is_default)
            .map((opt) => opt.option_key);
          defaults[group.group_key] = defaultOptions.length > 0 ? defaultOptions : [];
        } else {
          const defaultOption = group.options.find((opt) => opt.is_default);
          defaults[group.group_key] =
            defaultOption?.option_key ||
            group.default_option_key ||
            group.options[0]?.option_key ||
            '';
        }
      });

      if (Object.keys(defaults).length > 0) {
        setDynamicConfigs({ ...dynamicConfigs, ...defaults });
      }
    }
  }, [configs]);

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
            高级设置
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
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                  <span className="ml-2 text-xs text-zinc-500">加载配置中...</span>
                </div>
              ) : error ? (
                <div className="text-center py-4 text-xs text-red-500">
                  加载配置失败: {error.message}
                </div>
              ) : configs.length === 0 ? (
                <div className="text-center py-4 text-xs text-zinc-500">
                  暂无可用配置
                </div>
              ) : (
                configs.map((group) => (
                  <ConfigGroupRenderer
                    key={group.group_key}
                    group={group}
                    value={dynamicConfigs[group.group_key]}
                    onChange={(value) => setDynamicConfig(group.group_key, value)}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
