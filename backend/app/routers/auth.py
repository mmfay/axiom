from fastapi import APIRouter

router = APIRouter()


@router.get("/me")
def get_me():
    return {
        "id": 1,
        "username": "matt",
        "email": "matt@example.com",
        "is_active": True,
        "permissions": ["users.view", "users.edit"],
    }


@router.post("/login")
def login():
    return {
        "message": "Login endpoint placeholder"
    }


@router.post("/logout")
def logout():
    return {
        "message": "Logout endpoint placeholder"
    }