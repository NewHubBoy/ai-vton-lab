# 模特生成记录表设计

## 概述

与 [Prompt 配置表设计](./prompt_config_table_design.md) 配合使用：
- `model_photo` 存储生成记录，关联用户选择的 prompt 配置
- `prompt_config_option` 存储实际生成用的 prompt 片段

> 本文已补充“整改意见 + 图生图/换装扩展设计”，用于后续迭代落地。

---

## 表结构设计

### 1. 主表: `model_photo` (模特生成记录)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInt | PK |
| created_at | DateTime | auto_now_add |
| updated_at | DateTime | auto_now |
| user_id | BigInt | 发起用户ID (idx) |
| task_id | Char(36) | 关联的ImageTask.ID |
| batch_id | Char(36) | 批量任务ID |
| name | Varchar(100) | 模特名称/编号 |
| description | Text | 描述 |
| generation_type | Varchar(32) | 生成类型：text2img / img2img / tryon |
| generation_params | JSON | 生成参数快照（seed、steps、cfg_scale、sampler、scheduler、denoise_strength、lora、controlnet 等） |

**Prompt 配置关联：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| selected_options | JSON | 用户选择的配置选项 (idx) |
| | | ```json |
| | | { |
| | |   "gender": "female", |
| | |   "age": "young", |
| | |   "ethnicity": "asian", |
| | |   "clothing": ["t_shirt", "jeans"], |
| | |   "style": "fashion", |
| | |   "background": "solid", |
| | |   "lighting": ["natural"], |
| | |   "camera": "portrait" |
| | | } |
| | | ``` |
| custom_prompts | JSON | 自定义的 prompt 片段覆盖 |
| final_prompt | Text | 组合后的完整正面提示词 |
| final_negative_prompt | Text | 组合后的完整负面提示词 |
| prompt_config_snapshot | JSON | 生成时使用的配置快照（便于追溯） |

**生成参数：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| reference_images | JSON | 参考图片URL列表 |
| aspect_ratio | Varchar(8) | 1:1 / 3:4 / 9:16 |
| resolution | Varchar(16) | 1024x1024 |
| model_version | Varchar(64) | 模型版本 |
| pipeline_version | Varchar(64) | 推理/算法流水线版本（便于回溯） |

**生成状态：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| status | Varchar(32) | queued/processing/completed/failed |
| progress | Int(3) | 进度百分比 0-100 |
| error_code | Varchar(64) | 错误码 |
| error_message | Text | 错误详情 |
| started_at | DateTime | 开始时间 |
| finished_at | DateTime | 完成时间 |
| generation_time | Float | 耗时(秒) |

**统计信息：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| image_count | Int | 生成图片数量 |
| total_size | BigInt | 总大小(bytes) |
| is_deleted | Boolean | 软删除 |
| deleted_at | DateTime | 删除时间 |

**索引:**
- (user_id, created_at DESC)
- (status)
- (task_id)
- (user_id, status)
- (generation_type)

---

### 2. 子表: `model_image` (模特图片)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInt | PK |
| created_at | DateTime | auto_now_add |
| model_photo_id | BigInt | 关联 model_photo.id (idx) |
| user_id | BigInt | 上传用户ID |

**图片基本信息：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| filename | Varchar(255) | 原始文件名 |
| width | Int | 宽度(px) |
| height | Int | 高度(px) |
| size | BigInt | 文件大小(bytes) |
| content_type | Varchar(100) | MIME类型 |
| extension | Varchar(20) | .jpg/.png 等 |

**OSS 信息：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| oss_object_name | Varchar(500) | OSS对象名/路径 (idx) |
| oss_url | Varchar(1000) | OSS访问URL |
| oss_cdn_url | Varchar(1000) | CDN URL (可选) |
| oss_folder | Varchar(100) | 存储文件夹 |
| local_path | Varchar(500) | 本地备份路径 |
| is_uploaded | Boolean | 是否已上传OSS |
| uploaded_at | DateTime | 上传时间 |

**图片分类：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| image_type | Varchar(32) | preview/result/thumbnail |
| is_primary | Boolean | 是否主图 |
| sort_order | Int | 排序权重 |
| is_deleted | Boolean | 软删除 |
| parent_image_id | BigInt | 父图ID（派生图/缩略图） |

**索引:**
- (model_photo_id)
- (oss_object_name)
- (user_id, created_at)

---

### 3. 子表: `model_photo_option` (生成选项明细)

> 用于支持高效筛选与统计，避免仅依赖 JSON 查询。

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInt | PK |
| created_at | DateTime | auto_now_add |
| model_photo_id | BigInt | 关联 model_photo.id (idx) |
| user_id | BigInt | 发起用户ID |
| group_key | Varchar(64) | 配置组key，如 gender/age/style |
| option_key | Varchar(64) | 选项key，如 female/young/fashion |
| option_label | Varchar(100) | 选项显示名（便于报表） |

**索引:**
- (model_photo_id)
- (group_key, option_key)
- (user_id, created_at)

---

### 4. 子表: `model_input_image` (生成输入图片，面向图生图/换装)

> 用于记录生成时的输入图像，避免只存 URL 导致无法区分角色与用途。

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInt | PK |
| created_at | DateTime | auto_now_add |
| model_photo_id | BigInt | 关联 model_photo.id (idx) |
| user_id | BigInt | 上传用户ID |
| role | Varchar(32) | base_model / garment / mask / pose / control / depth / seg |
| filename | Varchar(255) | 原始文件名 |
| width | Int | 宽度(px) |
| height | Int | 高度(px) |
| size | BigInt | 文件大小(bytes) |
| content_type | Varchar(100) | MIME类型 |
| extension | Varchar(20) | .jpg/.png |
| oss_object_name | Varchar(500) | OSS对象名/路径 (idx) |
| oss_url | Varchar(1000) | OSS访问URL |
| meta | JSON | 角色相关参数（如 mask_blur、inpaint_area 等） |
| is_deleted | Boolean | 软删除 |

**索引:**
- (model_photo_id, role)
- (oss_object_name)

---

## 与 Prompt 配置表的关系

```
┌─────────────────────────────────────────────────────────────────┐
│                      整体关系图                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐                                        │
│  │   model_photo       │  模特生成记录                           │
│  │   (生成记录)         │  ──────────────────────────────────┐   │
│  └──────────┬──────────┘                                      │   │
│             │                                                 │   │
│             │ selected_options: {                             │   │
│             │   "gender": "female",                           │   │
│             │   "age": "young",                               │   │
│             │   ...                                           │   │
│             │ }                                               │   │
│             │                                                 │   │
│             ▼                                                 │   │
│  ┌─────────────────────┐     N:1    ┌─────────────────────┐    │
│  │   model_image       │<───────────│  prompt_config_     │    │
│  │   (图片详情)         │           │       group         │    │
│  └─────────────────────┘           │    (配置组)          │    │
│                                    └───────────┬─────────┘    │
│                                                │              │
│                                                │ 1:N          │
│                                                ▼              │
│                                    ┌─────────────────────┐    │
│                                    │ prompt_config_option│    │
│                                    │   (配置选项+片段)    │    │
│                                    │   prompt_text       │    │
│                                    └─────────────────────┘    │
│                                                                   │
│  ┌─────────────────────┐         ┌─────────────────────┐        │
│  │  image_task         │         │ prompt_config_      │        │
│  │  (生成任务)          │         │     setting         │        │
│  │                     │         │  (系统全局配置)      │        │
│  └─────────────────────┘         └─────────────────────┘        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 完整的业务流程

```
┌─────────────────────────────────────────────────────────────────────┐
│                         完整业务流程                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. 用户在前端选择配置                                               │
│     ┌─────────────────────────────────────────────────────────────┐ │
│     │ gender: [女性]                                              │ │
│     │ age: [25-30]                                                │ │
│     │ style: [时尚]                                               │ │
│     │ ...                                                         │ │
│     └─────────────────────────────────────────────────────────────┘ │
│                              │                                     │
│                              ▼                                     │
│  2. 构建 selected_options JSON                                      │
│     {                                                              │
│       "gender": "female",                                          │
│       "age": "young",                                              │
│       "style": "fashion"                                           │
│     }                                                              │
│                              │                                     │
│                              ▼                                     │
│  3. 后端组合 Prompt                                                 │
│     ┌─────────────────────────────────────────────────────────────┐ │
│     │ • 读取 prompt_config_setting 配置                           │ │
│     │ • 根据 selected_options 查询 prompt_config_option           │ │
│     │ • 按 prompt_order 排序片段                                  │ │
│     │ • 拼接成 final_prompt                                       │ │
│     │ • 附加 global_negative_prompt → final_negative_prompt       │ │
│     │ • 应用 prompt_combination_rule                              │ │
│     └─────────────────────────────────────────────────────────────┘ │
│                              │                                     │
│                              ▼                                     │
│  4. 创建 model_photo 记录                                           │
│     - status: queued                                               │
│     - selected_options: 用户选择                                    │
│     - prompt_config_snapshot: 配置快照                              │
│     - final_prompt: 组合后的提示词                                  │
│     - final_negative_prompt: 负面提示词                             │
│                              │                                     │
│                              ▼                                     │
│  5. 调用生图 API (image_task)                                       │
│                              │                                     │
│                              ▼                                     │
│  6. 生成完成，更新状态                                              │
│     - status: completed                                            │
│     - image_count, total_size                                      │
│                              │                                     │
│                              ▼                                     │
│  7. 上传结果图片到 OSS                                              │
│     - 创建 model_image 记录                                         │
│     - 更新 oss_xxx 字段                                             │
│                              │                                     │
│                              ▼                                     │
│  8. 完成                                                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 数据示例

### model_photo 记录示例

| 字段 | 值 |
|------|-----|
| id | 1 |
| user_id | 100 |
| name | 模特-001 |
| selected_options | `{"gender": "female", "age": "young", "style": "fashion", "background": "solid"}` |
| custom_prompts | `{"gender": "elegant woman, graceful posture"}` |
| final_prompt | "elegant woman, graceful posture, 20-25 years old, beautiful face, fashion photography, high fashion, solid color background, white, professional lighting" |
| final_negative_prompt | "no text, no watermark, low quality, blurry, deformed" |
| aspect_ratio | 3:4 |
| resolution | 1024x1344 |
| status | completed |
| image_count | 4 |
| total_size | 8388608 |

### model_image 记录示例

| 字段 | 值 |
|------|-----|
| id | 1 |
| model_photo_id | 1 |
| filename | model_001_01.png |
| width | 1024 |
| height | 1344 |
| size | 2097152 |
| oss_object_name | model-photo/2024/01/23/001_01.png |
| oss_url | https://oss.example.com/model-photo/2024/01/23/001_01.png |
| image_type | result |
| is_primary | true |

---

## 查询示例

### 根据配置查询生成记录

```sql
-- 查找所有选择"时尚风格"的女性模特生成记录
SELECT mp.*
FROM model_photo mp
WHERE mp.selected_options->>'$.gender' = 'female'
  AND mp.selected_options->>'$.style' = 'fashion'
  AND mp.status = 'completed';
```

### 统计各配置的生成次数

```sql
SELECT
  mp.selected_options->>'$.gender' AS gender,
  mp.selected_options->>'$.style' AS style,
  COUNT(*) AS count
FROM model_photo mp
WHERE mp.status = 'completed'
GROUP BY gender, style;
```

---

## 整改意见（关键点）

1. **仅存 selected_options JSON，不利于统计与筛选**  
   - 建议新增 `model_photo_option` 中间表：  
     `model_photo_id, group_key, option_key, option_label`  
   - 或在数据库层使用生成列 + 索引（视数据库能力选择）。

2. **生成参数缺少可复现信息**  
   - 建议统一落入 `generation_params`（seed、steps、cfg_scale、sampler、scheduler、denoise_strength、lora、controlnet 等），避免只存 `model_version`。

3. **图生图/换装缺少输入图建模**  
   - 已新增 `model_input_image`，区分 `base_model / garment / mask / pose / control / depth / seg`，并支持记录角色参数。

4. **派生图/缩略图缺少关联**  
   - 建议增加 `parent_image_id`，用于结果图衍生（缩略图、裁剪图等）。

5. **软删除缺少时间维度**  
   - 建议新增 `deleted_at`，便于数据清理与审计。

6. **生成类型缺失**  
   - 已新增 `generation_type`，便于区分 text2img / img2img / tryon 流程与统计。
