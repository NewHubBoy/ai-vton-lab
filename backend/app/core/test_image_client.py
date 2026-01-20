#!/usr/bin/env python3
"""测试 image_client.py"""

import sys
import tempfile
import os
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# 添加 app 目录到路径，以便导入 core 模块
app_dir = project_root / "backend" / "app"
sys.path.insert(0, str(app_dir))

import unittest
from unittest.mock import patch, MagicMock
from image_client import (
    ImageClient,
    generate_image,
    AspectRatio,
    Resolution,
    ASPECT_RATIO_MAP,
    RESOLUTION_MAP,
)


class TestAspectRatioEnum(unittest.TestCase):
    """测试 AspectRatio 枚举"""

    def test_all_values(self):
        expected = ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"]
        self.assertEqual(AspectRatio.values(), expected)

    def test_enum_values_exist(self):
        for ratio in ["1:1", "16:9", "9:16", "21:9"]:
            self.assertIn(ratio, AspectRatio.values())


class TestResolutionEnum(unittest.TestCase):
    """测试 Resolution 枚举"""

    def test_all_values(self):
        expected = ["1K", "2K", "4K"]
        self.assertEqual(Resolution.values(), expected)


class TestAspectRatioMap(unittest.TestCase):
    """测试宽高比映射"""

    def test_map_contains_all_ratios(self):
        for ratio in AspectRatio.values():
            self.assertIn(ratio, ASPECT_RATIO_MAP)

    def test_dimensions_are_positive(self):
        for ratio, dims in ASPECT_RATIO_MAP.items():
            self.assertGreater(dims["width"], 0, f"{ratio} width must be positive")
            self.assertGreater(dims["height"], 0, f"{ratio} height must be positive")


class TestResolutionMap(unittest.TestCase):
    """测试分辨率映射"""

    def test_map_contains_all_resolutions(self):
        for res in Resolution.values():
            self.assertIn(res, RESOLUTION_MAP)

    def test_dimensions_are_positive(self):
        for res, dims in RESOLUTION_MAP.items():
            self.assertGreater(dims["width"], 0, f"{res} width must be positive")
            self.assertGreater(dims["height"], 0, f"{res} height must be positive")


class TestImageClientInit(unittest.TestCase):
    """测试 ImageClient 初始化"""

    @patch('image_client.find_api_key')
    def test_init_with_api_key(self, mock_find_key):
        mock_find_key.return_value = "test_api_key"
        client = ImageClient(api_key="test_api_key")
        self.assertIsNotNone(client.client)
        self.assertEqual(client.api_key, "test_api_key")

    @patch('image_client.find_api_key')
    def test_init_without_api_key_raises(self, mock_find_key):
        mock_find_key.return_value = None
        with self.assertRaises(ValueError) as context:
            ImageClient()
        self.assertIn("GEMINI_API_KEY not found", str(context.exception))


class TestGenerateImageFunction(unittest.TestCase):
    """测试 generate_image 便捷函数"""

    @patch('image_client.ImageClient')
    def test_generate_calls_client(self, mock_client_class):
        mock_client = MagicMock()
        mock_client.generate.return_value = {"status": "success", "generated_images": []}
        mock_client_class.return_value = mock_client

        result = generate_image(
            prompt="test prompt",
            aspect_ratio="16:9",
            resolution="2K",
        )

        mock_client_class.assert_called_once()
        mock_client.generate.assert_called_once_with(
            prompt="test prompt",
            reference_images=None,
            aspect_ratio="16:9",
            resolution="2K",
            output_filename=None,
            model="gemini-2.5-flash",
            verbose=False,
        )
        self.assertEqual(result["status"], "success")

    @patch('image_client.ImageClient')
    def test_generate_with_single_reference_image(self, mock_client_class):
        mock_client = MagicMock()
        mock_client.generate.return_value = {"status": "success", "generated_images": []}
        mock_client_class.return_value = mock_client

        result = generate_image(
            prompt="test prompt",
            reference_images=["/path/to/image.jpg"],
            aspect_ratio="1:1",
            resolution="1K",
        )

        call_kwargs = mock_client.generate.call_args[1]
        self.assertEqual(call_kwargs["reference_images"], ["/path/to/image.jpg"])

    @patch('image_client.ImageClient')
    def test_generate_with_multiple_reference_images(self, mock_client_class):
        mock_client = MagicMock()
        mock_client.generate.return_value = {"status": "success", "generated_images": []}
        mock_client_class.return_value = mock_client

        result = generate_image(
            prompt="test prompt",
            reference_images=["/path/to/image1.jpg", "/path/to/image2.jpg"],
            aspect_ratio="1:1",
            resolution="1K",
        )

        call_kwargs = mock_client.generate.call_args[1]
        self.assertEqual(
            call_kwargs["reference_images"],
            ["/path/to/image1.jpg", "/path/to/image2.jpg"]
        )


class TestParameterValidation(unittest.TestCase):
    """测试参数验证"""

    @patch('image_client.find_api_key')
    def test_invalid_aspect_ratio_raises(self, mock_find_key):
        mock_find_key.return_value = "test_key"
        client = ImageClient(api_key="test_key")

        with self.assertRaises(ValueError) as context:
            client.generate(prompt="test", aspect_ratio="invalid")
        self.assertIn("Invalid aspect_ratio", str(context.exception))

    @patch('image_client.find_api_key')
    def test_invalid_resolution_raises(self, mock_find_key):
        mock_find_key.return_value = "test_key"
        client = ImageClient(api_key="test_key")

        with self.assertRaises(ValueError) as context:
            client.generate(prompt="test", resolution="8K")
        self.assertIn("Invalid resolution", str(context.exception))

    @patch('image_client.find_api_key')
    def test_missing_reference_image_raises(self, mock_find_key):
        mock_find_key.return_value = "test_key"
        client = ImageClient(api_key="test_key")

        with self.assertRaises(ValueError) as context:
            client.generate(prompt="test", reference_images=["/nonexistent/image.jpg"])
        self.assertIn("Reference image not found", str(context.exception))


class TestMimeType(unittest.TestCase):
    """测试 MIME 类型检测"""

    def test_jpeg_mime_type(self):
        from image_client import get_mime_type
        self.assertEqual(get_mime_type("test.jpg"), "image/jpeg")
        self.assertEqual(get_mime_type("test.jpeg"), "image/jpeg")

    def test_png_mime_type(self):
        from image_client import get_mime_type
        self.assertEqual(get_mime_type("test.png"), "image/png")

    def test_webp_mime_type(self):
        from image_client import get_mime_type
        self.assertEqual(get_mime_type("test.webp"), "image/webp")

    def test_unknown_mime_type(self):
        from image_client import get_mime_type
        self.assertEqual(get_mime_type("test.xyz"), "application/octet-stream")


class TestApiKeyFinder(unittest.TestCase):
    """测试 API key 查找"""

    @patch.dict('os.environ', {'GEMINI_API_KEY': 'env_api_key'})
    def test_finds_env_variable(self):
        from image_client import find_api_key
        # Clear any cached value
        import importlib
        import image_client
        importlib.reload(image_client)
        result = image_client.find_api_key()
        self.assertEqual(result, 'env_api_key')


class TestIntegrationMock(unittest.TestCase):
    """集成测试（Mock 模式）"""

    @patch('image_client.find_api_key')
    @patch('image_client.genai.Client')
    def test_full_generation_flow(self, mock_client_class, mock_find_key):
        """测试完整的生成流程"""
        mock_find_key.return_value = "test_api_key"

        # Mock response
        mock_response = MagicMock()
        mock_response.text = "Generated image"
        mock_candidate = MagicMock()
        mock_part = MagicMock()
        mock_inline_data = MagicMock()
        mock_inline_data.data = b"fake_image_data"
        mock_part.inline_data = mock_inline_data
        mock_candidate.content.parts = [mock_part]
        mock_response.candidates = [mock_candidate]

        mock_client = MagicMock()
        mock_client.models.generate_content.return_value = mock_response
        mock_client_class.return_value = mock_client

        client = ImageClient(api_key="test_api_key")
        result = client.generate(
            prompt="A beautiful sunset",
            aspect_ratio="16:9",
            resolution="2K",
        )

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["prompt"], "A beautiful sunset")
        self.assertEqual(result["aspect_ratio"], "16:9")
        self.assertEqual(result["resolution"], "2K")

    @patch('image_client.find_api_key')
    @patch('image_client.genai.Client')
    def test_generation_with_multiple_reference_images(self, mock_client_class, mock_find_key):
        """测试使用多张参考图片生成"""
        mock_find_key.return_value = "test_api_key"

        # Create temp image files
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as f1:
            f1.write(b'fake_image_data_1')
            temp_path1 = f1.name

        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as f2:
            f2.write(b'fake_image_data_2')
            temp_path2 = f2.name

        try:
            # Mock response
            mock_response = MagicMock()
            mock_response.text = "Generated image"
            mock_candidate = MagicMock()
            mock_part = MagicMock()
            mock_inline_data = MagicMock()
            mock_inline_data.data = b'fake_image_data'
            mock_part.inline_data = mock_inline_data
            mock_candidate.content.parts = [mock_part]
            mock_response.candidates = [mock_candidate]

            mock_client = MagicMock()
            mock_client.models.generate_content.return_value = mock_response
            mock_client_class.return_value = mock_client

            client = ImageClient(api_key="test_api_key")
            result = client.generate(
                prompt="Combine styles from both images",
                reference_images=[temp_path1, temp_path2],
                aspect_ratio="1:1",
                resolution="1K",
            )

            self.assertEqual(result["status"], "success")

            # Verify generate_content was called with both images
            call_args = mock_client.models.generate_content.call_args
            contents = call_args.kwargs.get('contents', call_args[1].get('contents', []))
            # Should have: prompt + 2 image parts
            self.assertEqual(len(contents), 3)

        finally:
            # Cleanup temp files
            os.unlink(temp_path1)
            os.unlink(temp_path2)


if __name__ == '__main__':
    unittest.main(verbosity=2)
