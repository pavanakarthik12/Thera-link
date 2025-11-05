from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase
from utils.response import success_response, error_response

router = APIRouter(prefix="/api/treatment", tags=["treatments"])

class TreatmentCreate(BaseModel):
    patient_id: str
    medication: str
    dosage: str
    frequency: str
    start_date: str  # ISO format date

@router.post("/new")
async def create_treatment(treatment_data: TreatmentCreate):
    """
    Create a new treatment prescription.
    """
    try:
        # Insert treatment into Supabase
        response = supabase.table("treatments").insert({
            "patient_id": treatment_data.patient_id,
            "medication": treatment_data.medication,
            "dosage": treatment_data.dosage,
            "frequency": treatment_data.frequency,
            "start_date": treatment_data.start_date
        }).execute()
        
        # Get the inserted treatment data
        treatment = response.data[0] if response.data else None
        
        if not treatment:
            raise HTTPException(status_code=500, detail="Failed to create treatment")
            
        return success_response(
            data={
                "id": treatment["id"],
                "patient_id": treatment["patient_id"],
                "medication": treatment["medication"],
                "dosage": treatment["dosage"],
                "frequency": treatment["frequency"],
                "start_date": treatment["start_date"]
            },
            message="Treatment created successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating treatment: {str(e)}")