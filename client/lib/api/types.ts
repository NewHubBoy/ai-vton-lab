/**
 * 任务类型枚举：tryon=虚拟试穿, model=模特生成, detail=商品详情
 */
export type TaskType = 'tryon' | 'model' | 'detail';

/**
 * 图像生成任务请求参数
 */
export interface ImageTaskRequest {
    // 任务类型
    task_type?: TaskType;
    // 用户自定义提示词
    user_prompt?: string;
    // 用户选择的配置项 {group_key: [option_key, ...]}
    selected_configs?: Record<string, string[]>;
    // 参考图片
    reference_images?: string[];
    // 其他参数
    aspect_ratio?: string;
    resolution?: string;
    // 向后兼容：完整提示词
    prompt?: string;
}

/**
 * 图像任务创建响应
 */
export interface ImageTaskResponse {
    task_id: string;
    status: string;
    created_at: string;
}

/**
 * 图像任务结果
 */
export interface ImageTaskResult {
    url?: string;
    oss_url?: string;
    width?: number;
    height?: number;
}

/**
 * 图像任务状态
 */
export type TaskStatus = 'queued' | 'running' | 'succeeded' | 'failed';

/**
 * 图像任务错误信息
 */
export interface TaskError {
    code: string;
    message: string;
}

/**
 * 图像任务详情
 */
export interface ImageTaskDetail {
    task_id: string;
    task_type: TaskType;
    status: TaskStatus;
    prompt: string;
    user_prompt?: string;
    selected_configs?: Record<string, string[]>;
    negative_prompt?: string;
    aspect_ratio: string;
    resolution: string;
    result?: {
        images?: ImageTaskResult[]
    };
    error?: TaskError;
    created_at: string;
    started_at?: string;
    finished_at?: string;
}

/**
 * 图像任务列表响应
 */
export interface ImageTaskListResponse {
    tasks: ImageTaskDetail[];
    total: number;
}

/**
 * 任务列表查询参数
 */
export interface TaskListParams {
    limit?: number;
    offset?: number;
    status?: string;
    task_type?: TaskType;
}
