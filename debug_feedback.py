import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def debug_feedback_table():
    """Debug what's in the ai_feedback table"""
    print("Debugging ai_feedback table...")
    
    # First, let's check if we can access Supabase directly
    # Since we can't do that easily, let's try to create a patient and log a dose
    # then check what happens
    
    # Create a patient
    patient_data = {
        "name": "Debug Patient",
        "age": 40,
        "gender": "Female",
        "condition": "Diabetes"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/patient/new",
        headers={"Content-Type": "application/json"},
        data=json.dumps(patient_data)
    )
    
    result = response.json()
    if not result.get("success"):
        print("Failed to create patient")
        return
        
    patient_id = result["data"]["id"]
    print(f"Created patient with ID: {patient_id}")
    
    # Create a treatment
    treatment_data = {
        "patient_id": patient_id,
        "medication": "Metformin",
        "dosage": "500mg",
        "frequency": "2x daily",
        "start_date": "2025-11-05"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/treatment/new",
        headers={"Content-Type": "application/json"},
        data=json.dumps(treatment_data)
    )
    
    result = response.json()
    if not result.get("success"):
        print("Failed to create treatment")
        return
        
    print("Created treatment")
    
    # Log a dose
    dose_data = {
        "patient_id": patient_id,
        "medication": "Metformin",
        "status": "Taken"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/log_dose",
        headers={"Content-Type": "application/json"},
        data=json.dumps(dose_data)
    )
    
    result = response.json()
    print(f"Dose log response: {json.dumps(result, indent=2)}")
    
    # Get patient summary
    response = requests.get(f"{BASE_URL}/api/summary/{patient_id}")
    result = response.json()
    print(f"Summary response: {json.dumps(result, indent=2)}")

if __name__ == "__main__":
    debug_feedback_table()