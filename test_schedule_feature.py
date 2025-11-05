import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"

def test_schedule_feature():
    """Test the new schedule feature"""
    print("Testing Schedule Feature")
    print("=" * 30)
    
    # Create a patient
    patient_data = {
        "name": "Schedule Test Patient",
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
    print(f"✅ Created patient with ID: {patient_id}")
    
    # Create a treatment with schedule
    treatment_data = {
        "patient_id": patient_id,
        "medication": "Metformin",
        "dosage": "500mg",
        "frequency": "2x daily",
        "start_date": datetime.now().strftime("%Y-%m-%d"),
        "schedule_days": ["Monday", "Wednesday", "Friday"]
    }
    
    response = requests.post(
        f"{BASE_URL}/api/treatment/new",
        headers={"Content-Type": "application/json"},
        data=json.dumps(treatment_data)
    )
    
    result = response.json()
    if not result.get("success"):
        print("Failed to create treatment")
        print(result)
        return
        
    print("✅ Created treatment with schedule")
    print(f"   Scheduled Days: {', '.join(treatment_data['schedule_days'])}")
    
    # Check patient data with treatments
    response = requests.get(f"{BASE_URL}/api/patient/{patient_id}")
    result = response.json()
    print("✅ Patient data with treatments retrieved")
    
    # Log some doses for different days
    today = datetime.now()
    yesterday = today - timedelta(days=1)
    day_before_yesterday = today - timedelta(days=2)
    
    # Log a taken dose for today
    dose_data = {
        "patient_id": patient_id,
        "medication": "Metformin",
        "status": "Taken",
        "date": today.strftime("%Y-%m-%d")
    }
    
    response = requests.post(
        f"{BASE_URL}/api/log_dose",
        headers={"Content-Type": "application/json"},
        data=json.dumps(dose_data)
    )
    
    result = response.json()
    print(f"✅ Logged taken dose for {today.strftime('%Y-%m-%d')}")
    
    # Log a missed dose for yesterday
    dose_data = {
        "patient_id": patient_id,
        "medication": "Metformin",
        "status": "Missed",
        "date": yesterday.strftime("%Y-%m-%d")
    }
    
    response = requests.post(
        f"{BASE_URL}/api/log_dose",
        headers={"Content-Type": "application/json"},
        data=json.dumps(dose_data)
    )
    
    result = response.json()
    print(f"✅ Logged missed dose for {yesterday.strftime('%Y-%m-%d')}")
    
    # Log another missed dose for day before yesterday
    dose_data = {
        "patient_id": patient_id,
        "medication": "Metformin",
        "status": "Missed",
        "date": day_before_yesterday.strftime("%Y-%m-%d")
    }
    
    response = requests.post(
        f"{BASE_URL}/api/log_dose",
        headers={"Content-Type": "application/json"},
        data=json.dumps(dose_data)
    )
    
    result = response.json()
    print(f"✅ Logged missed dose for {day_before_yesterday.strftime('%Y-%m-%d')}")
    
    # Check patient summary
    response = requests.get(f"{BASE_URL}/api/summary/{patient_id}")
    result = response.json()
    print("\n📋 Patient Summary:")
    print(f"   Name: {result['data']['name']}")
    print(f"   Adherence: {result['data']['adherence']}%")
    print(f"   Risk Level: {result['data']['risk_label']}")
    print(f"   Feedback: {result['data']['feedback']}")
    
    # Show missed days information
    if 'missed_days' in result['data'] and result['data']['missed_days']:
        print("\n📅 Missed Days Information:")
        for medication, info in result['data']['missed_days'].items():
            print(f"   Medication: {medication}")
            if info.get('scheduled_days'):
                print(f"     Scheduled Days: {', '.join(info['scheduled_days'])}")
            if info.get('missed_days'):
                missed_dates = [m['date'] for m in info['missed_days']]
                print(f"     Missed Days: {', '.join(missed_dates)}")
            print(f"     Total Missed: {info['total_missed']}")
    
    print(f"\n✅ Test completed successfully!")
    print(f"\n🔗 Patient Dashboard URL:")
    print(f"   http://localhost:8000/frontend/patient.html?id={patient_id}")
    print(f"\n👨‍⚕️ Doctor Dashboard URL:")
    print(f"   http://localhost:8000/frontend/index.html")
    print(f"   (Use Patient ID: {patient_id} to view summary)")

if __name__ == "__main__":
    test_schedule_feature()