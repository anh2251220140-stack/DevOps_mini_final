from __future__ import annotations

from test.shared.helpers import request_or_fail


def test_local_stack_env_points_backend_to_local_frontend(
    backend_env_values: dict[str, str], local_stack_expected: bool
) -> None:
    if not local_stack_expected:
        return

    assert (
        backend_env_values.get("CORS_ORIGIN") == "http://localhost:5173"
    ), "Local full stack expects Backend/.env CORS_ORIGIN=http://localhost:5173."


def test_backend_cors_header_matches_frontend_origin(
    api_base_url: str, frontend_origin: str
) -> None:
    response = request_or_fail(
        "OPTIONS",
        f"{api_base_url}/transactions",
        headers={"Origin": frontend_origin},
    )

    assert response.status_code in {200, 204}, response.text
    assert response.headers.get("Access-Control-Allow-Origin") == frontend_origin


def test_backend_cors_allows_vercel_preview_origin(api_base_url: str) -> None:
    vercel_origin = "https://preview-example.vercel.app"
    response = request_or_fail(
        "OPTIONS",
        f"{api_base_url}/transactions",
        headers={"Origin": vercel_origin},
    )

    assert response.status_code in {200, 204}, response.text
    assert response.headers.get("Access-Control-Allow-Origin") == vercel_origin
