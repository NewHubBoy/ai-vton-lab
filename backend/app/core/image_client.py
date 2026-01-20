#!/usr/bin/env python3
"""
Image Client - 基于 Google Gen SDK 的图像生成客户端

支持参数:
    - prompt: 提示词
    - reference_image: 参考图片路径
    - aspect_ratio: 宽高比 ("1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9", "6:9")
    - resolution: 分辨率 ("1K", "2K", "4K")

Batch API:
    - 50% 价格，24小时内完成
    - 适合离线批量处理
"""

import json
import os
import sys
import time
from pathlib import Path
from typing import Optional, Dict, Any, List
from enum import Enum
import uuid

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("Error: google-genai package not installed")
    print("Install with: pip install google-genai")
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


class AspectRatio(str, Enum):
    """支持的宽高比"""

    RATIO_1_1 = "1:1"
    RATIO_2_3 = "2:3"
    RATIO_3_2 = "3:2"
    RATIO_3_4 = "3:4"
    RATIO_4_3 = "4:3"
    RATIO_4_5 = "4:5"
    RATIO_5_4 = "5:4"
    RATIO_9_16 = "9:16"
    RATIO_16_9 = "16:9"
    RATIO_21_9 = "21:9"
    RATIO_6_9 = "6:9"

    @classmethod
    def values(cls) -> List[str]:
        return [e.value for e in cls]


class Resolution(str, Enum):
    """支持的分辨率"""

    RES_1K = "1K"
    RES_2K = "2K"
    RES_4K = "4K"

    @classmethod
    def values(cls) -> List[str]:
        return [e.value for e in cls]


# 分辨率到像素尺寸的映射
RESOLUTION_MAP = {
    "1K": {"width": 1024, "height": 1024},
    "2K": {"width": 2048, "height": 2048},
    "4K": {"width": 4096, "height": 4096},
}

# 宽高比到像素尺寸的映射（基于 1024px 基准）
ASPECT_RATIO_MAP = {
    "1:1": {"width": 1024, "height": 1024},
    "2:3": {"width": 680, "height": 1024},
    "3:2": {"width": 1024, "height": 680},
    "3:4": {"width": 768, "height": 1024},
    "4:3": {"width": 1024, "height": 768},
    "4:5": {"width": 819, "height": 1024},
    "5:4": {"width": 1024, "height": 819},
    "9:16": {"width": 576, "height": 1024},
    "16:9": {"width": 1024, "height": 576},
    "21:9": {"width": 1234, "height": 532},
    "6:9": {"width": 1024, "height": 768},
}


def load_dotenv_files() -> bool:
    """加载所有可能的 .env 文件"""
    if not load_dotenv:
        return False

    script_dir = Path(__file__).parent
    for env_file in [
        script_dir / ".env",
        script_dir.parent / ".env",
        script_dir.parent.parent / ".env",  # backend/.env
        Path(".claude") / ".env",
        Path(__file__).parent.parent.parent.parent / ".env",  # 项目根目录/.env
    ]:
        if env_file.exists():
            load_dotenv(env_file)
    return True


def find_api_key() -> Optional[str]:
    """查找 Gemini API key"""
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        return api_key

    load_dotenv_files()
    return os.getenv("GEMINI_API_KEY")


def find_model() -> str:
    """查找 Gemini 模型名称，默认 gemini-2.5-flash"""
    load_dotenv_files()
    return os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def is_development() -> bool:
    """判断是否是开发环境"""
    env = os.getenv("ENV", "").lower()
    return env in ("dev", "development", "")


def is_verbose_default() -> bool:
    """开发环境 verbose 默认 true"""
    return is_development()


def get_mime_type(file_path: str) -> str:
    """获取文件的 MIME 类型"""
    ext = Path(file_path).suffix.lower()
    mime_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".heic": "image/heic",
        ".heif": "image/heif",
    }
    return mime_types.get(ext, "application/octet-stream")


class BatchImageClient:
    """Gemini Batch API 图像生成客户端（50% 价格，24小时内完成）"""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """初始化客户端

        Args:
            api_key: Gemini API key，如果未提供则自动查找
            model: 模型名称，如果未提供则从环境变量读取
        """
        self.api_key = api_key or find_api_key()
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found. Set via environment variable or .env file.")
        self.client = genai.Client(api_key=self.api_key)
        self.model = model or find_model()

    def _get_output_dir(self) -> Path:
        """获取输出目录"""
        script_dir = Path(__file__).parent
        project_root = script_dir
        for parent in [script_dir] + list(script_dir.parents):
            if (parent / ".git").exists() or (parent / ".claude").exists():
                project_root = parent
                break
        output_dir = project_root / "docs" / "assets"
        output_dir.mkdir(parents=True, exist_ok=True)
        return output_dir

    def _build_request_item(
        self,
        prompt: str,
        task_index: int,
        aspect_ratio: str = "1:1",
        resolution: str = "1K",
    ) -> Dict[str, Any]:
        """构建单个请求项（JSONL 格式）"""
        return {
            "id": f"task_{task_index}",
            "request": {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "responseModalities": ["Image"],
                    "imageConfig": {
                        "aspectRatio": aspect_ratio,
                    },
                },
            },
        }

    def create_batch_job(
        self,
        prompts: List[str],
        aspect_ratio: str = "1:1",
        resolution: str = "1K",
        verbose: bool = False,
    ) -> Dict[str, Any]:
        """创建批量任务

        Args:
            prompts: 提示词列表
            aspect_ratio: 宽高比
            resolution: 分辨率
            verbose: 是否显示详细信息

        Returns:
            包含 batch_name 和任务信息的字典
        """
        # 构建请求项
        requests = []
        for i, prompt in enumerate(prompts):
            requests.append(self._build_request_item(prompt, i, aspect_ratio, resolution))

        # 创建临时输入文件
        input_file = Path("/tmp") / f"batch_input_{uuid.uuid4().hex[:8]}.jsonl"
        with open(input_file, "w", encoding="utf-8") as f:
            for req in requests:
                f.write(json.dumps(req, ensure_ascii=False) + "\n")

        try:
            # 调用 Batch API
            batch_job = self.client.models.batch_create_content(
                model=self.model,
                requests=requests,
            )

            result = {
                "status": "success",
                "batch_name": batch_job.name,
                "input_file": str(input_file),
                "task_count": len(prompts),
            }

            if verbose:
                print(f"Batch job created: {batch_job.name}")
                print(f"Task count: {len(prompts)}")

            return result

        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
            }

    def get_batch_job_status(self, batch_name: str) -> Dict[str, Any]:
        """获取批量任务状态

        Args:
            batch_name: 批量任务名称（如 projects/.../locations/.../batchJobs/xxx）

        Returns:
            包含状态信息的字典
        """
        try:
            batch_job = self.client.models.batch_create_content(name=batch_name)
            return {
                "status": batch_job.state.name if hasattr(batch_job.state, "name") else str(batch_job.state),
                "state": str(batch_job.state),
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
            }

    def list_batch_jobs(self, page_size: int = 10) -> Dict[str, Any]:
        """列出批量任务

        Args:
            page_size: 返回数量

        Returns:
            包含任务列表的字典
        """
        try:
            # 使用 projects.locations.batchJobs.list
            # 注意：需要指定 location
            parent = f"projects/{self.api_key}/locations/-"
            jobs = self.client.models.batch_create_content.list(parent=parent)
            return {
                "status": "success",
                "jobs": jobs,
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
            }

    def get_batch_results(self, batch_name: str, output_dir: Optional[Path] = None) -> Dict[str, Any]:
        """获取批量任务结果

        Args:
            batch_name: 批量任务名称
            output_dir: 输出目录

        Returns:
            包含结果的字典
        """
        try:
            output_dir = output_dir or self._get_output_dir()
            output_dir.mkdir(parents=True, exist_ok=True)

            # 下载结果文件
            batch_job = self.client.models.batch_create_content(name=batch_name)

            results = {
                "status": "success",
                "batch_name": batch_name,
                "results": [],
            }

            # 获取结果
            if hasattr(batch_job, "results") and batch_job.results:
                for i, result in enumerate(batch_job.results):
                    result_item = {
                        "task_index": i,
                        "status": "success",
                        "images": [],
                    }

                    # 处理生成的图像
                    if hasattr(result, "response"):
                        for part in result.response.candidates[0].content.parts:
                            if part.inline_data:
                                output_file = output_dir / f"batch_{batch_name.split('/')[-1]}_{i}.png"
                                with open(output_file, "wb") as f:
                                    f.write(part.inline_data.data)
                                result_item["images"].append(str(output_file))

                    results["results"].append(result_item)

            return results

        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "batch_name": batch_name,
            }

    def wait_for_completion(self, batch_name: str, poll_interval: int = 60, timeout: int = 86400) -> Dict[str, Any]:
        """等待批量任务完成（最多24小时）

        Args:
            batch_name: 批量任务名称
            poll_interval: 轮询间隔（秒）
            timeout: 超时时间（秒）

        Returns:
            包含最终状态的字典
        """
        start_time = time.time()

        while time.time() - start_time < timeout:
            status = self.get_batch_job_status(batch_name)
            state = status.get("state", "").upper()

            if state == "SUCCEEDED":
                return {"status": "success", "state": state, "batch_name": batch_name}
            elif state in ["FAILED", "CANCELLED"]:
                return {"status": "error", "state": state, "error": "Batch job failed or was cancelled"}

            print(f"Batch job state: {state}, waiting...")
            time.sleep(poll_interval)

        return {"status": "error", "error": "Timeout waiting for batch job", "timeout": timeout}


class ImageClient:
    """Google Gen SDK 图像生成客户端"""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """初始化客户端

        Args:
            api_key: Gemini API key，如果未提供则自动查找
            model: 模型名称，如果未提供则从环境变量读取
        """
        self.api_key = api_key or find_api_key()
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found. " "Set via environment variable or .env file.")
        self.client = genai.Client(api_key=self.api_key)
        self.model = model or find_model()

    def _get_output_dir(self) -> Path:
        """获取输出目录"""
        script_dir = Path(__file__).parent
        project_root = script_dir
        for parent in [script_dir] + list(script_dir.parents):
            if (parent / ".git").exists() or (parent / ".claude").exists():
                project_root = parent
                break
        output_dir = project_root / "docs" / "assets"
        output_dir.mkdir(parents=True, exist_ok=True)
        return output_dir

    def _read_image_bytes(self, image_path: str) -> bytes:
        """读取图片文件字节"""
        with open(image_path, "rb") as f:
            return f.read()

    def generate(
        self,
        prompt: str,
        reference_images: Optional[List[str]] = None,
        aspect_ratio: str = "1:1",
        resolution: str = "1K",
        output_filename: Optional[str] = None,
        model: Optional[str] = None,
        verbose: Optional[bool] = None,
    ) -> Dict[str, Any]:
        """生成图像

        Args:
            prompt: 图像描述提示词
            reference_images: 参考图片路径列表（可选）
            aspect_ratio: 宽高比，默认为 "1:1"
            resolution: 分辨率，默认为 "1K"
            output_filename: 输出文件名（不含扩展名）
            model: 使用的模型，默认使用初始化时的模型（从 GEMINI_MODEL 环境变量读取）
            verbose: 是否显示详细信息，开发环境默认为 true

        Returns:
            包含生成结果的字典

        Raises:
            ValueError: 参数无效时抛出
        """
        # 使用实例的默认模型
        model = model or self.model
        # 开发环境默认启用 verbose
        verbose = verbose if verbose is not None else is_verbose_default()

        # 验证参数
        if aspect_ratio not in AspectRatio.values():
            raise ValueError(f"Invalid aspect_ratio: {aspect_ratio}. " f"Must be one of: {AspectRatio.values()}")
        if resolution not in Resolution.values():
            raise ValueError(f"Invalid resolution: {resolution}. " f"Must be one of: {Resolution.values()}")

        # 构建内容
        contents: List[Any] = [prompt]

        # 如果有参考图片，添加到内容中
        if reference_images:
            for image_path in reference_images:
                path = Path(image_path)
                if not path.exists():
                    raise ValueError(f"Reference image not found: {image_path}")

                file_bytes = self._read_image_bytes(str(path))
                mime_type = get_mime_type(str(path))
                contents.append(types.Part.from_bytes(data=file_bytes, mime_type=mime_type))

        # 构建配置
        config_args = {
            "response_modalities": ["Image"],
        }

        config_args["image_config"] = types.ImageConfig(
            aspect_ratio=aspect_ratio,
        )

        config = types.GenerateContentConfig(**config_args)

        if verbose:
            print(f"Generating image with:")
            print(f"  Prompt: {prompt[:100]}...")
            print(f"  Aspect Ratio: {aspect_ratio}")
            print(f"  Resolution: {resolution}")
            print(f"  Model: {model}")

        try:
            response = self.client.models.generate_content(
                model=model,
                contents=contents,
                config=config,
            )

            result = {
                "status": "success",
                "prompt": prompt,
                "aspect_ratio": aspect_ratio,
                "resolution": resolution,
                "model": model,
                "response": response.text if hasattr(response, "text") else None,
                "generated_images": [],
            }

            # 处理生成的图像
            if hasattr(response, "candidates"):
                output_dir = self._get_output_dir()
                filename = output_filename or f"generated_{aspect_ratio.replace(':', '-')}_{resolution}"

                for i, part in enumerate(response.candidates[0].content.parts):
                    if part.inline_data:
                        output_file = output_dir / f"{filename}_{i}.png"
                        with open(output_file, "wb") as f:
                            f.write(part.inline_data.data)
                        result["generated_images"].append(str(output_file))

                        if verbose:
                            print(f"  Saved: {output_file}")

            return result

        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "prompt": prompt,
                "aspect_ratio": aspect_ratio,
                "resolution": resolution,
            }


def generate_image(
    prompt: str,
    reference_images: Optional[List[str]] = None,
    aspect_ratio: str = "1:1",
    resolution: str = "1K",
    output_filename: Optional[str] = None,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    verbose: Optional[bool] = None,
) -> Dict[str, Any]:
    """便捷函数：生成图像

    Args:
        prompt: 图像描述提示词
        reference_images: 参考图片路径列表（可选）
        aspect_ratio: 宽高比，默认为 "1:1"
        resolution: 分辨率，默认为 "1K"
        output_filename: 输出文件名（不含扩展名）
        api_key: Gemini API key
        model: 使用的模型，默认从 GEMINI_MODEL 环境变量读取
        verbose: 是否显示详细信息，开发环境默认为 true

    Returns:
        包含生成结果的字典
    """
    client = ImageClient(api_key=api_key, model=model)
    return client.generate(
        prompt=prompt,
        reference_images=reference_images,
        aspect_ratio=aspect_ratio,
        resolution=resolution,
        output_filename=output_filename,
        verbose=verbose,
    )


def create_batch_job(
    prompts: List[str],
    aspect_ratio: str = "1:1",
    resolution: str = "1K",
    api_key: Optional[str] = None,
    verbose: bool = False,
) -> Dict[str, Any]:
    """便捷函数：创建批量图像生成任务

    Args:
        prompts: 提示词列表
        aspect_ratio: 宽高比
        resolution: 分辨率
        api_key: Gemini API key
        verbose: 是否显示详细信息

    Returns:
        包含 batch_name 的字典
    """
    client = BatchImageClient(api_key=api_key)
    return client.create_batch_job(prompts, aspect_ratio, resolution, verbose)


def get_batch_job_status(
    batch_name: str,
    api_key: Optional[str] = None,
) -> Dict[str, Any]:
    """便捷函数：获取批量任务状态

    Args:
        batch_name: 批量任务名称
        api_key: Gemini API key

    Returns:
        包含状态的字典
    """
    client = BatchImageClient(api_key=api_key)
    return client.get_batch_job_status(batch_name)


def get_batch_results(
    batch_name: str,
    api_key: Optional[str] = None,
) -> Dict[str, Any]:
    """便捷函数：获取批量任务结果

    Args:
        batch_name: 批量任务名称
        api_key: Gemini API key

    Returns:
        包含结果的字典
    """
    client = BatchImageClient(api_key=api_key)
    return client.get_batch_results(batch_name)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="使用 Google Gen SDK 生成图像",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 基本使用
  python image_client.py --prompt "一只在草地上奔跑的猫"

  # 指定宽高比和分辨率
  python image_client.py --prompt "海岛日落" --aspect-ratio 16:9 --resolution 2K

  # 使用单张参考图片
  python image_client.py --prompt "类似风格" --reference-image photo.jpg

  # 使用多张参考图片
  python image_client.py --prompt "结合两图风格" \
    --reference-image photo1.jpg --reference-image photo2.jpg

支持的宽高比: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
支持分辨率: 1K, 2K, 4K
        """,
    )

    parser.add_argument("--prompt", required=True, help="图像描述提示词")
    parser.add_argument(
        "--reference-image", dest="reference_images", action="append", help="参考图片路径（可多次使用添加多张图片）"
    )
    parser.add_argument("--aspect-ratio", default="1:1", choices=AspectRatio.values(), help="宽高比 (默认: 1:1)")
    parser.add_argument("--resolution", default="1K", choices=Resolution.values(), help="分辨率 (默认: 1K)")
    parser.add_argument("--output", dest="output_filename", help="输出文件名（不含扩展名）")
    parser.add_argument("--model", default=None, help=f"使用的模型 (默认: 从 GEMINI_MODEL 环境变量读取，当前: {find_model()})")
    parser.add_argument(
        "--verbose", "-v", dest="verbose", default=None, action="store_true", help="显示详细信息 (开发环境默认启用)"
    )
    parser.add_argument(
        "--quiet", "-q", dest="verbose", action="store_false", help="静默模式 (禁用 verbose)"
    )
    parser.add_argument("--dry-run", action="store_true", help="模拟运行，不调用 API")

    args = parser.parse_args()
    # 开发环境默认启用 verbose
    if args.verbose is None:
        args.verbose = is_verbose_default()

    if args.dry_run:
        print("DRY RUN MODE")
        print(f"Prompt: {args.prompt}")
        print(f"Reference Images: {args.reference_images}")
        print(f"Aspect Ratio: {args.aspect_ratio}")
        print(f"Resolution: {args.resolution}")
        print(f"Model: {args.model}")
        sys.exit(0)

    result = generate_image(
        prompt=args.prompt,
        reference_images=args.reference_images,
        aspect_ratio=args.aspect_ratio,
        resolution=args.resolution,
        output_filename=args.output_filename,
        model=args.model,
        verbose=args.verbose,
    )

    if result["status"] == "success":
        print(f"\n生成成功!")
        print(f"生成图像: {result['generated_images']}")
    else:
        print(f"\n生成失败: {result.get('error', 'Unknown error')}")
        sys.exit(1)
