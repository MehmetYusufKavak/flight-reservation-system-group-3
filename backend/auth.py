
import bcrypt
from sqlalchemy import text
from database import engine


def login_user(email: str, password: str):
    """
    Checks user email and password.
    Returns user information if login is successful.
    Returns None if credentials are incorrect.
    """

    query = text("""
        SELECT userid, email, password, userrole
        FROM "User"
        WHERE email = :email
    """)

    with engine.connect() as connection:
        result = connection.execute(
            query,
            {"email": email}
        ).fetchone()

    if result is None:
        return None

    stored_hash = result.password.encode("utf-8")
    entered_password = password.encode("utf-8")

    if not bcrypt.checkpw(entered_password, stored_hash):
        return None

    return {
        "userid": result.userid,
        "email": result.email,
        "role": result.userrole
    }
