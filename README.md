# AI VTON Lab

基于 Google GenAI 的 AI 虚拟试穿与图像生成平台。

## 功能特性

- 🎨 **AI 图像生成** - 基于 Google Gemini 模型的智能图像生成
- 👗 **虚拟试穿** - AI 驱动的服装试穿体验
- ⚡ **实时推送** - WebSocket 实时任务状态更新
- 💰 **Batch API** - 支持批量生成，50% 成本优惠
- 🔐 **RBAC 权限** - 完整的用户角色权限管理

## 项目结构

```
ai-vton-lab/
├── admin/                 # 管理后台 (Next.js 16 + React 19)
├── backend/               # API 服务 (FastAPI + Tortoise-ORM)
│   ├── app/
│   │   ├── api/v1/       # API 路由
│   │   ├── core/         # 核心模块 (image_client, worker, ws_manager)
│   │   ├── models/       # 数据模型
│   │   └── schemas/      # Pydantic 模式
│   └── run.py            # 启动入口
├── client/                # AI 试穿客户端 (Next.js 16 + Zustand)
└── docs/                  # 项目文档
```

## 技术栈

| 项目 | 技术 | 说明 |
|------|------|------|
| **admin** | Next.js 16 + React 19 + TanStack Query | 管理后台 |
| **backend** | FastAPI 0.111 + Tortoise-ORM + Google GenAI | API 服务 |
| **client** | Next.js 16 + React 19 + Zustand | AI 试穿客户端 |

### 后端依赖
- **框架**: FastAPI 0.111
- **ORM**: Tortoise-ORM + Aerich 迁移
- **数据库**: MySQL / SQLite
- **认证**: JWT + RBAC
- **AI**: Google GenAI SDK

### 前端依赖
- **框架**: Next.js 16.1.3 + React 19
- **UI**: Shadcn/ui + Tailwind CSS
- **状态管理**: Zustand (client) / TanStack Query (admin)

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

- [简单异步方案](docs/fastapi_image_async_simple_plan.md)
- [WebSocket 实时推送方案](docs/fastapi_image_async_ws_plan.md)
- [Google GenAI 异步方案](docs/fastapi_google_image_async_plan.md)
- [UI 需求文档](docs/ai_try_on_ui_requirements_v1.1.md)
- [项目计划](docs/ProjectPlan.md)

## License

MIT
