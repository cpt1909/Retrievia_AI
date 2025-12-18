from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from typing import List

from qdrant_client import AsyncQdrantClient
from motor.motor_asyncio import AsyncIOMotorClient
from google import genai

import RAG
from qdrant import insert_document, fetch_vector_index
from mongodb import insert_chunks, fetch_chunks

import os
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

ORIGINS = os.getenv("ORIGINS", "['http://localhost:3000']")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

maxFileSize: int = 10 * 1024 * 1024
acceptableFileFormats: List[str] = ['docx', 'txt', 'pdf']


# Qdrant Connection
CONNECTION_TIMEOUT: int = 60
QDRANT_APK_KEY: str = os.getenv('QDRANT_API_KEY')
QDRANT_ENDPOINT: str = os.getenv('QDRANT_ENDPOINT')
qclient: AsyncQdrantClient = AsyncQdrantClient(
    api_key = QDRANT_APK_KEY,
    url = QDRANT_ENDPOINT,
    timeout = CONNECTION_TIMEOUT,
)
print("QdrantDB Connection Established !!")


# MongoDB Connection
DB_NAME = os.getenv('DB_NAME')
CONNECTION_STRING: str = os.getenv('MONGODB_CONNECTION_STRING')
mclient = AsyncIOMotorClient(CONNECTION_STRING)
db = mclient[f"{DB_NAME}"]
document_col = db['documents']
print("MongoDB Connection Established !!")


# Gemini GenAI Connection
gclient = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
)
print("Gemini Connection Established !!")

@app.get("/")
async def status():
    return JSONResponse(
        status_code=200,
        content = {
            "status": "OK",
    })

@app.post("/upload")
async def upload(file: UploadFile = File(...)) -> JSONResponse:
    if not file:
        return JSONResponse(status_code=422, content={})

    if file.filename.split(".")[-1].lower() not in acceptableFileFormats:
        return JSONResponse(status_code=415, content={})

    if file.size > maxFileSize:
        return JSONResponse(status_code=413, content={})

    file_bytes: bytes = await file.read()
    filename: str = file.filename
    embeddings, chunks = await RAG.process_document(gclient, file_bytes, filename)
    if embeddings:
        uid: str = await insert_chunks(filename, document_col, chunks)
        success: bool = await insert_document(qclient, uid, embeddings, len(embeddings[0]))
        if success:
            return JSONResponse(status_code=200, content={
                "status": "success",
                "uid": uid,
            })
    return JSONResponse(status_code=550, content={})

@app.post("/query")
async def generate_response(query: str = Form(...), uid: str= Form(...)):
    query_vector: List[List[float]] = await RAG.generate_embeddings(gclient, [query])
    query_vector: List[float] = query_vector[0]
    indices: List[int] = await fetch_vector_index(qclient, query_vector, uid)
    chunks: List[str] = await fetch_chunks(document_col, uid)
    context: List[str] = []
    for idx in indices:
        context.append(chunks[idx])
    context: str = "\n".join(context)
    reply = await RAG.query_response(gclient, query, context)

    return JSONResponse(status_code=200, content={
        "reply": reply,
    })