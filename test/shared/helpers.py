from __future__ import annotations

from pathlib import Path
import os

import pytest
import requests


ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_ENV_PATH = ROOT_DIR / "Backend" / ".env"
FRONTEND_ENV_PATH = ROOT_DIR / "Frontend" / ".env"


def parse_env_file(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}

    values: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip("'\"")

    return values


def env_or_default(name: str, default: str) -> str:
    return os.getenv(name, default).rstrip("/")


def request_or_fail(method: str, url: str, **kwargs) -> requests.Response:
    timeout = kwargs.pop("timeout", 8)

    try:
        response = requests.request(method, url, timeout=timeout, **kwargs)
    except requests.RequestException as exc:
        pytest.fail(
            f"Không thể gọi {url}. Hãy chạy 'npm run dev' ở root repo trước. Chi tiết: {exc}"
        )

    return response


def assert_json_list(payload, endpoint_name: str) -> None:
    assert isinstance(
        payload, list
    ), f"{endpoint_name} phải trả về JSON list để Frontend map được dữ liệu."
