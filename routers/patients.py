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

@router.delete("/{patient_id}")
async def delete_patient(patient_id: str):
    """
    Delete a patient record by ID.
    """
    try:
        # First delete all treatments associated with this patient
        supabase.table("treatments").delete().eq("patient_id", patient_id).execute()
        
        # Then delete all dose logs associated with this patient
        supabase.table("dose_logs").delete().eq("patient_id", patient_id).execute()
        
        # Finally delete the patient record
        response = supabase.table("patients").delete().eq("id", patient_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Patient not found")
            
        return success_response(
            data={"id": patient_id},
            message="Patient deleted successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting patient: {str(e)}")

@router.delete("/name/{patient_name}")
async def delete_patient_by_name(patient_name: str):
    """
    Delete patient records by name (useful for removing test patients).
    """
    try:
        # First get all patients with this name
        patient_response = supabase.table("patients").select("id").eq("name", patient_name).execute()
        patients_to_delete = patient_response.data if patient_response.data else []
        
        deleted_count = 0
        for patient in patients_to_delete:
            patient_id = patient["id"]
            
            # Delete all treatments associated with this patient
            supabase.table("treatments").delete().eq("patient_id", patient_id).execute()
            
            # Delete all dose logs associated with this patient
            supabase.table("dose_logs").delete().eq("patient_id", patient_id).execute()
            
            # Delete the patient record
            supabase.table("patients").delete().eq("id", patient_id).execute()
            deleted_count += 1
            
        return success_response(
            data={"deleted_count": deleted_count},
            message=f"Successfully deleted {deleted_count} patient(s) named {patient_name}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting patients: {str(e)}")

@router.get("/all")
async def get_all_patients():
    """
    Get all patients.
    """
    try:
        # Fetch all patients from Supabase
        response = supabase.table("patients").select("*").execute()
        patients_data = response.data if response.data else []
        
        # Format the response
        patients_list = []
        for patient in patients_data:
            patient_info = {
                "id": patient["id"],
                "name": patient["name"],
                "age": patient["age"],
                "gender": patient["gender"],
                "condition": patient["condition"],
                "adherence_percent": patient.get("adherence_percent", 0),
                "risk_label": patient.get("risk_label", "Unknown")
            }
            patients_list.append(patient_info)
        
        return success_response(
            data={"patients": patients_list},
            message="Patients retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching patients: {str(e)}")

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
        
        # Fetch treatments for this patient using the new endpoint
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
        
        # Process treatments to extract schedule information
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
            data={
                "patient": patient_info,
                "treatments": treatments_list
            },
            message="Patient data retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching patient data: {str(e)}")