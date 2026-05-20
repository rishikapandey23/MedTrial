from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Any, List, Optional

# --- Authentication & User Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=4)
    name: str
    role: Optional[str] = "Lead Investigator"

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None

# --- Patient Schemas ---
class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    report_text: Optional[str] = ""
    lab_notes: Optional[str] = ""
    current_meds: Optional[str] = ""
    trial_title: Optional[str] = ""
    trial_criteria: Optional[str] = ""

class PatientResponse(BaseModel):
    id: str
    user_id: str
    name: str
    age: int
    gender: str
    report_text: Optional[str]
    lab_notes: Optional[str]
    current_meds: Optional[str]
    trial_title: Optional[str]
    trial_criteria: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Evaluation Schemas ---
class EvaluationCreate(BaseModel):
    patient_id: str
    match_score: int
    status: str
    inclusion_matches: List[dict]
    exclusion_matches: List[dict]
    adverse_warnings: List[dict]
    radar_data: List[int]
    summary: Optional[str] = None

class EvaluationResponse(BaseModel):
    id: str
    patient_id: str
    match_score: int
    status: str
    inclusion_matches: Optional[List[dict]] = []
    exclusion_matches: Optional[List[dict]] = []
    adverse_warnings: Optional[List[dict]] = []
    radar_data: Optional[List[int]] = []
    summary: Optional[str] = ""
    created_at: datetime

    class Config:
        from_attributes = True

# --- Chat & RAG Schemas ---
class QueryRequest(BaseModel):
    query: str

class ChatSource(BaseModel):
    text: str
    source: str
    score: float

class QueryResponse(BaseModel):
    answer: str
    sources: List[ChatSource]
