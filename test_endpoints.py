import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    """Test the health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_system():
    """Test the system test endpoint"""
    print("Testing system...")
    response = requests.get(f"{BASE_URL}/test")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def create_patient():
    """Create a new patient"""
    print("Creating patient...")
    patient_data = {
        "name": "John Doe",
        "age": 35,
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
    print()
    return result.get("data", {}).get("id") if result.get("success") else None

def log_dose(patient_id):
    """Log a medication dose"""
    print("Logging dose...")
    dose_data = {
        "patient_id": patient_id,
        "medication": "Metformin 500mg",
        "status": "Taken"
    }
    response = requests.post(
        f"{BASE_URL}/api/log_dose",
        headers={"Content-Type": "application/json"},
        data=json.dumps(dose_data)
    )
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {result}")
    print()

def get_summary(patient_id):
    """Get patient summary"""
    print("Getting patient summary...")
    response = requests.get(f"{BASE_URL}/api/summary/{patient_id}")
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {result}")
    print()

if __name__ == "__main__":
    print("Testing TheraLink Backend Endpoints")
    print("=" * 40)
    
    # Test health endpoint
    test_health()
    
    # Test system
    test_system()
    
    # Create patient
    patient_id = create_patient()
    
    if patient_id:
        # Log dose
        log_dose(patient_id)
        
        # Get summary
        get_summary(patient_id)
    
    print("Testing completed!")