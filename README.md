# AI VTON Lab

基于 Google GenAI 的 AI 虚拟试穿与图像生成平台。

## 功能特性

- 🎨 **AI 图像生成** - 基于 Google GenAI SDK 的智能图像生成
- 👗 **虚拟试穿** - AI 驱动的服装试穿体验
- 📸 **模特生成** - 生成专业的模特照片
- 🖼️ **详情页生成** - 商品详情页图片自动生成
- ⚡ **实时推送** - WebSocket 实时任务状态更新
- 💰 **积分系统** - 完整的用户积分和充值管理
- 🔐 **RBAC 权限** - 完整的用户角色权限管理
- 📦 **批量处理** - 支持批量图像生成任务
- 🗄️ **多数据库** - 支持 MySQL 和 SQLite

## 项目结构

```
ai-vton-lab/
├── admin/                 # 管理后台 (Next.js 16 + React 19 + TanStack Query)
│   ├── app/
│   │   ├── (layout)/     # 布局路由组
│   │   │   ├── business/ # 业务模块（客户、记录、模板、充值等）
│   │   │   └── system/   # 系统管理（用户、角色、菜单、权限等）
│   │   ├── dashboard/    # 仪表盘
│   │   └── login/        # 登录页
│   ├── components/       # UI 组件（shadcn/ui）
│   ├── lib/              # 工具库和 API 客户端
│   └── hooks/            # 自定义 Hooks
│
├── backend/               # API 服务 (FastAPI 0.111 + Tortoise-ORM)
│   ├── app/
│   │   ├── api/v1/       # API 路由
│   │   │   ├── tasks/    # 任务相关 API
│   │   │   ├── ws/       # WebSocket 路由
│   │   │   ├── users/    # 用户管理
│   │   │   ├── roles/    # 角色管理
│   │   │   ├── menus/    # 菜单管理
│   │   │   ├── prompt_config/ # 提示词配置
│   │   │   ├── templates/ # 模板管理
│   │   │   └── recharge/ # 充值管理
│   │   ├── core/         # 核心模块
│   │   │   ├── image_client.py   # Google GenAI 客户端
│   │   │   ├── image_worker.py   # 图像生成 Worker
│   │   │   ├── ws_manager.py     # WebSocket 管理器
│   │   │   ├── payment.py        # Stripe 支付集成
│   │   │   └── init_app.py       # 应用初始化
│   │   ├── models/       # 数据模型
│   │   │   ├── generation_task.py # 生成任务模型
│   │   │   ├── admin.py          # 用户、角色、权限模型
│   │   │   └── prompt_config.py  # 提示词配置
│   │   ├── schemas/      # Pydantic 模式
│   │   ├── services/     # 业务服务
│   │   ├── utils/        # 工具函数（OSS、JWT、密码等）
│   │   └── settings/     # 配置管理
│   ├── web/              # Vue 3 管理后台（旧版/备用）
│   ├── docker/           # Docker 配置
│   ├── migrations/       # 数据库迁移
│   └── run.py            # 启动入口
│
├── client/                # AI 试穿客户端 (Next.js 16 + React 19 + Zustand)
│   ├── app/
│   │   ├── (landing)/    # 落地页
│   │   ├── components/   # 功能组件（试穿、模特、详情生成）
│   │   ├── history/      # 历史记录
│   │   ├── login/        # 登录页
│   │   └── register/     # 注册页
│   ├── lib/              # 工具库和 API 客户端
│   │   ├── store/        # Zustand 状态管理
│   │   └── api/          # API 客户端
│   └── hooks/            # 自定义 Hooks（生成、WebSocket 等）
│
├── docs/                  # 项目文档
│   ├── fastapi_google_image_async_plan.md
│   ├── fastapi_image_async_ws_plan.md
│   ├── ProjectPlan.md
│   └── ai_try_on_ui_requirements_v1.1.md
│
├── README.md
├── CLAUDE.md             # Claude Code 指南
├── GEMINI.md             # Gemini 上下文文件
└── AGENTS.md             # Agents 指南
```

## 技术栈

### 整体架构

| 项目 | 技术栈 | 说明 |
|------|--------|------|
| **admin** | Next.js 16 + React 19 | 管理后台 |
| **backend** | FastAPI 0.111 + Tortoise-ORM + Google GenAI | API 服务 |
| **client** | Next.js 16 + React 19 + Zustand | AI 试穿客户端 |

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **框架** | FastAPI 0.111.0 | Web 框架 |
| **ORM** | Tortoise-ORM 0.23.0 | 数据库 ORM |
| **数据库** | MySQL 8.0 / SQLite | 主数据库 |
| **迁移工具** | Aerich 0.8.1 | 数据库迁移 |
| **认证** | JWT + Argon2 | 用户认证 |
| **AI SDK** | Google GenAI | 图像生成 |
| **对象存储** | 阿里云 OSS | 图片存储 |
| **支付** | Stripe | 支付集成 |
| **WebSocket** | websockets 14.1 | 实时推送 |
| **日志** | loguru 0.7.3 | 日志记录 |
| **验证** | Pydantic 2.10.5 | 数据验证 |
| **配置管理** | pydantic-settings 2.7.1 | 配置管理 |
| **Web 服务器** | Uvicorn 0.34.0 | ASGI 服务器 |
| **代码质量** | Black, isort, Ruff | 代码格式化和检查 |

### 前端技术栈（Admin + Client）

| 技术 | 版本 | 用途 |
|------|------|------|
| **框架** | Next.js 16.1.3/16.1.4 | React 框架 |
| **UI 库** | React 19.2.3 | UI 框架 |
| **语言** | TypeScript 5.1.0 | 类型系统 |
| **样式** | Tailwind CSS 4.1.18 | CSS 框架 |
| **组件库** | shadcn/ui 3.7.0 | UI 组件 |
| **状态管理** | Zustand 5.0.10 (client) | 客户端状态管理 |
| **服务端状态** | TanStack Query 5.90.19 (admin) | 服务端数据获取和缓存 |
| **表单** | React Hook Form 7.53.0 (admin) | 表单处理 |
| **图表** | Recharts 2.15.4 (admin) | 数据可视化 |
| **日期处理** | date-fns 4.1.0 (admin) | 日期处理 |
| **动画** | Framer Motion 12.27.0 (client) | 动画效果 |
| **通知** | Sonner 2.0.7 | 消息提示 |
| **包管理器** | pnpm | 依赖管理 |

### 旧版前端（backend/web）

| 技术 | 版本 | 用途 |
|------|------|------|
| **框架** | Vue 3.3.4 | 渐进式框架 |
| **构建工具** | Vite 4.4.6 | 构建工具 |
| **UI 库** | Naive UI 2.34.4 | UI 组件库 |
| **状态管理** | Pinia 2.1.6 | 状态管理 |
| **路由** | Vue Router 4.2.4 | 路由管理 |
| **国际化** | Vue I18n 9 | 多语言支持 |
| **原子化 CSS** | UnoCSS 0.55.0 | 原子化 CSS |

## 核心功能

### 任务类型

平台支持三种主要的图像生成任务类型：

#### 1. 虚拟试穿 (TRYON)
- 将服装图片应用到模特照片上
- 支持自定义模特和服装图片
- 实时生成试穿效果

#### 2. 模特生成 (MODEL)
- 生成专业的模特照片
- 支持自定义基座模型和 LoRA 配置
- 可调整推理步数和 CFG Scale

#### 3. 详情页生成 (DETAIL)
- 商品详情页图片自动生成
- 支持模板系统
- 可自定义填充数据

### API 端点

#### 任务管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/tasks/generate` | 创建生成任务 |
| GET | `/api/v1/tasks/` | 获取任务列表 |
| GET | `/api/v1/tasks/{task_id}` | 获取任务详情 |
| DELETE | `/api/v1/tasks/{task_id}` | 删除任务（软删除） |

#### WebSocket 实时推送

| 方法 | 路径 | 说明 |
|------|------|------|
| WS | `/api/v1/ws/tasks?token=xxx` | WebSocket 实时任务状态推送 |

#### 其他 API

| 模块 | 路径前缀 | 说明 |
|------|----------|------|
| 用户 | `/api/v1/user` | 用户管理 |
| 角色 | `/api/v1/role` | 角色管理 |
| 菜单 | `/api/v1/menu` | 菜单管理 |
| 部门 | `/api/v1/dept` | 部门管理 |
| 字典 | `/api/v1/dict` | 字典管理 |
| API 权限 | `/api/v1/api` | API 权限管理 |
| 客户 | `/api/v1/customer` | 客户管理 |
| 审计日志 | `/api/v1/auditlog` | 审计日志 |
| 提示词配置 | `/api/v1/prompt-config` | 提示词配置管理 |
| 模板 | `/api/v1/templates` | 模板管理 |
| 充值 | `/api/v1/recharge` | 充值管理 |
| OSS | `/api/v1/oss` | OSS 文件上传 |

### 请求示例

#### 创建虚拟试穿任务

```bash
curl -X POST "http://localhost:9999/api/v1/tasks/generate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "tryon",
    "prompt": "时尚的模特穿着这件衣服",
    "aspect_ratio": "1:1",
    "quality": "1K",
    "tryon": {
      "person_image": "https://example.com/person.jpg",
      "garment_image": "https://example.com/garment.jpg",
      "category": "casual"
    }
  }'
```

#### 创建详情页生成任务

```bash
curl -X POST "http://localhost:9999/api/v1/tasks/generate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "detail",
    "prompt": "商品详情页图片",
    "aspect_ratio": "16:9",
    "quality": "2K",
    "detail": {
      "input_image": "https://example.com/product.jpg",
      "template_id": "template-uuid-here",
      "extra_options": {
        "background": "studio",
        "lighting": "soft"
      }
    }
  }'
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
    } else if (data.status === 'failed') {
      console.log('错误信息:', data.error)
    }
  } else if (data.type === 'heartbeat') {
    console.log('心跳保持')
  }
}

// 订阅任务（兼容旧客户端）
ws.send(JSON.stringify({
  type: 'subscribe',
  task_id: 'task-uuid-here'
}))
```

### 支持的参数

#### 通用参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `task_type` | string | 必填 | 任务类型：tryon/model/detail |
| `prompt` | string | 可选 | 图像描述提示词 |
| `prompt_configs` | object | 可选 | 动态提示词配置 |
| `aspect_ratio` | string | "1:1" | 宽高比 |
| `quality` | string | "1K" | 图片质量 |
| `platform` | string | 可选 | 来源平台 |

#### Tryon 任务参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `person_image` | string | 是 | 模特/人物图 URL |
| `garment_image` | string | 是 | 服装图 URL |
| `category` | string | 是 | 服装分类 |
| `seed` | int | 否 | 随机种子（默认 -1） |
| `mask_image` | string | 否 | 遮罩图 URL |

#### Detail 任务参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input_image` | string | 是 | 原始商品图 URL |
| `template_id` | string | 是 | 使用的模板 ID |
| `extra_options` | object | 否 | 模板填充数据 |

#### Model 任务参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `base_model` | string | 否 | 基座模型 |
| `lora_config` | object | 否 | LoRA 配置 |
| `num_inference_steps` | int | 否 | 推理步数 |
| `guidance_scale` | float | 否 | CFG Scale |

#### 宽高比可选值
`1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`, `6:9`

#### 质量可选值
`1K`, `2K`, `4K`

## 快速开始

### 环境要求

- **Python**: 3.11+
- **Node.js**: 18+
- **pnpm**: 最新版本
- **MySQL**: 8.0+（可选，默认使用 SQLite）

### 后端启动

```bash
cd backend

# 安装依赖
make install  # 或 pip install -r requirements.txt

# 配置数据库（可选，默认使用 SQLite）
# 编辑 .env 文件配置 MySQL 连接信息

# 运行数据库迁移
make migrate   # 生成迁移文件
make upgrade   # 应用迁移

# 启动服务
python run.py
```

服务将在 `http://localhost:9999` 启动，API 文档：`http://localhost:9999/docs`

### Admin 前端启动

```bash
cd admin

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

服务将在 `http://localhost:3001` 启动

### Client 前端启动

```bash
cd client

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

服务将在 `http://localhost:3000` 启动

### 使用 Docker 启动（推荐）

```bash
# 启动 MySQL 和后端服务
cd backend
docker-compose up -d

# 查看日志
docker-compose logs -f backend
```

## 开发工具

### 后端

```bash
cd backend

# 代码格式化和检查
make check      # 格式检查 + lint
make format     # 代码格式化 (black + isort)
make lint       # 运行 ruff

# 数据库操作
make migrate    # 生成迁移文件
make upgrade    # 应用迁移
make clean-db   # 删除 migrations 和 sqlite 文件

# 测试
make test       # 运行测试
```

### 前端

```bash
cd admin  # 或 cd client

# 开发
pnpm dev       # 启动开发服务器
pnpm build     # 构建生产版本
pnpm lint      # ESLint 检查
```

## 默认账号

- **用户名**: `admin`
- **密码**: `123456`

## 架构说明

### 任务处理流程

1. **任务创建**: 用户通过前端提交生成任务，后端创建任务记录（status: queued）
2. **任务处理**: 后台 Worker 轮询队列，获取待处理任务
3. **AI 生成**: Worker 调用 Google GenAI SDK 生成图像
4. **结果存储**: 生成的图片上传到阿里云 OSS
5. **状态更新**: 任务状态更新为 succeeded 或 failed
6. **实时推送**: 通过 WebSocket 推送任务状态给前端
7. **结果展示**: 前端展示生成的图片

### 数据模型

#### 核心模型

- **GenerationTask**: 通用生成任务主表
  - 包含任务类型、状态、提示词、结果等通用字段
  - 支持三种任务类型：tryon、model、detail
  - 软删除支持

- **TaskTryon**: 虚拟试穿任务子表
  - person_image: 模特图片
  - garment_image: 服装图片
  - category: 服装分类

- **TaskDetail**: 详情页生成任务子表
  - input_image: 原始商品图
  - template: 使用的模板
  - extra_options: 模板填充数据

- **TaskModel**: 模特生成任务子表
  - base_model: 基座模型
  - lora_config: LoRA 配置
  - num_inference_steps: 推理步数

#### 管理模型

- **User**: 用户表（含积分余额、角色关联）
- **Role**: 角色表（含菜单、API 权限关联）
- **Menu**: 菜单表
- **Api**: API 权限表
- **Dept**: 部门表
- **Dict**: 字典表
- **PromptConfig**: 提示词配置
- **DetailTemplate**: 详情模板
- **Recharge**: 充值记录

### 状态管理

#### 任务状态

- **queued**: 任务已创建，等待处理
- **processing**: 任务正在处理中
- **succeeded**: 任务成功完成
- **failed**: 任务失败

### 权限控制

系统实现完整的 RBAC（基于角色的访问控制）：

- **用户** 可以拥有多个角色
- **角色** 可以拥有多个菜单和 API 权限
- **菜单** 用于前端路由和导航控制
- **API 权限** 用于后端接口访问控制

## 配置说明

### 后端配置

后端配置文件位于 `backend/app/settings/config.py`，主要配置项：

```python
# 数据库配置
DB_TYPE: str = "mysql"  # sqlite, mysql
DB_HOST: str = "mysql"
DB_PORT: int = 3306
DB_USER: str = "ai_vton_user"
DB_PASSWORD: str = "vton_9f3cX2"
DB_NAME: str = "ai_vton_lab_DB"

# JWT 配置
SECRET_KEY: str = "your-secret-key"
JWT_ALGORITHM: str = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 天

# 阿里云 OSS 配置
OSS_ACCESS_KEY_ID: str = ""
OSS_ACCESS_KEY_SECRET: str = ""
OSS_BUCKET_NAME: str = ""
OSS_ENDPOINT: str = "oss-cn-hangzhou.aliyuncs.com"

# Stripe 支付配置
STRIPE_API_KEY: str = ""
STRIPE_WEBHOOK_SECRET: str = ""

# 积分配置
DEFAULT_CREDIT_PER_YUAN: int = 100  # 1元 = 100积分
```

环境变量可以通过 `.env` 文件配置：

```bash
# .env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=ai_vton_user
DB_PASSWORD=vton_9f3cX2
DB_NAME=ai_vton_lab_DB

SECRET_KEY=your-secret-key
OSS_ACCESS_KEY_ID=your-access-key
OSS_ACCESS_KEY_SECRET=your-access-secret
OSS_BUCKET_NAME=your-bucket-name
```

### 前端配置

前端 API 基础路径配置位于各项目的 `lib/api/` 目录中。

## 部署

### Docker 部署

项目包含完整的 Docker 配置：

```bash
# 构建并启动所有服务
cd backend
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
docker-compose logs -f mysql
```

### 生产环境建议

1. **数据库**: 使用 MySQL 而非 SQLite
2. **对象存储**: 配置阿里云 OSS 或其他云存储
3. **反向代理**: 使用 Nginx 作为反向代理
4. **进程管理**: 使用 Supervisor 或 systemd 管理后端进程
5. **日志**: 配置日志收集和监控
6. **HTTPS**: 配置 SSL 证书
7. **缓存**: 可选添加 Redis 缓存层

## 故障排查

### 常见问题

#### 1. 数据库连接失败

```bash
# 检查 MySQL 服务是否运行
docker-compose ps mysql

# 查看 MySQL 日志
docker-compose logs mysql

# 确认数据库配置
cat backend/.env
```

#### 2. WebSocket 连接失败

- 确认后端服务正常运行
- 检查 JWT token 是否有效
- 确认防火墙允许 WebSocket 连接

#### 3. 图像生成失败

- 检查 Google GenAI API 配置
- 确认 OSS 配置正确
- 查看后端日志获取详细错误信息

#### 4. 前端无法连接后端

- 确认后端服务运行在正确的端口（9999）
- 检查 CORS 配置
- 确认网络连接正常

## 项目文档

- [Google GenAI 异步方案](docs/fastapi_google_image_async_plan.md) - 图像生成异步处理方案
- [WebSocket 实时推送方案](docs/fastapi_image_async_ws_plan.md) - WebSocket 实时推送实现
- [简单异步方案](docs/fastapi_image_async_simple_plan.md) - 简化版异步方案
- [项目计划](docs/ProjectPlan.md) - 项目开发计划
- [UI 需求文档](docs/ai_try_on_ui_requirements_v1.1.md) - UI 需求说明

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议。

### 开发流程

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- **后端**: 遵循 PEP 8，使用 Black 和 isort 格式化
- **前端**: 遵循 ESLint 配置
- **提交信息**: 使用清晰的提交信息

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件

---

**AI VTON Lab** - 基于 Google GenAI 的 AI 虚拟试穿与图像生成平台
