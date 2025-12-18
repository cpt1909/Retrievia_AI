from docx import Document
from docx.document import Document as TypeDocument
import PyPDF2

import io
import os

from typing import List, Tuple

from google.genai.types import GenerateContentConfig
from fastapi.concurrency import run_in_threadpool

abspath = lambda filename : str(os.path.join(os.path.abspath(os.path.dirname(__file__)), filename))

async def process_document(gclient, file_bytes, filename) -> Tuple[List[List[float]], List[str]]:
    text: str = await extract_text(file_bytes, filename)
    chunks: List[str] = chunker(text)
    embeddings: List[List[float]] = await generate_embeddings(gclient, chunks)
    return embeddings, chunks

async def query_response(client, query: str, context: str) -> str:

    if not context:
        return "No valid answers found ..."

    response = await run_in_threadpool(
        client.models.generate_content,
        model = "gemini-2.5-flash-lite",
        contents = f"Context: {context}\n\nQuestion: {query}\n\nAnswer based on the context:",
        config = GenerateContentConfig(
            system_instruction = f"You are Retrievia, a RAG bot built by Thaarakenth. You are answering questions about a document. Do not add any formatting except punctuations."
        ),
    )
    return response.text

# EXTRACT TEXT FROM GIVEN DOCUMENT
async def extract_text(file_bytes: bytes, filename: str) -> str:
    text = await run_in_threadpool(
        _extract_text_sync,
        file_bytes,
        filename
    )
    return text

def _extract_text_sync(file_bytes: bytes, filename: str) -> str:

    _, ext = os.path.splitext(filename)
    extension: str = ext.lower().lstrip(".")

    file_obj = io.BytesIO(file_bytes)
    if extension == "docx":
        doc: TypeDocument = Document(file_obj)
        text_array: List[str] = []
        for t in doc.paragraphs:
            text_array.append(t.text)

        return " ".join(" ".join(text_array).replace("\n", " ").split())

    elif extension == "txt":
        for enc in ("utf-8", "utf-8-sig", "latin-1"):
            try:
                return file_bytes.decode(enc)
            except Exception:
                pass

        return " ".join(file_bytes.decode("utf-8", errors="replace").replace("\n", " ").split())

    elif extension == "pdf":
        pdf_reader = PyPDF2.PdfReader(file_obj)
        text_array: List[str] = [(t.extract_text() or "") for t in pdf_reader.pages]

        return " ".join(" ".join(text_array).replace("\n", " ").split())

    else:
        raise ValueError(f"Unsupported file type: {extension}")


# SPLIT TEXT INTO CHUNKS

CHUNK_SIZE: int = 500
OVERLAP: int = 100
def chunker(text: str) -> List[str]:
    chunks = []
    for start in range(0, len(text), CHUNK_SIZE - OVERLAP):
        chunk_text = text[start : start + CHUNK_SIZE]
        chunks.append(chunk_text)
    return chunks


# CONVERT EACH CHUNK TEXT TO VECTOR EMBEDDINGS

async def generate_embeddings(client, chunks: List[str]) -> List[List[float]]:

    embeddings: List[List[float]] = []
    for chunk in chunks:

        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=chunk
        )

        embeddings.append(result.embeddings[0].values)

    return embeddings