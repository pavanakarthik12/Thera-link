from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from database import supabase
from utils.response import success_response, error_response

router = APIRouter(prefix="/api/treatment", tags=["treatments"])

class TreatmentCreate(BaseModel):
    patient_id: str
    medication: str
    dosage: str
    frequency: str
    start_date: str  # ISO format date
    schedule_days: List[str] = []  # List of days of week (e.g., ["Monday", "Wednesday", "Friday"])

@router.post("/new")
async def create_treatment(treatment_data: TreatmentCreate):
    """
    Create a new treatment prescription.
    """
    try:
        # Prepare treatment data for insertion
        # Store schedule information in frequency field as a workaround
        frequency_with_schedule = treatment_data.frequency
        if treatment_data.schedule_days:
            frequency_with_schedule = f"{treatment_data.frequency} (Schedule: {', '.join(treatment_data.schedule_days)})"
        
        # Insert treatment into Supabase
        response = supabase.table("treatments").insert({
            "patient_id": treatment_data.patient_id,
            "medication": treatment_data.medication,
            "dosage": treatment_data.dosage,
            "frequency": frequency_with_schedule,
            "start_date": treatment_data.start_date
        }).execute()
        
        # Get the inserted treatment data
        treatment = response.data[0] if response.data else None
        
        if not treatment:
            raise HTTPException(status_code=500, detail="Failed to create treatment")
            
        # Extract schedule information from frequency field
        schedule_days = []
        display_frequency = treatment["frequency"]
        if " (Schedule: " in treatment["frequency"]:
            freq_parts = treatment["frequency"].split(" (Schedule: ")
            display_frequency = freq_parts[0]
            schedule_str = freq_parts[1].rstrip(")")
            schedule_days = schedule_str.split(", ") if schedule_str else []
        
        return success_response(
            data={
                "id": treatment["id"],
                "patient_id": treatment["patient_id"],
                "medication": treatment["medication"],
                "dosage": treatment["dosage"],
                "frequency": display_frequency,
                "start_date": treatment["start_date"],
                "schedule_days": schedule_days
            },
            message="Treatment created successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating treatment: {str(e)}")

# Add endpoint to get treatments with schedule information
@router.get("/patient/{patient_id}")
async def get_patient_treatments(patient_id: str):
    """
    Get all treatments for a patient including schedule information.
    """
    try:
        # Fetch treatments for this patient
        treatments_response = supabase.table("treatments").select("*").eq("patient_id", patient_id).execute()
        treatments_data = treatments_response.data if treatments_response.data else []
        
        # Format the response
        treatments_list = []
        for treatment in treatments_data:
            # Extract schedule information from frequency field
            schedule_days = []
            display_frequency = treatment["frequency"]
            if " (Schedule: " in treatment["frequency"]:
                freq_parts = treatment["frequency"].split(" (Schedule: ")
                display_frequency = freq_parts[0]
                schedule_str = freq_parts[1].rstrip(")")
                schedule_days = schedule_str.split(", ") if schedule_str else []
            
            treatment_info = {
                "id": treatment["id"],
                "patient_id": treatment["patient_id"],
                "medication": treatment["medication"],
                "dosage": treatment["dosage"],
                "frequency": display_frequency,
                "start_date": treatment["start_date"],
                "schedule_days": schedule_days
            }
            
            treatments_list.append(treatment_info)
        
        return success_response(
            data={"treatments": treatments_list},
            message="Treatments retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching treatments: {str(e)}")