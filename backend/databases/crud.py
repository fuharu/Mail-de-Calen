from datetime import datetime
from sqlalchemy.orm import Session

import backend.databases.schema as schema
import backend.databases.model as model


# def create_question(db: Session, question: schema.Question):
#     try:
#         new_question = model.Question(
#             question=question.question,
#             tag=question.tag,
#             detail=question.detail,
#             created_at=datetime.now(),
#         )
#         db.add(new_question)
#         db.commit()
#         db.refresh(new_question)
#     except Exception as e:
#         db.rollback()
#         return False
#     return question


# def get_all_question(db: Session):
#     question = db.query(model.Question).all()
#     if not question:
#         return False
#     return question


# def delete_question(db: Session, question_id: int):
#     question = db.query(model.Question).filter(model.Question.id == question_id).first()
#     if not question:
#         return False
#     db.delete(question)
#     db.commit()
#     return True


# About ToDo
def create_todo(db: Session, todo: schema.ToDo):
    try:
        new_todo = model.ToDo(
            completed=todo.completed,
            created_at=datetime.now(),
            description=todo.description,
            due_date=todo.due_date,
            priority=todo.priority,
            status=todo.status,
            title=todo.title,
            updated_at=datetime.now(),
            user_id=todo.user_id,
        )
        db.add(new_todo)
        db.commit()
        db.refresh(new_todo)
    except Exception as e:
        db.rollback()
        return False
    return todo


def get_all_todo(db: Session):
    todo = db.query(model.ToDo).all()
    if not todo:
        return False
    return todo


def get_all_todo_by_user_id(db: Session, user_id: str):
    todo = db.query(model.ToDo).filter(model.ToDo.user_id == user_id).all()
    if not todo:
        return False
    return todo


def get_todo_by_date(db: Session, due_date: str):
    todo = db.query(model.ToDo).filter(model.ToDo.due_date == due_date).all()
    if not todo:
        return False
    return todo


def delete_todo(db: Session, todo_title: str, user_id: str):
    todo = (
        db.query(model.ToDo)
        .filter(model.ToDo.title == todo_title)
        .filter(model.ToDo.user_id == user_id)
        .first()
    )
    if not todo:
        return False
    db.delete(todo)
    db.commit()
    return True
