from __future__ import annotations

from test.shared.helpers import request_or_fail


def test_backend_health_endpoint_is_reachable(api_base_url: str) -> None:
    response = request_or_fail("GET", f"{api_base_url}/health")

    assert (
        response.status_code == 200
    ), f"/api/health phải trả 200, nhưng hiện tại là {response.status_code}."


def test_backend_health_payload_has_expected_shape(api_base_url: str) -> None:
    response = request_or_fail("GET", f"{api_base_url}/health")
    payload = response.json()

    assert payload.get("status") == "ok", "Health payload phải có status='ok'."
    assert payload.get("service") == "expense-manager-backend", "Sai tên service trong health."
    assert isinstance(payload.get("timestamp"), str), "Health payload thiếu timestamp."

    supabase = payload.get("supabase")
    assert isinstance(supabase, dict), "Health payload thiếu object supabase."
    assert isinstance(
        supabase.get("configured"), bool
    ), "supabase.configured phải là boolean."
    assert isinstance(
        supabase.get("connected"), bool
    ), "supabase.connected phải là boolean."
