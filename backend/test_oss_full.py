"""完整测试 OSS 功能"""
import asyncio
import sys
sys.path.insert(0, '.')

from app.utils.oss_utils import get_oss_uploader


async def test_oss():
    print("=" * 50)
    print("OSS 完整测试")
    print("=" * 50)

    try:
        uploader = get_oss_uploader()
        print(f"\nBucket: {uploader.config.bucket_name}")
        print(f"Endpoint: {uploader.config.endpoint}")
        print(f"Base URL: {uploader.config.base_url}")

        # 1. 测试上传
        test_content = b"Hello, OSS Test! " + str(datetime.now()).encode()
        object_name = uploader.generate_object_name("test.txt", folder="test")

        print(f"\n1. 上传测试文件: {object_name}")
        success, result = uploader.upload_file(test_content, object_name)

        if success:
            print(f"   上传成功! URL: {result}")

            # 2. 验证文件存在
            print(f"\n2. 验证文件是否存在...")
            exists = uploader.file_exists(object_name)
            print(f"   文件存在: {exists}")

            if not exists:
                print("   错误: 文件上传后不存在!")
                return False

            # 3. 测试签名 URL
            print(f"\n3. 生成签名 URL (1小时有效)...")
            sign_success, sign_url = uploader.generate_presigned_url(object_name, 3600)
            if sign_success:
                print(f"   签名URL: {sign_url[:100]}...")
            else:
                print(f"   签名URL失败: {sign_url}")
                return False

            # 4. 删除测试文件
            print(f"\n4. 删除测试文件...")
            del_success, del_msg = uploader.delete_file(object_name)
            print(f"   删除结果: {del_msg}")

            print("\n" + "=" * 50)
            print("所有测试通过!")
            print("=" * 50)
        else:
            print(f"   上传失败: {result}")
            return False

    except Exception as e:
        import traceback
        print(f"\n错误: {e}")
        traceback.print_exc()
        return False

    return True


if __name__ == "__main__":
    from datetime import datetime
    result = asyncio.run(test_oss())
    sys.exit(0 if result else 1)
