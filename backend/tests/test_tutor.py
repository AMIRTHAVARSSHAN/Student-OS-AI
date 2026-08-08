import pytest

@pytest.mark.asyncio
async def test_tutor_sessions_and_memory_flow(client):
    # 1. Register & Login
    reg_payload = {
        "email": "tutorstudent@scholartest.edu",
        "password": "tutorpassword123",
        "full_name": "Kavitha S",
        "preferred_language": "en"
    }
    await client.post("/api/v1/auth/register", json=reg_payload)
    login_res = await client.post("/api/v1/auth/login", json={"email": "tutorstudent@scholartest.edu", "password": "tutorpassword123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Tutor Session
    sess_payload = {
        "title": "Quantum Mechanics Principles",
        "chapter": "Wave Mechanics",
        "goal": "Master Schrödinger Equation",
        "difficulty": "advanced",
        "teaching_style": "teacher"
    }
    sess_res = await client.post("/api/v1/tutor/sessions", json=sess_payload, headers=headers)
    assert sess_res.status_code == 201
    session_data = sess_res.json()
    session_id = session_data["id"]
    assert session_data["title"] == "Quantum Mechanics Principles"

    # 3. Get User Tutor Sessions
    sessions_res = await client.get("/api/v1/tutor/sessions", headers=headers)
    assert sessions_res.status_code == 200
    assert len(sessions_res.json()) >= 1

    # 4. Fetch Academic Memory
    mem_res = await client.get("/api/v1/tutor/memory", headers=headers)
    assert mem_res.status_code == 200
    assert "user_id" in mem_res.json()

    # 5. Reset Academic Memory
    reset_res = await client.delete("/api/v1/tutor/memory", headers=headers)
    assert reset_res.status_code == 200
    assert reset_res.json()["message"] == "Academic Memory reset successfully."
