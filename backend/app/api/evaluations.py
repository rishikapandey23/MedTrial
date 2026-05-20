from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header, status
from bson import ObjectId
from typing import Optional
from app.core.database import get_db, MongoModel
from app.core.security import get_current_user
from app.schemas.schemas import EvaluationResponse
from app.services.matching_service import run_eligibility_matching
from app.services.rag_service import index_patient_data

router = APIRouter(prefix="/api/evaluations", tags=["Evaluations"])

@router.post("/patient/{patient_id}/evaluate", response_model=EvaluationResponse)
def evaluate_patient_trial(
    patient_id: str,
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
        
    # Retrieve Patient
    patient = db.patients.find_one({"_id": patient_oid, "user_id": current_user.id})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found."
        )
        
    patient = MongoModel(patient)
        
    # Trigger matching engine
    results = run_eligibility_matching(
        patient_name=patient.name,
        age=patient.age,
        gender=patient.gender,
        report_text=patient.report_text or "",
        lab_notes=patient.lab_notes or "",
        current_meds=patient.current_meds or "",
        trial_title=patient.trial_title or "",
        trial_criteria=patient.trial_criteria or "",
        api_key=x_gemini_key
    )
    
    # Save or Update evaluation record
    evaluation_update = {
        "patient_id": patient_id,
        "match_score": results["match_score"],
        "status": results["status"],
        "inclusion_matches": results["inclusions"],
        "exclusion_matches": results["exclusions"],
        "adverse_warnings": results["adr_alerts"],
        "radar_data": results["radar_data"],
        "summary": results["summary"],
        "created_at": datetime.utcnow()
    }
    
    # Atomic Upsert to handle concurrent evaluation requests gracefully
    db.evaluations.update_one(
        {"patient_id": patient_id},
        {"$set": evaluation_update},
        upsert=True
    )
    
    evaluation = db.evaluations.find_one({"patient_id": patient_id})
    evaluation["id"] = str(evaluation["_id"])
    
    # Run background indexing for LangChain/ChromaDB RAG chatbot Q&A
    try:
        index_patient_data(
            patient_id=patient_id,
            report_text=patient.report_text or "",
            lab_notes=patient.lab_notes or "",
            criteria_text=patient.trial_criteria or "",
            api_key=x_gemini_key
        )
    except Exception as e:
        # Prevent indexing errors from failing the evaluation return
        pass
        
    return MongoModel(evaluation)

@router.get("/patient/{patient_id}", response_model=EvaluationResponse)
def get_evaluation(
    patient_id: str,
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
        
    evaluation = db.evaluations.find_one({"patient_id": patient_id})
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No match evaluation records exist for this patient yet."
        )
    evaluation["id"] = str(evaluation["_id"])
    return MongoModel(evaluation)
