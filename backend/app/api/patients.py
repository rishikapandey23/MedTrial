from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from bson import ObjectId
from typing import List
from app.core.database import get_db, MongoModel
from app.core.security import get_current_user
from app.schemas.schemas import PatientCreate, PatientResponse
from app.services.pdf_service import extract_text_from_pdf

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: PatientCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    patient_dict = {
        "user_id": current_user.id,
        "name": patient_in.name,
        "age": patient_in.age,
        "gender": patient_in.gender,
        "report_text": patient_in.report_text,
        "lab_notes": patient_in.lab_notes,
        "current_meds": patient_in.current_meds,
        "trial_title": patient_in.trial_title,
        "trial_criteria": patient_in.trial_criteria,
        "created_at": datetime.utcnow()
    }
    result = db.patients.insert_one(patient_dict)
    patient_dict["id"] = str(result.inserted_id)
    return MongoModel(patient_dict)

@router.get("", response_model=List[PatientResponse])
def get_patients(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    cursor = db.patients.find({"user_id": current_user.id}).sort("created_at", -1)
    patients = []
    for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc["user_id"] = str(doc["user_id"])
        patients.append(MongoModel(doc))
    return patients

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        patient_oid = ObjectId(patient_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient record not found (invalid ID format)."
        )
        
    patient = db.patients.find_one({"_id": patient_oid, "user_id": current_user.id})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient record not found."
        )
    patient["id"] = str(patient["_id"])
    patient["user_id"] = str(patient["user_id"])
    return MongoModel(patient)

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        patient_oid = ObjectId(patient_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient record not found (invalid ID format)."
        )
        
    result = db.patients.delete_one({"_id": patient_oid, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient record not found."
        )
    
    # Cascade delete any evaluation associated with this patient
    db.evaluations.delete_one({"patient_id": patient_id})
    return

@router.post("/ingest-file")
async def ingest_file(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    # Ensure PDF upload
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF file."
        )
        
    try:
        file_bytes = await file.read()
        extracted_text = extract_text_from_pdf(file_bytes)
        return {
            "filename": file.filename,
            "extracted_text": extracted_text,
            "size_bytes": len(file_bytes)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error parsing case PDF file: {str(e)}"
        )
