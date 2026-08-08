import pytest

@pytest.mark.asyncio
async def test_notes_creation_and_ai_pipeline(client):
    # 1. Register & Login
    reg_payload = {
        "email": "notestudent@scholartest.edu",
        "password": "notespassword123",
        "full_name": "Rohan M",
        "preferred_language": "en"
    }
    await client.post("/api/v1/auth/register", json=reg_payload)
    login_res = await client.post("/api/v1/auth/login", json={"email": "notestudent@scholartest.edu", "password": "notespassword123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Manual Note
    note_payload = {
        "title": "Data Structures & Algorithms Overview",
        "topic": "Computer Science",
        "content": "A binary tree is a tree data structure in which each node has at most two children."
    }
    note_res = await client.post("/api/v1/notes", json=note_payload, headers=headers)
    assert note_res.status_code == 201
    created_note = note_res.json()
    assert created_note["title"] == note_payload["title"]

    # 3. Get Notes List
    notes_list_res = await client.get("/api/v1/notes", headers=headers)
    assert notes_list_res.status_code == 200
    assert len(notes_list_res.json()) >= 1
