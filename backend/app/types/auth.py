from pydantic import BaseModel, EmailStr, Field

# -------------------------
# Request Schemas
# -------------------------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

class SignupRequest(BaseModel):
    email: EmailStr
    user_id: str
    password: str = Field(min_length=6)
    first_name: str
    last_name: str