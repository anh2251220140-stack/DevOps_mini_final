from __future__ import annotations

from test.shared.helpers import request_or_fail


def test_frontend_homepage_is_reachable(frontend_base_url: str) -> None:
    response = request_or_fail("GET", frontend_base_url)

    assert (
        response.status_code == 200
    ), f"Frontend phải mở được ở {frontend_base_url}, nhưng đang trả về {response.status_code}."
    assert (
        '<div id="root"></div>' in response.text
    ), "Frontend không trả về app shell của Vite/React."


def test_frontend_page_references_javascript_bundle(frontend_base_url: str) -> None:
    response = request_or_fail("GET", frontend_base_url)

    assert (
        'src="/src/main.jsx' in response.text or "assets/index-" in response.text
    ), "Frontend không nạp main entrypoint, trang có thể đang bị hỏng."
