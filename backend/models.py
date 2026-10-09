from sqlalchemy import Column, Integer, String, DateTime, Sequence
from sqlalchemy.sql import func

from backend.database import Base


user_id_seq = Sequence(
    "users_user_id_seq",
    schema="public"
)


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "public"}

    user_id = Column(
        Integer,
        user_id_seq,
        primary_key=True,
        server_default=user_id_seq.next_value()
    )

    name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, nullable=False)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    password_hash = Column(String(255), nullable=False)