import importlib.util
import os
import unittest
from pathlib import Path
from unittest.mock import patch

MODULE_PATH = Path(__file__).resolve().parents[1] / "scripts" / "drive_memory_sync.py"
SPEC = importlib.util.spec_from_file_location("drive_memory_sync", MODULE_PATH)
drive = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(drive)


class FakeRequest:
    def __init__(self, value):
        self.value = value

    def execute(self):
        return self.value


class FakeFiles:
    def __init__(self, folder):
        self.folder = folder

    def get(self, **_kwargs):
        return FakeRequest(self.folder)


class FakeService:
    def __init__(self, folder):
        self.folder = folder

    def files(self):
        return FakeFiles(self.folder)


class DriveMemorySyncTests(unittest.TestCase):
    def test_scope_is_least_privilege(self):
        self.assertEqual(
            drive.SCOPES, ["https://www.googleapis.com/auth/drive.file"]
        )

    def test_sha256_is_deterministic(self):
        self.assertEqual(
            drive.sha256_bytes(b"victor"),
            "99bde068af2d49ed7fc8b8fa79abe13a6059e0db320bb73459fd96624bb4b33f",
        )

    def test_required_env_fails_closed(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(RuntimeError):
                drive.required_env("GOOGLE_DRIVE_FOLDER_ID")

    def test_folder_validation_accepts_live_folder(self):
        folder = {
            "id": "folder-1",
            "name": "Victor Memory",
            "mimeType": "application/vnd.google-apps.folder",
            "trashed": False,
        }
        self.assertEqual(drive.validate_folder(FakeService(folder), "folder-1"), folder)

    def test_folder_validation_rejects_non_folder(self):
        item = {
            "id": "file-1",
            "name": "wrong",
            "mimeType": "text/plain",
            "trashed": False,
        }
        with self.assertRaises(RuntimeError):
            drive.validate_folder(FakeService(item), "file-1")


if __name__ == "__main__":
    unittest.main()
