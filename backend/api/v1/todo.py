from dotenv import load_dotenv
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from backend import db
from backend.databases import model, crud, schema

load_dotenv()

router = APIRouter(
    prefix="/api/v1/todo",
    tags=["todo"],
    responses={404: {"description": "Not found"}},
)


# @router.get(
#     "/all",
# )
# async def get_all_question(db: Session = Depends(db.db_session)):
#     """
#     DBから全ての問題を取得する
#     """
#     try:
#         all_questions = crud.get_all_question(db)
#         if not all_questions:
#             return JSONResponse(
#                 status_code=200,
#                 content={"question": "not exist"},
#             )
#         return all_questions

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"unexpected error: {str(e)}")


# @router.post(
#     "/create",
# )
# async def create_question(
#     question: schema.Question,
#     db: Session = Depends(db.db_session),
# ):
#     """
#     DBに問題を登録する
#     """
#     try:
#         new_question = crud.create_question(db, question)
#         if not new_question:
#             raise HTTPException(status_code=500, detail="failed to create question")

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"unexpected error: {str(e)}")
#     return JSONResponse(status_code=200, content={"created": "success"})


# @router.delete(
#     "/delete/{question_id}",
# )
# async def delete_question(
#     question_id: int,
#     db: Session = Depends(db.db_session),
# ):
#     """
#     DBから問題を削除する
#     """
#     try:
#         deleted_question = crud.delete_question(db, question_id)
#         if not deleted_question:
#             raise HTTPException(status_code=500, detail="failed to delete question")

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"unexpected error: {str(e)}")
#     return JSONResponse(
#         content={"question": "deleted", "deleted_question": deleted_question}
#     )


# About ToDo
@router.get(
    "/all",
)
async def get_all_todo(db: Session = Depends(db.db_session)):
    """
    DBから全てのToDoを取得する(基本使わない)
    """
    try:
        all_todo = crud.get_all_todo(db)
        if not all_todo:
            return JSONResponse(
                status_code=200,
                content={"todo": "not exist"},
            )
        return all_todo

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"unexpected error: {str(e)}")


@router.get(
    "/all/{user_id}",
)
async def get_all_todo_by_user_id(user_id: str, db: Session = Depends(db.db_session)):
    """
    DBから特定ユーザーのToDoを取得する(推奨使用)
    """
    try:
        all_todo = crud.get_all_todo_by_user_id(db, user_id)
        if not all_todo:
            return JSONResponse(
                status_code=200,
                content={"todo": "not exist"},
            )
        return all_todo

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"unexpected error: {str(e)}")


@router.get("all/{user_id}/date")
async def get_all_todo_by_user_id_and_date(
    user_id: str, date: str, db: Session = Depends(db.db_session)
):
    """
    DBから特定ユーザーの特定日のToDoを取得する
    """
    try:
        all_todo = crud.get_all_todo_by_user_id_and_date(db, user_id, date)
        if not all_todo:
            return JSONResponse(
                status_code=200,
                content={"todo": "not exist"},
            )
        return all_todo

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"unexpected error: {str(e)}")


@router.post(
    "/create",
)
async def create_todo(
    todo: schema.ToDo,
    db: Session = Depends(db.db_session),
):
    """
    DBにToDoを登録する
    """
    try:
        new_todo = crud.create_todo(db, todo)
        if not new_todo:
            raise HTTPException(status_code=500, detail="failed to create todo")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"unexpected error: {str(e)}")
    return JSONResponse(status_code=200, content={"created": "success"})


@router.delete(
    "/delete/{todo_id}",
)
async def delete_todo(
    todo_title: str,
    user_id: str,
    db: Session = Depends(db.db_session),
):
    """
    DBからToDoを削除する
    """
    try:
        deleted_todo = crud.delete_todo(db, todo_title, user_id)
        if not deleted_todo:
            raise HTTPException(status_code=500, detail="failed to delete todo")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"unexpected error: {str(e)}")
    return JSONResponse(content={"todo": "deleted", "deleted_todo": deleted_todo})
