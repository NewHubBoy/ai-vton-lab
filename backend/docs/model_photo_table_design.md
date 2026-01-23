# 模特生成记录表设计

## 方案二：主表 + 图片表（推荐）

### 1. 主表: `model_photo` (模特记录)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInt | PK |
| created_at | DateTime | auto_now_add |
| updated_at | DateTime | auto_now |
| user_id | BigInt | 发起用户ID (idx) |
| task_id | Char(36) | 关联的ImageTask.ID |
| batch_id | Char(36) | 批量任务ID |
| name | Varchar(100) | 模特名称 |
| description | Text | 描述 |
| gender | Varchar(10) | male/female/other |
| age_range | Varchar(20) | 如: "25-30" |
| ethnicity | Varchar(50) | 种族/肤色 |
| style_tags | JSON | 风格标签数组 |
| prompt | Text | 完整提示词 |
| reference_images | JSON | 参考图片URL列表 |
| aspect_ratio | Varchar(8) | 1:1 / 3:4 / 9:16 |
| resolution | Varchar(8) | 1K / 2K / 4K |
| model_version | Varchar(64) | 模型版本 |
| negative_prompt | Text | 负面提示词 |
| status | Varchar(32) | queued/processing/completed/failed |
| progress | Int(3) | 进度百分比 0-100 |
| error_code | Varchar(64) | 错误码 |
| error_message | Text | 错误详情 |
| started_at | DateTime | 开始时间 |
| finished_at | DateTime | 完成时间 |
| generation_time | Float | 耗时(秒) |
| image_count | Int | 生成图片数量 |
| total_size | BigInt | 总大小(bytes) |
| is_deleted | Boolean | 软删除 |

**索引:**
- (user_id, created_at DESC)
- (status)
- (task_id)
- (gender, style_tags)

### 2. 子表: `model_image` (模特图片)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BigInt | PK |
| created_at | DateTime | auto_now_add |
| model_photo_id | BigInt | 关联model_photo.id (idx) |
| user_id | BigInt | 上传用户ID |
| filename | Varchar(255) | 原始文件名 |
| width | Int | 宽度(px) |
| height | Int | 高度(px) |
| size | BigInt | 文件大小(bytes) |
| content_type | Varchar(100) | MIME类型 |
| extension | Varchar(20) | .jpg/.png 等 |
| oss_object_name | Varchar(500) | OSS对象名/路径 (idx) |
| oss_url | Varchar(1000) | OSS访问URL |
| oss_cdn_url | Varchar(1000) | CDN URL (可选) |
| oss_folder | Varchar(100) | 存储文件夹 |
| local_path | Varchar(500) | 本地备份路径 |
| is_uploaded | Boolean | 是否已上传OSS |
| uploaded_at | DateTime | 上传时间 |
| image_type | Varchar(32) | preview/result/thumbnail |
| is_primary | Boolean | 是否主图 |
| sort_order | Int | 排序权重 |
| is_deleted | Boolean | 软删除 |

**索引:**
- (model_photo_id)
- (oss_object_name)
- (user_id, created_at)

## 关系图

```
┌──────────────┐       1:N       ┌──────────────┐
│  model_photo │───────────────>│  model_image │
│   (模特记录)  │                │   (图片详情)  │
└──────────────┘                └──────────────┘
       │                               │
       │ 1:1                           │ N:1
       v                               v
┌──────────────┐               ┌──────────────┐
│  image_task  │               │     oss_     │
│  (生成任务)   │               │  (OSS记录)   │
└──────────────┘               └──────────────┘
```

## 业务流程

```
1. 用户提交生成请求
   → 创建 model_photo (status=queued)
   → 创建 image_task (调用生成模块)

2. 生成完成
   → 更新 model_photo (status=completed, output_images)
   → 遍历生成结果，创建 model_image 记录

3. 上传OSS
   → 遍历 model_image，上传到OSS
   → 更新 model_image (oss_xxx 字段, is_uploaded=true)

4. 本地备份(可选)
   → 保留本地文件
   → 更新 local_path
```
