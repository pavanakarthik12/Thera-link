import requests
import json
import uuid
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

def create_test_patient():
    """Create a test patient"""
    print("Creating test patient...")
    patient_data = {
        "name": "Ravi Kumar",
        "age": 45,
        "gender": "Male",
        "condition": "Diabetes"
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
        "medication": "Metformin",
        "dosage": "500mg",
        "frequency": "2x daily",
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

def create_second_treatment(patient_id):
    """Create a second test treatment for the patient"""
    print("\nCreating second test treatment...")
    treatment_data = {
        "patient_id": patient_id,
        "medication": "Vitamin D",
        "dosage": "1000 IU",
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

def test_get_patient_with_treatments(patient_id):
    """Test the new endpoint to get patient with treatments"""
    print("\nTesting get patient with treatments...")
    response = requests.get(f"{BASE_URL}/api/patient/{patient_id}")
    
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    return result.get("success", False)

if __name__ == "__main__":
    print("Testing TheraLink Patient Dashboard Backend")
    print("=" * 50)
    
    # Create patient
    patient_id = create_test_patient()
    
    if patient_id:
        # Create treatments
        treatment1_success = create_test_treatment(patient_id)
        treatment2_success = create_second_treatment(patient_id)
        
        if treatment1_success and treatment2_success:
            # Test the new endpoint
            test_get_patient_with_treatments(patient_id)
            
            print(f"\nNow you can test the patient dashboard with Patient ID: {patient_id}")
            print("Open frontend/patient.html in your browser and enter this ID")