from __future__ import annotations

import os

import pytest

from test.shared.helpers import (
    BACKEND_ENV_PATH,
    FRONTEND_ENV_PATH,
    env_or_default,
    parse_env_file,
)


@pytest.fixture(scope="session")
def backend_env_values() -> dict[str, str]:
    return parse_env_file(BACKEND_ENV_PATH)


@pytest.fixture(scope="session")
def frontend_env_values() -> dict[str, str]:
    return parse_env_file(FRONTEND_ENV_PATH)


@pytest.fixture(scope="session")
def backend_base_url() -> str:
    return env_or_default("TEST_BACKEND_BASE_URL", "http://localhost:3000")


@pytest.fixture(scope="session")
def frontend_base_url() -> str:
    return env_or_default("TEST_FRONTEND_BASE_URL", "http://localhost:5173")


@pytest.fixture(scope="session")
def frontend_origin() -> str:
    return env_or_default("TEST_FRONTEND_ORIGIN", "http://localhost:5173")


@pytest.fixture(scope="session")
def api_base_url(backend_base_url: str) -> str:
    return f"{backend_base_url}/api"


@pytest.fixture(scope="session")
def local_stack_expected() -> bool:
    raw_value = os.getenv("TEST_EXPECT_LOCAL_STACK", "1").strip().lower()
    return raw_value not in {"0", "false", "no"}
