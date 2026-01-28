'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTryOnStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { usePromptConfig } from '@/hooks/usePromptConfig';
import { PromptConfigGroupWithOptions } from '@/lib/api/prompt-config';

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
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 tracking-wide">
        {group.group_name}
      </label>
      <div className="relative flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
        {group.options.map((option) => (
          <button
            key={option.option_key}
            onClick={() => onChange(option.option_key)}
            className={cn(
              'flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors z-10',
              selectedValue === option.option_key
                ? 'text-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            )}
          >
            {option.option_label}
          </button>
        ))}
        {activeIndex >= 0 && (
          <motion.div
            className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-zinc-700 shadow-sm"
            initial={false}
            animate={{
              left: `calc(${activeIndex * (100 / optionCount)}% + 4px)`,
              width: `calc(${100 / optionCount}% - 8px)`,
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
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 tracking-wide">
        {group.group_name}
      </label>
      <select
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-2.5 px-3 text-sm font-medium rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-shadow"
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
    <div className="flex items-center justify-between py-2 px-1">
      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        {group.group_name}
      </span>
      <button
        onClick={() => onChange(!selectedValue)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors',
          selectedValue ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'
        )}
      >
        <motion.div
          animate={{ x: selectedValue ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md"
        />
      </button>
    </div>
  );
}

// 渲染圆形单选框组
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
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 tracking-wide">
        {group.group_name}
      </label>
      <div className="space-y-2">
        {group.options.map((option) => {
          const isSelected = selectedValue === option.option_key;
          return (
            <motion.button
              key={option.option_key}
              onClick={() => onChange(option.option_key)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200',
                'border text-left',
                isSelected
                  ? 'bg-zinc-50 dark:bg-zinc-800 border-zinc-900 dark:border-white'
                  : 'bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
              )}
            >
              <div
                className={cn(
                  'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
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
                      className="w-2.5 h-2.5 rounded-full bg-zinc-900 dark:bg-white"
                    />
                  )}
                </AnimatePresence>
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    'text-sm font-medium transition-colors duration-200',
                    isSelected
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-zinc-600 dark:text-zinc-400'
                  )}
                >
                  {option.option_label}
                </span>
                {option.description && (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
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

// 渲染复选框组
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
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 tracking-wide">
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
                'relative flex items-center gap-2 py-2.5 px-3 rounded-xl transition-all duration-200',
                'border text-left',
                isSelected
                  ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white'
                  : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
              )}
            >
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
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// 渲染带图片的选项
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
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 tracking-wide">
        {group.group_name}
      </label>
      <div className="grid grid-cols-4 gap-2">
        {group.options.map((option) => (
          <button
            key={option.option_key}
            onClick={() => onChange(option.option_key)}
            className={cn(
              'relative aspect-square rounded-xl overflow-hidden transition-all border-2',
              selectedValue === option.option_key
                ? 'border-zinc-900 dark:border-white ring-2 ring-zinc-900/20 dark:ring-white/20'
                : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
            )}
          >
            {option.image_url ? (
              <img
                src={option.image_url}
                alt={option.option_label}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-500">
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

export function ModelGenSettings() {
  const {
    dynamicConfigs,
    setDynamicConfig,
    setDynamicConfigs,
  } = useTryOnStore();

  const { configs, isLoading, error } = usePromptConfig();

  // 初始化默认值
  useEffect(() => {
    if (configs.length > 0) {
      const defaults: Record<string, string | string[] | boolean> = {};
      configs.forEach((group) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        <span className="ml-3 text-sm text-zinc-500">加载配置中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-sm text-red-500">
        加载配置失败: {error.message}
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-zinc-500">
        暂无可用配置
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {configs.map((group, index) => (
        <motion.div
          key={group.group_key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <ConfigGroupRenderer
            group={group}
            value={dynamicConfigs[group.group_key]}
            onChange={(value) => setDynamicConfig(group.group_key, value)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
