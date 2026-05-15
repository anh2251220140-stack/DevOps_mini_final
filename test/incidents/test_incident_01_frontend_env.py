from __future__ import annotations


def test_local_stack_env_points_frontend_to_local_backend(
    frontend_env_values: dict[str, str], local_stack_expected: bool
) -> None:
    if not local_stack_expected:
        return

    assert (
        frontend_env_values.get("VITE_API_URL") == "http://localhost:3000/api"
    ), "Nếu test local full stack, Frontend/.env phải trỏ đến http://localhost:3000/api."
