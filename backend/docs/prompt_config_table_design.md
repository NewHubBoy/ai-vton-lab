# Prompt 参数配置表设计

## 需求说明

- 前端展示配置选项供用户选择
- 后端根据用户选择组合成专业的生图提示词
- 用户可自定义各项配置对应的提示词内容

## 表结构设计

### 1. 配置组表 `prompt_config_group`

配置项的分类，如"性别"、"年龄"、"肤色"、"服装"、"风格"等。

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInt | PK |
| created_at | DateTime | auto_now_add |
| updated_at | DateTime | auto_now |
| group_key | Varchar(64) | 配置组唯一标识，如 `gender`、`age`、`style` |
| group_name | Varchar(100) | 显示名称，如"性别"、"年龄"、"风格" |
| description | Text | 配置组描述 |
| input_type | Varchar(32) | 前端组件类型：select/radio/checkbox/slider |
| is_multiple | Boolean | 是否支持多选 |
| is_required | Boolean | 是否必选 |
| placeholder | Varchar(255) | 占位提示文字 |
| default_option_key | Varchar(64) | 默认选项key |
| sort_order | Int | 排序权重 |
| is_active | Boolean | 是否启用 |
| is_system | Boolean | 系统内置配置（不可删除） |

**索引:**
- (group_key, unique)
- (is_active, sort_order)

---

### 2. 配置选项表 `prompt_config_option`

每个配置组下的具体选项，如"男性"、"女性"、"年轻"、"成熟"等。

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInt | PK |
| created_at | DateTime | auto_now_add |
| updated_at | DateTime | auto_now |
| group_id | BigInt | 关联 prompt_config_group.id (idx) |
| option_key | Varchar(64) | 选项唯一标识，如 `male`、`female`、`young` |
| option_label | Varchar(100) | 前端显示名称，如"男性"、"年轻女性" |
| prompt_text | Text | 转换后的正面提示词片段 |
| negative_prompt | Text | 负面提示词片段（可选） |
| prompt_order | Int | 提示词排序：1=前面 2=中间 3=后面 |
| image_url | Varchar(500) | 选项预览图URL |
| description | Text | 选项描述说明 |
| sort_order | Int | 排序权重 |
| is_active | Boolean | 是否启用 |
| is_default | Boolean | 是否默认选项 |

**索引:**
- (group_id, option_key, unique)
- (group_id, is_active)
- (group_id, sort_order)

---

### 3. 组合规则表 `prompt_combination_rule`

定义不同配置组合时的特殊处理规则。

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInt | PK |
| created_at | DateTime | auto_now_add |
| name | Varchar(100) | 规则名称 |
| description | Text | 规则描述 |
| condition_json | JSON | 触发条件 |
| action_type | Varchar(32) | 动作类型：append/prepend/replace/remove |
| target | Varchar(16) | 作用目标：positive / negative / both |
| action_prompt | Text | 执行的动作内容 |
| priority | Int | 优先级（数字越大优先级越高） |
| is_active | Boolean | 是否启用 |

**condition_json 示例：**
```json
{
  "group_key": "age",
  "option_keys": ["young", "middle_age"]
}
```

---

### 4. 系统配置表 `prompt_config_setting`

全局提示词配置，如通用负面提示词、分隔符、组装顺序等。

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInt | PK |
| created_at | DateTime | auto_now_add |
| updated_at | DateTime | auto_now |
| key | Varchar(64) | 配置键 (idx, unique) |
| value | Text | 配置值 |
| value_type | Varchar(32) | 值类型：text/json/list |
| description | Text | 配置描述 |
| group_name | Varchar(100) | 配置分组名称 |
| sort_order | Int | 排序权重 |
| is_editable | Boolean | 是否可编辑 |

**预设配置：**

| key | value | value_type | description |
|-----|-------|------------|-------------|
| global_negative_prompt | no text, no watermark, low quality, blurry | text | 全局负面提示词 |
| prompt_separator | ,  | text | 片段分隔符 |
| prompt_order | gender,age,ethnicity,clothing,style,background,lighting,camera | list | 提示词组装顺序 |
| max_prompt_length | 1000 | text | 最大提示词长度 |
| default_resolution | 1024x1024 | text | 默认分辨率 |
| default_aspect_ratio | 1:1 | text | 默认宽高比 |

**索引:**
- (key, unique)
- (group_name, sort_order)

---

### 5. 用户配置表 `prompt_user_config`

用户自定义的配置值，记录用户的选择偏好。

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInt | PK |
| created_at | DateTime | auto_now_add |
| updated_at | DateTime | auto_now |
| user_id | BigInt | 关联用户ID (idx) |
| group_id | BigInt | 关联配置组ID |
| selected_options | JSON | 用户选择的选项key数组 |
| custom_prompts | JSON | 自定义的提示词片段覆盖 |
| is_inherited | Boolean | 是否继承系统默认 |
| source_config_id | BigInt | 来源配置ID（继承时关联） |

**索引:**
- (user_id, group_id, unique)

---

## 关系图

```
┌─────────────────────┐       1:N       ┌─────────────────────┐
│ prompt_config_group │───────────────>│ prompt_config_option │
│     (配置组)         │                │     (配置选项)       │
└─────────────────────┘                └─────────────────────┘
          │
          │ 1:N
          ├────────────────────────────────────────┐
          │                                        │
          ▼                                        ▼
┌─────────────────────┐               ┌─────────────────────┐
│ prompt_user_config  │               │ prompt_combination_ │
│    (用户配置)        │               │      rule           │
└─────────────────────┘               │    (组合规则)       │
                                      └─────────────────────┘
                                              │
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │ prompt_config_      │
                                    │     setting         │
                                    │    (系统配置)       │
                                    └─────────────────────┘
```

---

## 组合 Prompt 流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    组合 Prompt 流程                              │
├─────────────────────────────────────────────────────────────────┤
│ 1. 获取用户选择的配置选项                                         │
│    → 从 prompt_user_config 查询                                  │
│    → 获取关联的 prompt_config_option                             │
├─────────────────────────────────────────────────────────────────┤
│ 2. 按 prompt_order 排序提示词片段                                │
│    → order=1: 放在前面（如基础描述）                              │
│    → order=2: 放在中间（如人物特征）                              │
│    → order=3: 放在后面（如风格、背景）                            │
├─────────────────────────────────────────────────────────────────┤
│ 3. 拼接成完整提示词                                              │
│    → 读取 prompt_config_setting.prompt_separator                 │
│    → 读取 prompt_config_setting.prompt_order                     │
│    → 按顺序拼接各组片段                                          │
├─────────────────────────────────────────────────────────────────┤
│ 4. 附加全局负面提示词                                            │
│    → 读取 prompt_config_setting.global_negative_prompt           │
│    → 拼接到负面提示词字段                                        │
├─────────────────────────────────────────────────────────────────┤
│ 5. 应用组合规则                                                  │
│    → 遍历 prompt_combination_rule                                │
│    → 满足 condition 的规则执行对应 action                         │
├─────────────────────────────────────────────────────────────────┤
│ 6. 返回最终 Prompt                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 数据示例

### prompt_config_group 示例

| group_key | group_name | input_type | is_multiple | default_option_key |
|-----------|------------|------------|-------------|-------------------|
| gender | 性别 | select | false | female |
| age | 年龄 | select | false | young |
| ethnicity | 肤色/种族 | select | false | asian |
| clothing | 服装 | checkbox | false | casual |
| style | 风格 | select | false | fashion |
| background | 背景 | select | false | solid |
| lighting | 光线 | checkbox | true | natural |
| camera | 镜头 | select | false | portrait |

### prompt_config_option 示例

| group_id | option_key | option_label | prompt_text | prompt_order |
|----------|------------|--------------|-------------|--------------|
| 1 (性别) | female | 女性 | "young woman, beautiful face" | 2 |
| 1 (性别) | male | 男性 | "handsome man, masculine features" | 2 |
| 2 (年龄) | young | 年轻 | "20-25 years old" | 2 |
| 2 (年龄) | middle | 中年 | "35-40 years old" | 2 |
| 2 (年龄) | mature | 成熟 | "45-50 years old" | 2 |
| 4 (风格) | fashion | 时尚 | "fashion photography, high fashion" | 3 |
| 4 (风格) | cinematic | 电影感 | "cinematic lighting, movie still" | 3 |
| 5 (背景) | solid | 纯色 | "solid color background, white" | 3 |
| 5 (背景) | gradient | 渐变 | "gradient background, soft colors" | 3 |

### prompt_combination_rule 示例

| name | condition_json | action_type | target | action_prompt | priority |
|------|----------------|-------------|--------|---------------|----------|
| 户外场景加自然光 | {"group_key": "background", "option_keys": ["outdoor", "nature"]} | append | positive | "natural sunlight, golden hour" | 10 |
| 夜景加人工灯光 | {"group_key": "background", "option_keys": ["night", "indoor"]} | append | positive | "artificial lighting, studio lights" | 10 |
| 商务正装移除休闲 | {"group_key": "style", "option_keys": ["business"]} | remove | positive | "casual, relaxed" | 20 |

---

## 前端配置界面展示

```
┌─────────────────────────────────────────────────────────┐
│                    模特生成配置                          │
├─────────────────────────────────────────────────────────┤
│  性别:    [女性 ▼]                                      │
│  年龄:    [25-30 ▼]                                     │
│  肤色:    [亚洲 ▼]                                      │
│  服装:    [☐ T恤] [☐ 牛仔裤] [☐ 连衣裙]                │
│  风格:    [时尚 ▼]                                      │
│  背景:    [纯色 ▼]                                      │
│  光线:    [☐ 自然光] [☐ 柔光]                           │
│  镜头:    [广角 ▼]                                      │
├─────────────────────────────────────────────────────────┤
│  [生成预览 Prompt]  [确认生成]                           │
└─────────────────────────────────────────────────────────┘

预览:
young woman, 25-30 years old, asian skin tone,
white t-shirt, blue jeans, fashion photography,
solid color background white, natural lighting

负面:
no text, no watermark, low quality, blurry
```

---

## 与 model_photo 的关系

```
┌─────────────────────┐
│   model_photo       │  模特生成记录
│   (生成记录)         │
└──────────┬──────────┘
           │
           │ 1:1
           v
┌─────────────────────┐
│ prompt_user_config  │  本次生成使用的用户配置
└─────────────────────┘
           │
           │ N:1
           v
┌─────────────────────┐
│ prompt_config_group │  配置组
│ prompt_config_option│  配置选项（实际生成 prompt 的来源）
└─────────────────────┘
```

---

## 整改意见（关键点）

1. **组合规则使用 group_id 不利于迁移与可读性**  
   - 已改为 `group_key` + `option_keys`，避免环境间 ID 不一致导致规则失效。

2. **规则作用目标不清**  
   - 增加 `target` 字段（positive / negative / both），明确规则拼接目标。

3. **默认选项定义存在重复**  
   - `prompt_config_group.default_option_key` 与 `prompt_config_option.is_default` 二选一即可；  
     若保留两者，需保证同组唯一且一致（数据库约束）。

4. **用户配置更像“预设”**  
   - 建议补充 `preset_name`、`is_default`、`scope`（private/shared），支持多套方案。

5. **多语言/运营文案需求**  
   - 后续若有多语言，可将 `group_name` / `option_label` 扩展为 i18n（单表 JSON 或独立翻译表）。

6. **与图生图/换装的协同**  
   - 规则/配置可新增“服装属性类配置组”（材质、版型、场景），用于更精细的 try-on prompt 控制。
