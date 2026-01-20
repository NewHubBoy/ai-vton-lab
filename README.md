# AI VTON Lab

基于 FastAPI + Vue 3 的全栈 AI 虚拟试穿与图像生成平台。

## 项目结构

```
ai-vton-lab/
├── backend/               # FastAPI 后端
│   ├── app/
│   │   ├── api/v1/       # API 路由
│   │   │   ├── images/   # 图像生成 API
│   │   │   └── ws.py     # WebSocket 路由
│   │   ├── core/         # 核心模块
│   │   │   ├── image_client.py   # Google Gen SDK 客户端
│   │   │   ├── image_worker.py   # 后台任务 Worker
│   │   │   └── ws_manager.py     # WebSocket 连接管理
│   │   ├── models/       # 数据模型
│   │   │   └── image_task.py     # 图像生成任务模型
│   │   └── schemas/      # Pydantic 模式
│   │       └── image_task.py     # 图像生成请求/响应模式
│   └── run.py            # 启动入口
├── client/               # Vue 3 前端
└── docs/                 # 文档
```

## 技术栈

### 后端
- **框架**: FastAPI 0.111.0
- **ORM**: Tortoise-ORM 0.23.0
- **数据库**: MySQL / SQLite
- **认证**: JWT + RBAC

### 前端
- **框架**: Next.js 16.1.3
- **UI**: Vue 3 + Tailwind CSS
- **状态管理**: Zustand

## 图像生成功能

### API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/images/generate` | 创建图像生成任务（实时） |
| POST | `/api/v1/images/batch-generate` | 创建批量任务（Batch API，50% 价格） |
| GET | `/api/v1/images/tasks/{task_id}` | 查询任务详情 |
| GET | `/api/v1/images` | 获取任务列表 |
| GET | `/api/v1/images/batch/{batch_name}/status` | 查询批量任务状态 |
| GET | `/api/v1/images/batch/{batch_name}/results` | 获取批量任务结果 |
| WS | `/api/v1/ws/tasks?token=xxx` | WebSocket 实时推送 |

### 请求示例

```bash
# 创建任务（实时生成）
curl -X POST "http://localhost:9999/api/v1/images/generate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "一只在草地上奔跑的猫",
    "reference_images": ["/path/to/reference.jpg"],
    "aspect_ratio": "1:1",
    "resolution": "1K"
  }'
```

### Batch API 批量生成（50% 价格）

使用 Gemini Batch API 进行批量图像生成，适合离线处理场景。

**特点：**
- 价格：标准价格的 50%
- 处理时间：目标 24 小时内完成（通常更快）
- 限制：不支持参考图片，每次最多 100 个 prompt

```bash
# 创建批量任务
curl -X POST "http://localhost:9999/api/v1/images/batch-generate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "prompts": ["生成一只猫", "生成一只狗", "生成一辆车"],
    "aspect_ratio": "1:1",
    "resolution": "1K"
  }'

# 查询批量任务状态
curl "http://localhost:9999/api/v1/images/batch/{batch_name}/status" \
  -H "Authorization: Bearer <token>"

# 获取批量任务结果（仅在 SUCCEEDED 后调用）
curl "http://localhost:9999/api/v1/images/batch/{batch_name}/results" \
  -H "Authorization: Bearer <token>"
```

### WebSocket 实时推送

```typescript
// 前端连接
const ws = new WebSocket(`ws://localhost:9999/api/v1/ws/tasks?token=${token}`)

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)

  if (data.type === 'task_update') {
    console.log('任务状态:', data.status)
    if (data.status === 'succeeded') {
      console.log('生成结果:', data.result)
    }
  }
}

// 订阅任务
ws.send(JSON.stringify({
  type: 'subscribe',
  task_id: 'task-uuid-here'
}))
```

### 支持的参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `prompt` | string | 必填 | 图像描述提示词 |
| `reference_images` | string[] | 可选 | 参考图片路径列表 |
| `aspect_ratio` | string | "1:1" | 宽高比 |
| `resolution` | string | "1K" | 分辨率 |

#### 宽高比可选值
`1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`, `6:9`

#### 分辨率可选值
`1K`, `2K`, `4K`

## 启动服务

### 后端

```bash
cd backend

# 安装依赖
make install  # 或 pip install -r requirements.txt

# 启动服务
python run.py
```

服务将在 `http://localhost:9999` 启动

### 前端

```bash
cd client
pnpm install
pnpm dev
```

## 数据库迁移

```bash
cd backend

# 生成迁移
make migrate

# 应用迁移
make upgrade
```

## 默认账号

- 用户名: `admin`
- 密码: `123456`

## 文档

- [简单异步方案](fastapi_image_async_simple_plan.md)
- [WebSocket 实时推送方案](fastapi_image_async_ws_plan.md)
- [原 PostgreSQL 方案](fastapi_google_image_async_plan.md)
