"""
提示词组装服务

职责：
1. 根据用户选择的配置项获取对应的提示词片段
2. 按照 prompt_order 排序组装提示词
3. 应用组合规则
4. 拼接全局设置
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

from app.models.prompt_config import (
    PromptCombinationRule,
    PromptConfigGroup,
    PromptConfigOption,
    PromptConfigSetting,
)


@dataclass
class AssembledPrompt:
    """组装后的提示词结果"""

    positive_prompt: str  # 正向提示词
    negative_prompt: str  # 负向提示词
    raw_selections: Dict[str, List[str]]  # 原始选择记录


class PromptAssembler:
    """提示词组装器"""

    def __init__(self, task_type: str):
        self.task_type = task_type
        self._settings_cache: Dict[str, str] = {}

    async def assemble(
        self,
        selected_configs: Dict[str, List[str]],
        user_prompt: Optional[str] = None,
    ) -> AssembledPrompt:
        """
        组装提示词

        Args:
            selected_configs: 用户选择 {group_key: [option_key, ...]}
            user_prompt: 用户自定义提示词

        Returns:
            AssembledPrompt 包含正向和负向提示词
        """
        # 1. 加载全局设置
        await self._load_settings()

        # 2. 获取所有选中的配置项
        options = await self._get_selected_options(selected_configs)

        # 3. 按 prompt_order 分组排序
        front_prompts: List[str] = []  # order = 1
        middle_prompts: List[str] = []  # order = 2
        back_prompts: List[str] = []  # order = 3
        negative_prompts: List[str] = []

        for option in options:
            if option.prompt_text:
                if option.prompt_order == 1:
                    front_prompts.append(option.prompt_text)
                elif option.prompt_order == 3:
                    back_prompts.append(option.prompt_text)
                else:
                    middle_prompts.append(option.prompt_text)

            if option.negative_prompt:
                negative_prompts.append(option.negative_prompt)

        # 4. 获取预设提示词模板
        base_prompt = await self._get_base_prompt()

        # 5. 组装正向提示词
        separator = self._settings_cache.get("prompt_separator", ", ")

        all_parts = []
        if base_prompt:
            all_parts.append(base_prompt)
        all_parts.extend(front_prompts)
        if user_prompt:
            all_parts.append(user_prompt)
        all_parts.extend(middle_prompts)
        all_parts.extend(back_prompts)

        positive_prompt = separator.join(filter(None, all_parts))

        # 6. 组装负向提示词
        global_negative = self._settings_cache.get("global_negative_prompt", "")
        all_negative = [global_negative] + negative_prompts
        negative_prompt = separator.join(filter(None, all_negative))

        # 7. 应用组合规则
        positive_prompt, negative_prompt = await self._apply_rules(
            positive_prompt, negative_prompt, selected_configs
        )

        return AssembledPrompt(
            positive_prompt=positive_prompt,
            negative_prompt=negative_prompt,
            raw_selections=selected_configs,
        )

    async def _load_settings(self):
        """加载全局设置"""
        settings = await PromptConfigSetting.all()
        self._settings_cache = {s.key: s.value for s in settings}

    async def _get_selected_options(
        self, selected_configs: Dict[str, List[str]]
    ) -> List[PromptConfigOption]:
        """获取所有选中的配置项"""
        options = []
        for group_key, option_keys in selected_configs.items():
            group = await PromptConfigGroup.get_or_none(group_key=group_key, is_active=True)
            if not group:
                continue

            group_options = await PromptConfigOption.filter(
                group=group, option_key__in=option_keys, is_active=True
            ).order_by("sort_order")

            options.extend(group_options)

        return options

    async def _get_base_prompt(self) -> str:
        """获取任务类型对应的基础提示词模板"""
        key = f"base_prompt_{self.task_type}"
        return self._settings_cache.get(key, "")

    async def _apply_rules(
        self,
        positive: str,
        negative: str,
        selections: Dict[str, List[str]],
    ) -> Tuple[str, str]:
        """应用组合规则"""
        rules = await PromptCombinationRule.filter(is_active=True).order_by("-priority")

        for rule in rules:
            if self._check_condition(rule.condition_json, selections):
                positive, negative = self._execute_action(rule, positive, negative)

        return positive, negative

    def _check_condition(
        self,
        condition: dict,
        selections: Dict[str, List[str]],
    ) -> bool:
        """检查规则条件是否满足"""
        if not condition:
            return False

        # 条件格式: {"group_key": ["option_key1", "option_key2"]}
        # 表示：当 group_key 选中了任一 option_key 时触发
        for group_key, required_options in condition.items():
            selected = selections.get(group_key, [])
            if any(opt in selected for opt in required_options):
                return True
        return False

    def _execute_action(
        self,
        rule: PromptCombinationRule,
        positive: str,
        negative: str,
    ) -> Tuple[str, str]:
        """执行规则动作"""
        target_positive = rule.target in ("positive", "both")
        target_negative = rule.target in ("negative", "both")

        if rule.action_type == "append":
            if target_positive:
                positive = f"{positive}, {rule.action_prompt}"
            if target_negative:
                negative = f"{negative}, {rule.action_prompt}"

        elif rule.action_type == "prepend":
            if target_positive:
                positive = f"{rule.action_prompt}, {positive}"
            if target_negative:
                negative = f"{rule.action_prompt}, {negative}"

        elif rule.action_type == "replace":
            if target_positive:
                positive = rule.action_prompt
            if target_negative:
                negative = rule.action_prompt

        elif rule.action_type == "remove":
            if target_positive:
                positive = positive.replace(rule.action_prompt, "")
            if target_negative:
                negative = negative.replace(rule.action_prompt, "")

        return positive, negative
