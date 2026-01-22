/**
 * 图像生成任务请求参数
 */
export interface ImageTaskRequest {
    prompt: string;
    reference_images?: string[];
    aspect_ratio?: string;
    resolution?: string;
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
    status: TaskStatus;
    prompt: string;
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
}
