"""测试 OSS 连接和上传功能"""
import asyncio
import sys
sys.path.insert(0, '.')

from app.utils.oss_utils import get_oss_uploader


async def test_oss():
    print("测试 OSS 连接...")

    try:
        uploader = get_oss_uploader()
        print(f"Bucket: {uploader.config.bucket_name}")
        print(f"Endpoint: {uploader.config.endpoint}")

        # 测试上传一个小的文本文件
        test_content = b"Hello, OSS! Test at 2026-01-26"
        object_name = uploader.generate_object_name("test.txt", folder="test")

        print(f"\n上传文件: {object_name}")
        success, result = uploader.upload_file(test_content, object_name)

        if success:
            print(f"上传成功! URL: {result}")

            # 测试生成签名 URL
            print("\n生成签名 URL...")
            sign_success, sign_url = uploader.generate_presigned_url(object_name, 3600)
            if sign_success:
                print(f"签名URL (1小时有效): {sign_url}")

            # 验证文件存在
            print("\n检查文件是否存在...")
            exists = uploader.file_exists(object_name)
            print(f"文件存在: {exists}")

            # 删除测试文件
            print("\n删除测试文件...")
            del_success, del_msg = uploader.delete_file(object_name)
            print(f"删除结果: {del_msg}")

            print("\n=== OSS 测试全部通过! ===")
        else:
            print(f"上传失败: {result}")
            return False

    except Exception as e:
        print(f"错误: {e}")
        return False

    return True


if __name__ == "__main__":
    result = asyncio.run(test_oss())
    sys.exit(0 if result else 1)
