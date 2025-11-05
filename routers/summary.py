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
        
        return success_response(
            data={
                "name": patient_data["name"],
                "adherence": adherence,
                "risk_label": risk_label,
                "feedback": feedback
            },
            message="Summary retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching summary: {str(e)}")