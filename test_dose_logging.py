import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_dose_logging():
    """Test dose logging functionality"""
    print("Testing dose logging...")
    
    # First create a patient
    patient_data = {
        "name": "Test Patient",
        "age": 45,
        "gender": "Female",
        "condition": "Hypertension"
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
        "medication": "Lisinopril",
        "dosage": "10mg",
        "frequency": "1x daily",
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
    
    # Check initial patient data
    response = requests.get(f"{BASE_URL}/api/patient/{patient_id}")
    result = response.json()
    print(f"Initial patient data: {json.dumps(result, indent=2)}")
    
    # Log a dose as Taken
    dose_data = {
        "patient_id": patient_id,
        "medication": "Lisinopril",
        "status": "Taken"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/log_dose",
        headers={"Content-Type": "application/json"},
        data=json.dumps(dose_data)
    )
    
    result = response.json()
    print(f"Dose log response: {json.dumps(result, indent=2)}")
    
    # Check patient summary after logging dose
    response = requests.get(f"{BASE_URL}/api/summary/{patient_id}")
    result = response.json()
    print(f"Patient summary after dose: {json.dumps(result, indent=2)}")
    
    # Log another dose as Missed
    dose_data = {
        "patient_id": patient_id,
        "medication": "Lisinopril",
        "status": "Missed"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/log_dose",
        headers={"Content-Type": "application/json"},
        data=json.dumps(dose_data)
    )
    
    result = response.json()
    print(f"Second dose log response: {json.dumps(result, indent=2)}")
    
    # Check patient summary after logging second dose
    response = requests.get(f"{BASE_URL}/api/summary/{patient_id}")
    result = response.json()
    print(f"Patient summary after second dose: {json.dumps(result, indent=2)}")

if __name__ == "__main__":
    test_dose_logging()