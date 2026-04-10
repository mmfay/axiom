from fastapi import APIRouter

router = APIRouter()

FAKE_USERS = [
    {"id": 1, "username": "matt", "email": "matt@example.com", "is_active": True},
    {"id": 2, "username": "admin", "email": "admin@example.com", "is_active": True},
]


@router.get("/")
def list_users():
    return FAKE_USERS


@router.get("/{user_id}")
def get_user(user_id: int):
    for user in FAKE_USERS:
        if user["id"] == user_id:
            return user
    return {"message": "User not found"}


@router.post("/")
def create_user():
    return {
        "message": "Create user endpoint placeholder"
    }