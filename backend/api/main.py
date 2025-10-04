import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.api.v1 import todo
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai


load_dotenv()


class PromptRequest(BaseModel):
    prompt: str


app = FastAPI(
    title="Mail de Calen API",
    description="メール解析とカレンダー管理API",
    version="1.0.0",
)

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todo.router)


@app.get(
    "/",
    tags=["root"],
    responses={
        200: {
            "description": "Root path",
            "content": {"application/json": {"example": {"status": "ok"}}},
        },
    },
)
async def root():
    """
    This is the root path of the backend server.
    """
    return JSONResponse(content={"status": "ok", "hello": "world"})


@app.get(
    "/health",
    tags=["health"],
    responses={
        200: {
            "description": "Health check",
            "content": {"application/json": {"example": {"status": "ok"}}},
        },
    },
)
async def health_check():
    """
    This is a health check endpoint.
    """
    try:
        return JSONResponse(content={"status": "pass"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})


genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("gemini-2.0-flash-lite")


import json


@app.post("/generate_text/")
async def generate_text(request: PromptRequest):
    """
    メール本文を解析し、ToDoリストまたは予定に登録すべきことを生成
    """
    try:
        sanitized_prompt = json.dumps(request.prompt)[
            1:-1
        ]  # JSONエンコード後、前後の引用符を削除
        prompt = f"以下のメール本文を解析し，ToDoリストまたは予定に登録すべきことがあったら，以下の1,2,3,4の方法で書いてください．1.タスクと予定について，それぞれ個別のjson形式で返してください．2.タスクと予定のjson以外には何も返答しないでください．3.日付に関する情報はYYYY-MM-DDTHH-MM-SS+09:00の書き方で書いてください．年が書かれていない場合は2025年にしてください．4.jsonの中身についてですが，タスクは「title, description,status(タスク承認可否,candidateにしてください),priority(優先順位,high-nomalのどちらか),due_date,completed(達成済みかどうか，未達成を表す0にしてください．)」，予定は現段階ではお任せします．\n\n{sanitized_prompt}"
        response = model.generate_content(prompt)
        return {"generated_text": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app=app)
