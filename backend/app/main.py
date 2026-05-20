from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import client
from app.api import auth, patients, evaluations, rag

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Verify MongoDB connection on startup
    try:
        client.admin.command('ping')
        print("Successfully connected to MongoDB server!")
    except Exception as e:
        print(f"Warning: Could not connect to MongoDB server: {e}")
    yield

app = FastAPI(
    title="ClinicalMatch AI API Gateway",
    description="High-fidelity backend matching parser, PDF extractor, and RAG Q&A server for Clinical Trial companies.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configurations for local frontend Vite port & deployment setups
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to frontend domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(evaluations.router)
app.include_router(rag.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "ClinicalMatch AI Full-Stack API",
        "version": "1.0.0"
    }
