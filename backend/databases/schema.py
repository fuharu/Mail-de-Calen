from pydantic import BaseModel


# class Question(BaseModel):
#     question: str
#     tag: str
#     detail: str


class ToDo(BaseModel):
    user_id: str
    title: str
    description: str
    status: str
    priority: str
    due_date: str  # ISO format date string
    completed: int  # 0 or 1
