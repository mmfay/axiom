from pydantic import BaseModel, EmailStr, Field

# -------------------------
# Request Schemas
# -------------------------

class UserEmail(BaseModel):
    email: EmailStr
    
class Token(BaseModel):
    token: str

class LoginRequest(UserEmail):
    password: str = Field(min_length=6)

class SignupRequest(UserEmail):
    user_id: str
    password: str = Field(min_length=6)
    
class ResetPassword(BaseModel):
    token: str
    password: str

class SetRoleRequest(BaseModel):
    role_id: int

class SetCompanyRequest(BaseModel):
    company_id: int