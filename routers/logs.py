from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase
from utils.response import success_response, error_response
from utils.adherence import calculate_adherence, count_missed_doses
from ai_model import predict_risk, generate_ai_feedback
import uuid

router = APIRouter(prefix="/api", tags=["logs"])

class DoseLogCreate(BaseModel):
    patient_id: str
    medication: str
    status: str  # Taken, Missed, Inconsistent

@router.post("/log_dose")
async def log_dose(dose_data: DoseLogCreate):
    """
    Log a medication dose and update patient adherence metrics.
    """
    try:
        # Insert dose log into Supabase
        response = supabase.table("dose_logs").insert({
            "patient_id": dose_data.patient_id,
            "medication": dose_data.medication,
            "status": dose_data.status
        }).execute()
        
        # Get the inserted dose log
        dose_log = response.data[0] if response.data else None
        
        if not dose_log:
            raise HTTPException(status_code=500, detail="Failed to log dose")
        
        # Fetch all dose logs for this patient to recalculate adherence
        logs_response = supabase.table("dose_logs").select("*").eq("patient_id", dose_data.patient_id).execute()
        dose_logs = logs_response.data if logs_response.data else []
        
        # Calculate adherence metrics
        adherence_percent = calculate_adherence(dose_logs)
        missed_doses = count_missed_doses(dose_logs)
        
        # Predict risk using ML model
        risk_label = predict_risk(adherence_percent, missed_doses)
        
        # Generate AI feedback
        feedback_message = generate_ai_feedback(adherence_percent, risk_label)
        
        # Update patient record with new metrics (only columns that exist)
        update_data = {
            "adherence_percent": adherence_percent,
            "risk_label": risk_label
        }
        
        supabase.table("patients").update(update_data).eq("id", dose_data.patient_id).execute()
        
        return success_response(
            data={
                "dose_log_id": dose_log["id"],
                "adherence_percent": adherence_percent,
                "risk_label": risk_label,
                "feedback_message": feedback_message
            },
            message="Dose logged successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error logging dose: {str(e)}")