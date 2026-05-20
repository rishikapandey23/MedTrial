from fastapi import APIRouter, Depends, HTTPException, Header, status
from bson import ObjectId
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.schemas import QueryRequest, QueryResponse
from app.services.rag_service import query_patient_rag

router = APIRouter(prefix="/api/rag", tags=["RAG Chatbot"])

@router.post("/patient/{patient_id}/query", response_model=QueryResponse)
def query_patient_records(
    patient_id: str,
    query_in: QueryRequest,
    x_gemini_key: Optional[str] = Header(None),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        patient_oid = ObjectId(patient_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found (invalid ID format)."
        )
        
    # Verify patient ownership
    patient = db.patients.find_one({"_id": patient_oid, "user_id": current_user.id})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found."
        )
        
    try:
        results = query_patient_rag(
            patient_id=patient_id,
            query=query_in.query,
            api_key=x_gemini_key
        )
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing semantic RAG chat: {str(e)}"
        )
