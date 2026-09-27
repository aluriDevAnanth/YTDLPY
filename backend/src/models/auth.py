from sqlmodel import SQLModel


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(SQLModel):
    username: str
    password: str
