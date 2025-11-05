from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase
from utils.response import success_response, error_response

router = APIRouter(prefix="/api/patient", tags=["patients"])

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    condition: str

class PatientResponse(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    condition: str

@router.post("/new")
async def create_patient(patient_data: PatientCreate):
    """
    Create a new patient record.
    """
    try:
        # Insert patient into Supabase
        response = supabase.table("patients").insert({
            "name": patient_data.name,
            "age": patient_data.age,
            "gender": patient_data.gender,
            "condition": patient_data.condition
        }).execute()
        
        # Get the inserted patient data
        patient = response.data[0] if response.data else None
        
        if not patient:
            raise HTTPException(status_code=500, detail="Failed to create patient")
            
        return success_response(
            data={
                "id": patient["id"],
                "name": patient["name"],
                "age": patient["age"],
                "gender": patient["gender"],
                "condition": patient["condition"]
            },
            message="Patient created successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating patient: {str(e)}")