from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
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

class TreatmentResponse(BaseModel):
    id: str
    patient_id: str
    medication: str
    dosage: str
    frequency: str
    start_date: str

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

@router.get("/{patient_id}")
async def get_patient_with_treatments(patient_id: str):
    """
    Get patient details along with their prescriptions.
    """
    try:
        # Fetch patient data
        patient_response = supabase.table("patients").select("*").eq("id", patient_id).execute()
        patient_data = patient_response.data[0] if patient_response.data else None
        
        if not patient_data:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Fetch treatments for this patient
        treatments_response = supabase.table("treatments").select("*").eq("patient_id", patient_id).execute()
        treatments_data = treatments_response.data if treatments_response.data else []
        
        # Format the response
        patient_info = {
            "id": patient_data["id"],
            "name": patient_data["name"],
            "age": patient_data["age"],
            "gender": patient_data["gender"],
            "condition": patient_data["condition"]
        }
        
        treatments_list = [
            {
                "id": treatment["id"],
                "patient_id": treatment["patient_id"],
                "medication": treatment["medication"],
                "dosage": treatment["dosage"],
                "frequency": treatment["frequency"],
                "start_date": treatment["start_date"]
            }
            for treatment in treatments_data
        ]
        
        return success_response(
            data={
                "patient": patient_info,
                "treatments": treatments_list
            },
            message="Patient data retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching patient data: {str(e)}")