from __future__ import annotations

from test.shared.helpers import request_or_fail


def test_invalid_transaction_missing_title_returns_400(api_base_url: str) -> None:
    response = request_or_fail(
        "POST",
        f"{api_base_url}/transactions",
        json={
            "title": "",
            "amount": 1000,
            "category": "Khac",
            "date": "2026-05-08",
        },
    )

    assert response.status_code == 400, response.text


def test_invalid_transaction_amount_returns_400(api_base_url: str) -> None:
    response = request_or_fail(
        "POST",
        f"{api_base_url}/transactions",
        json={
            "title": "Test amount invalid",
            "amount": 0,
            "category": "Khac",
            "date": "2026-05-08",
        },
    )

    assert response.status_code == 400, response.text


def test_invalid_transaction_date_returns_400(api_base_url: str) -> None:
    response = request_or_fail(
        "POST",
        f"{api_base_url}/transactions",
        json={
            "title": "Test date invalid",
            "amount": 12000,
            "category": "Khac",
            "date": "08/05/2026",
        },
    )

    assert response.status_code == 400, response.text


def test_invalid_json_returns_400(api_base_url: str) -> None:
    response = request_or_fail(
        "POST",
        f"{api_base_url}/transactions",
        data="{invalid-json",
        headers={"Content-Type": "application/json"},
    )

    assert response.status_code == 400, response.text
