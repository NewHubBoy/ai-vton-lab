/**
 * 任务类型枚举
 */
export enum TaskType {
    TRYON = 'tryon',
    MODEL = 'model',
    DETAIL = 'detail',
}

/**
 * 任务状态枚举
 */
export enum TaskStatus {
    QUEUED = 'queued',
    PROCESSING = 'processing',
    SUCCEEDED = 'succeeded',
    FAILED = 'failed',
}

/**
 * 试穿参数
 */
export interface TaskTryonParams {
    person_image: string;
    garment_image: string;
    category: string;
    seed?: number;
    mask_image?: string;
}

/**
 * 详情页参数
 */
export interface TaskDetailParams {
    input_image: string;
    template_id: string;
    extra_options?: Record<string, any>;
}

/**
 * 模特生成参数
 */
export interface TaskModelParams {
    base_model?: string;
    lora_config?: Record<string, any>;
    num_inference_steps?: number;
    guidance_scale?: number;
}

/**
 * 创建任务请求
 */
export interface CreateTaskRequest {
    task_type: TaskType;
    prompt?: string;
    aspect_ratio?: string;
    quality?: string;
    platform?: string;

    tryon?: TaskTryonParams;
    detail?: TaskDetailParams;
    model?: TaskModelParams;
}

/**
 * 任务响应 (通用)
 */
export interface GenerationTask {
    id: string;
    user_id: string;
    username?: string;
    task_type: TaskType;
    status: TaskStatus;

    prompt?: string;
    aspect_ratio?: string;
    quality?: string;

    result?: {
        images?: string[];
        local_paths?: string[];
    };
    error?: {
        code: string;
        message: string;
    };

    tryon?: TaskTryonParams;
    detail?: TaskDetailParams;
    model?: TaskModelParams;

    created_at: string;
    started_at?: string;
    finished_at?: string;
}

/**
 * 任务列表响应
 */
export interface TaskListResponse {
    data: GenerationTask[];
    total: number;
    page: number;
    page_size: number;
}

/**
 * 任务列表查询参数
 */
export interface TaskListParams {
    page?: number;
    page_size?: number;
    task_type?: string;
    status?: string;
}
