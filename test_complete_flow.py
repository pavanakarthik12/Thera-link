import requests
import json
import uuid
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

def create_test_patient():
    """Create a test patient"""
    print("Creating test patient...")
    patient_data = {
        "name": "John Doe",
        "age": 35,
        "gender": "Male",
        "condition": "Hypertension"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/patient/new",
        headers={"Content-Type": "application/json"},
        data=json.dumps(patient_data)
    )
    
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {result}")
    
    if result.get("success"):
        patient_id = result["data"]["id"]
        print(f"Patient created with ID: {patient_id}")
        return patient_id
    else:
        print("Failed to create patient")
        return None

def create_test_treatment(patient_id):
    """Create a test treatment for the patient"""
    print("\nCreating test treatment...")
    treatment_data = {
        "patient_id": patient_id,
        "medication": "Lisinopril",
        "dosage": "10mg",
        "frequency": "1x daily",
        "start_date": datetime.now().strftime("%Y-%m-%d")
    }
    
    response = requests.post(
        f"{BASE_URL}/api/treatment/new",
        headers={"Content-Type": "application/json"},
        data=json.dumps(treatment_data)
    )
    
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {result}")
    
    return result.get("success", False)

def log_test_dose(patient_id, medication, status):
    """Log a test dose"""
    print(f"\nLogging dose: {status}...")
    dose_data = {
        "patient_id": patient_id,
        "medication": medication,
        "status": status
    }
    
    response = requests.post(
        f"{BASE_URL}/api/log_dose",
        headers={"Content-Type": "application/json"},
        data=json.dumps(dose_data)
    )
    
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {result}")
    
    return result.get("success", False)

def get_patient_summary(patient_id):
    """Get patient summary"""
    print("\nGetting patient summary...")
    response = requests.get(f"{BASE_URL}/api/summary/{patient_id}")
    
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    return result.get("success", False)

def get_patient_with_treatments(patient_id):
    """Get patient with treatments"""
    print("\nGetting patient with treatments...")
    response = requests.get(f"{BASE_URL}/api/patient/{patient_id}")
    
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    return result.get("success", False)

if __name__ == "__main__":
    print("Testing Complete TheraLink Flow")
    print("=" * 40)
    
    # Step 1: Create patient (Doctor)
    patient_id = create_test_patient()
    
    if patient_id:
        # Step 2: Add treatment (Doctor)
        treatment_success = create_test_treatment(patient_id)
        
        if treatment_success:
            # Step 3: Get patient with treatments (Patient)
            get_patient_with_treatments(patient_id)
            
            # Step 4: Log dose (Patient)
            log_test_dose(patient_id, "Lisinopril", "Taken")
            
            # Step 5: Check summary (Doctor/Patient)
            get_patient_summary(patient_id)
            
            print(f"\n✅ Complete flow test finished!")
            print(f"Patient Dashboard URL: http://localhost:8000/frontend/patient.html?id={patient_id}")
            print("Use this URL to test the patient dashboard in browser")