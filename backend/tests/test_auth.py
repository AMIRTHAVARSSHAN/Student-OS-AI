import pytest

@pytest.mark.asyncio
async def test_register_and_login_flow(client):
    # 1. Register User
    reg_payload = {
        "email": "teststudent@annauniv.edu",
        "password": "securepassword123",
        "full_name": "Priya Raman",
        "preferred_language": "tanglish"
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert data["email"] == reg_payload["email"]

    # 2. Login User
    login_payload = {
        "email": "teststudent@annauniv.edu",
        "password": "securepassword123"
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
