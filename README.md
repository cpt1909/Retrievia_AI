# Retrievia AI - RAG-based Chat Bot

Retrievia AI is a **Retrieval-Augmented Generation (RAG)** based web application that allows users to upload documents and ask natural language questions over their content.  
The system retrieves relevant document chunks using vector search and generates accurate, context-aware answers using a large language model.

The project is designed with a **production-oriented architecture**, separating concerns between data ingestion, vector indexing, retrieval, and response generation.


## Features

- Upload documents and process them into searchable chunks
- Vector-based semantic search using embeddings
- Retrieval-Augmented Generation (RAG) for grounded responses
- Async, scalable backend built with FastAPI
- Modern frontend built with Next.js and TypeScript
- Clean separation of concerns (DB, vector store, RAG logic)
- Supports large documents with chunking and metadata storage


## Tech Stack

### Backend
- **FastAPI** – Async API framework
- **Qdrant** – Vector database for semantic search
- **MongoDB** – Metadata and document chunk storage
- **Google Gemini API** – Answer generation
- **Motor** – Async MongoDB driver
- **Python 3.12**

### Frontend
- **Next.js**
- **TypeScript**
- **React**


## Architecture Overview

1. **Document Upload**
   - Files are uploaded via the frontend
   - Backend validates and processes documents
   - Text is chunked for efficient retrieval

2. **Embedding & Storage**
   - Each chunk is embedded
   - Embeddings stored in **Qdrant**
   - Chunk text and metadata stored in **MongoDB**

3. **Query Flow**
   - User submits a question
   - Relevant chunks retrieved from Qdrant
   - Retrieved context passed to the LLM
   - Final answer generated using RAG


## Backend Setup

### 1. Create a Virtual Environment
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
````

### 2. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

### 3. Environment Variables

Create a `.env` file and configure:

```env
MONGODB_URI=your_mongodb_uri
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_key
GEMINI_API_KEY=your_google_api_key
```

### 4. Run Backend

```bash
uvicorn backend.server:app --reload
```

Backend will be available at:

```
http://localhost:8000
```


## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Frontend will be available at:

```
http://localhost:3000
```


## API Overview

### Upload Document

```
POST /upload
```

* Accepts file input
* Returns a unique file ID

### Ask Question

```
POST /query
```

* Requires:

  * file ID
  * user query
* Returns generated answer grounded in document context


## Error Handling

The frontend and backend include structured error handling for:

* Missing files
* Unsupported formats
* Oversized files
* Invalid queries
* Internal processing failures

Each error returns meaningful HTTP status codes and messages.


## Design Principles

* Async-first backend design
* Modular, testable components
* Clear separation between retrieval and generation
* Frontend kept stateless and API-driven
* Production-ready folder structure


## Future Improvements

* Multi-document querying
* Authentication and user sessions
* Streaming responses
* Document preview and highlighting
* Caching for frequent queries


## License

This project is licensed under the MIT License.

## Author

Developed by [Thaarakenth C P](https://www.github.com/cpt1909)
