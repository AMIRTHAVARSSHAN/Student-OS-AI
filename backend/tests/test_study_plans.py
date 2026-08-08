import pytest

@pytest.mark.asyncio
async def test_study_plans_generation(client):
    # Register & Login
    reg_payload = {
        "email": "planstudent@scholartest.edu",
        "password": "planpassword123",
        "full_name": "Ananya R",
        "preferred_language": "en"
    }
    await client.post("/api/v1/auth/register", json=reg_payload)
    login_res = await client.post("/api/v1/auth/login", json={"email": "planstudent@scholartest.edu", "password": "planpassword123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create Study Plan
    plan_payload = {
        "title": "Semester Exam Sprint",
        "start_date": "2026-08-01",
        "end_date": "2026-08-31",
        "plan_type": "exam_prep"
    }
    create_res = await client.post("/api/v1/study-plans", json=plan_payload, headers=headers)
    assert create_res.status_code == 201
    plan_data = create_res.json()
    assert plan_data["title"] == "Semester Exam Sprint"

    # Fetch User Study Plans
    plans_res = await client.get("/api/v1/study-plans", headers=headers)
    assert plans_res.status_code == 200
    assert len(plans_res.json()) >= 1

    # Fetch Today's Blocks
    today_res = await client.get("/api/v1/study-plans/today", headers=headers)
    assert today_res.status_code == 200
    assert isinstance(today_res.json(), list)
