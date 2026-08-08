import pytest

@pytest.mark.asyncio
async def test_scholar_connect_network(client):
    # Register Student 1
    await client.post("/api/v1/auth/register", json={"email": "peer1@scholartest.edu", "password": "peerpassword123", "full_name": "Siddharth N"})
    login1_res = await client.post("/api/v1/auth/login", json={"email": "peer1@scholartest.edu", "password": "peerpassword123"})
    token1 = login1_res.json()["access_token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # Register Student 2
    await client.post("/api/v1/auth/register", json={"email": "peer2@scholartest.edu", "password": "peerpassword123", "full_name": "Harini V"})
    login2_res = await client.post("/api/v1/auth/login", json={"email": "peer2@scholartest.edu", "password": "peerpassword123"})
    token2 = login2_res.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # Fetch Connect Friends for Student 1
    friends1_res = await client.get("/api/v1/connect/friends", headers=headers1)
    assert friends1_res.status_code == 200
    assert isinstance(friends1_res.json(), list)

    # Fetch Groups / Study Lounges for Student 1
    groups_res = await client.get("/api/v1/connect/groups", headers=headers1)
    assert groups_res.status_code == 200
    assert isinstance(groups_res.json(), list)
