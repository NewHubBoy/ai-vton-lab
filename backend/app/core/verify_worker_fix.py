import sys
import asyncio
from unittest.mock import MagicMock, patch
from pathlib import Path

# Setup path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# Mock dependencies
mock_tortoise = MagicMock()
sys.modules["tortoise"] = mock_tortoise
mock_tortoise_exceptions = MagicMock()
sys.modules["tortoise.exceptions"] = mock_tortoise_exceptions
mock_tortoise_exceptions.DoesNotExist = Exception
mock_tortoise_exceptions.IntegrityError = Exception
sys.modules["tortoise.fields"] = MagicMock()
sys.modules["app.core.ws_manager"] = MagicMock()
sys.modules["app.utils.oss_utils"] = MagicMock()
sys.modules["app.settings.config"] = MagicMock()

from app.core.image_worker import process_single_task, TaskType


async def test_worker_logic():
    print("Testing process_single_task logic...")

    # --- Test TRYON Task ---
    print("\n--- Testing TRYON Task ---")
    mock_task_tryon = MagicMock()
    mock_task_tryon.id = "tryon_id"
    mock_task_tryon.user_id = "user1"
    mock_task_tryon.prompt = "tryon prompt"
    mock_task_tryon.aspect_ratio = "1:1"
    mock_task_tryon.quality = "1K"
    mock_task_tryon.task_type = TaskType.TRYON
    mock_task_tryon.fetch_related = MagicMock(return_value=asyncio.Future())
    mock_task_tryon.fetch_related.return_value.set_result(None)
    mock_task_tryon.save = MagicMock(return_value=asyncio.Future())
    mock_task_tryon.save.return_value.set_result(None)

    # Mock data
    mock_tryon_data = MagicMock()
    mock_tryon_data.person_image = "http://example.com/person.jpg"
    mock_tryon_data.garment_image = "http://example.com/garment.jpg"
    mock_task_tryon.tryon = mock_tryon_data

    with patch("app.core.image_worker.generate_image") as mock_generate:
        mock_generate.return_value = {"status": "success", "generated_images": []}
        await process_single_task(mock_task_tryon)

        args = mock_generate.call_args.kwargs
        ref_images = args.get("reference_images", [])
        expected = ["http://example.com/person.jpg", "http://example.com/garment.jpg"]
        if sorted(ref_images) == sorted(expected):
            print("SUCCESS: Tryon images passed correctly")
        else:
            print(f"FAILED: Tryon expected {expected}, got {ref_images}")
            sys.exit(1)

    # --- Test DETAIL Task ---
    print("\n--- Testing DETAIL Task ---")
    mock_task_detail = MagicMock()
    mock_task_detail.id = "detail_id"
    mock_task_detail.user_id = "user1"
    mock_task_detail.prompt = "detail prompt"
    mock_task_detail.aspect_ratio = "1:1"
    mock_task_detail.quality = "1K"
    mock_task_detail.task_type = TaskType.DETAIL
    mock_task_detail.fetch_related = MagicMock(return_value=asyncio.Future())
    mock_task_detail.fetch_related.return_value.set_result(None)
    mock_task_detail.save = MagicMock(return_value=asyncio.Future())
    mock_task_detail.save.return_value.set_result(None)

    # Mock data
    mock_detail_data = MagicMock()
    mock_detail_data.input_image = "http://example.com/input.jpg"
    mock_task_detail.detail = mock_detail_data
    # Ensure tryon is None/not accessed
    mock_task_detail.tryon = None

    with patch("app.core.image_worker.generate_image") as mock_generate:
        mock_generate.return_value = {"status": "success", "generated_images": []}
        await process_single_task(mock_task_detail)

        args = mock_generate.call_args.kwargs
        ref_images = args.get("reference_images", [])
        expected = ["http://example.com/input.jpg"]
        if sorted(ref_images) == sorted(expected):
            print("SUCCESS: Detail images passed correctly")
        else:
            print(f"FAILED: Detail expected {expected}, got {ref_images}")
            sys.exit(1)


if __name__ == "__main__":
    asyncio.run(test_worker_logic())
