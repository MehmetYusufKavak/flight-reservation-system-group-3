from fastapi import FastAPI, Depends
from pydantic import BaseModel

from auth import login_user
from jwt_handler import create_access_token
from dependencies import get_current_user, require_admin

app = FastAPI(title="Flight Reservation System API")


class LoginRequest(BaseModel):
    email: str
    password: str


@app.get("/")
def home():
    return {"message": "Flight Reservation API is running!"}


@app.post("/auth/login")
def login(request: LoginRequest):
    user = login_user(request.email, request.password)

    if user is None:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(user)

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@app.get("/users/me")
def get_my_profile(current_user: dict = Depends(get_current_user)):
    return current_user


@app.get("/admin/test")
def admin_test(current_user: dict = Depends(require_admin)):
    return {"message": "Welcome Administrator!"}