from fastapi import APIRouter, HTTPException
from database import supabase
from utils.response import success_response, error_response

router = APIRouter(prefix="/api/summary", tags=["summary"])

@router.get("/{patient_id}")
async def get_patient_summary(patient_id: str):
    """
    Fetch patient summary including adherence, risk label, and AI feedback.
    """
    try:
        # Fetch patient data
        patient_response = supabase.table("patients").select("*").eq("id", patient_id).execute()
        patient_data = patient_response.data[0] if patient_response.data else None
        
        if not patient_data:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Fetch latest AI feedback
        feedback_response = supabase.table("ai_feedback").select("*").eq("patient_id", patient_id).order("created_at", desc=True).limit(1).execute()
        feedback_data = feedback_response.data[0] if feedback_response.data else None
        
        return success_response(
            data={
                "name": patient_data["name"],
                "adherence": patient_data.get("adherence_percent", 0),
                "risk_label": patient_data.get("risk_label", "Unknown"),
                "feedback": feedback_data["feedback"] if feedback_data else "No feedback available"
            },
            message="Summary retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching summary: {str(e)}")