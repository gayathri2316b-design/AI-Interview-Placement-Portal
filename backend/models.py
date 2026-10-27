
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Sequence,
    ForeignKey,
    Text
)
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


class Category(Base):
    __tablename__ = "category"
    __table_args__ = {"schema": "public"}

    category_id = Column(Integer, primary_key=True)
    category_name = Column(String(100), nullable=False)

    parent_id = Column(
        Integer,
        ForeignKey("public.category.category_id"),
        nullable=True
    )


class Question(Base):
    __tablename__ = "questions"
    __table_args__ = {"schema": "public"}

    ques_id = Column(Integer, primary_key=True, index=True)

    category_id = Column(
        Integer,
        ForeignKey("public.category.category_id"),
        nullable=True
    )

    ques_txt = Column(Text, nullable=False)
    crt_ans = Column(Text, nullable=False)
    difficulty = Column(String(10), nullable=True)
    option_a = Column(Text, nullable=True)
    option_b = Column(Text, nullable=True)
    option_c = Column(Text, nullable=True)
    option_d = Column(Text, nullable=True)
    
    
@app.get("/api/test-questions")
def get_test_questions(db: Session = Depends(get_db)):
    questions = db.query(Question).filter(
        Question.option_a.isnot(None),
        Question.option_b.isnot(None),
        Question.option_c.isnot(None),
        Question.option_d.isnot(None)
    ).order_by(Question.ques_id).all()

    return [
        {
            "ques_id": q.ques_id,
            "category_id": q.category_id,
            "ques_txt": q.ques_txt,
            "difficulty": q.difficulty,
            "options": [
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d
            ]
        }
        for q in questions
    ]
