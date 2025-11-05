from fastapi import APIRouter, HTTPException
from database import supabase
from utils.response import success_response, error_response
from datetime import datetime, timedelta
from collections import defaultdict

router = APIRouter(prefix="/api/summary", tags=["summary"])

@router.get("/{patient_id}")
async def get_patient_summary(patient_id: str):
    """
    Fetch patient summary including adherence, risk label, and detailed missed days information.
    """
    try:
        # Fetch patient data
        patient_response = supabase.table("patients").select("*").eq("id", patient_id).execute()
        patient_data = patient_response.data[0] if patient_response.data else None
        
        if not patient_data:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Fetch all dose logs for this patient
        logs_response = supabase.table("dose_logs").select("*").eq("patient_id", patient_id).execute()
        dose_logs = logs_response.data if logs_response.data else []
        
        # Fetch treatments for this patient
        treatments_response = supabase.table("treatments").select("*").eq("patient_id", patient_id).execute()
        treatments_data = treatments_response.data if treatments_response.data else []
        
        # Get adherence and risk data
        adherence = patient_data.get("adherence_percent", 0)
        risk_label = patient_data.get("risk_label", "Unknown")
        
        # Provide a generic feedback message based on adherence
        if adherence >= 80:
            feedback = "Great job! Your adherence is excellent. Keep up the good work!"
        elif adherence >= 60:
            feedback = "Good progress! Try to be more consistent with your medication."
        else:
            feedback = "It's important to take your medication regularly. Consider setting reminders."
        
        # Process dose logs to get missed days information
        missed_days_info = process_missed_days(dose_logs, treatments_data)
        
        return success_response(
            data={
                "name": patient_data["name"],
                "adherence": adherence,
                "risk_label": risk_label,
                "feedback": feedback,
                "missed_days": missed_days_info
            },
            message="Summary retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching summary: {str(e)}")

def process_missed_days(dose_logs, treatments):
    """
    Process dose logs to identify which days were missed for each medication.
    """
    # Group dose logs by medication
    logs_by_medication = defaultdict(list)
    for log in dose_logs:
        logs_by_medication[log["medication"]].append(log)
    
    # Group treatments by medication
    treatments_by_medication = defaultdict(list)
    for treatment in treatments:
        treatments_by_medication[treatment["medication"]].append(treatment)
    
    # Process each medication
    missed_info = {}
    for medication, logs in logs_by_medication.items():
        # Get scheduled days for this medication
        scheduled_days = set()
        treatments_for_med = treatments_by_medication.get(medication, [])
        for treatment in treatments_for_med:
            if "schedule_days" in treatment and treatment["schedule_days"]:
                scheduled_days.update(treatment["schedule_days"])
        
        # Group logs by date
        logs_by_date = defaultdict(list)
        for log in logs:
            if "date" in log:
                logs_by_date[log["date"]].append(log)
        
        # Identify missed days
        missed_days = []
        for date_str, date_logs in logs_by_date.items():
            # Check if any log for this date was "Missed"
            if any(log["status"] == "Missed" for log in date_logs):
                missed_days.append({
                    "date": date_str,
                    "medication": medication
                })
        
        missed_info[medication] = {
            "scheduled_days": list(scheduled_days),
            "missed_days": missed_days,
            "total_missed": len(missed_days)
        }
    
    return missed_info