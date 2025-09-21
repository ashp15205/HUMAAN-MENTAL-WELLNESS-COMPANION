from fastapi import FastAPI, Form, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import uvicorn

app = FastAPI()

# Allow requests from the frontend (adjust origin as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulated user "database"
users_db = {}

# ----------------------------- SIGNUP ----------------------------- #
@app.post("/signup")
async def signup(
    full_name: str = Form(...),
    phone_number: str = Form(...),
    email: EmailStr = Form(...),
    password: str = Form(...)
):
    if email in users_db:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "User already exists!"}
        )

    # Save user to fake DB
    users_db[email] = {
        "full_name": full_name,
        "phone_number": phone_number,
        "email": email,
        "password": password,  # ⚠️ Consider hashing passwords!
        "quiz_score": 0
    }

    return {"message": "Signup successful!"}


# ----------------------------- LOGIN ----------------------------- #
@app.post("/login")
async def login(
    email: EmailStr = Form(...),
    password: str = Form(...)
):
    user = users_db.get(email)
    if not user or user["password"] != password:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Invalid credentials"}
        )

    return {
        "message": f"Welcome, {user['full_name']}!",
        "user_data": {
            "full_name": user["full_name"],
            "phone_number": user["phone_number"],
            "email": user["email"],
            "quiz_score": user["quiz_score"]
        }
    }

# ----------------------------- RUN ----------------------------- #
if __name__ == "__main__":
    uvicorn.run("login:app", host="127.0.0.1", port=8000, reload=True)
