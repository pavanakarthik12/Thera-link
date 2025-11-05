import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def check_table_structure():
    """Check the structure of the tables"""
    try:
        # Check patients table structure
        print("Checking patients table...")
        # Insert a test patient to see what columns are available
        patient_data = {
            "name": "Test Patient",
            "age": 30,
            "gender": "Male",
            "condition": "Test Condition"
        }
        
        response = supabase.table("patients").insert(patient_data).execute()
        print("Patient insert response:")
        print(response.data)
        
        # Get the inserted patient to see all columns
        if response.data:
            patient_id = response.data[0]["id"]
            patient_response = supabase.table("patients").select("*").eq("id", patient_id).execute()
            print("Patient data structure:")
            print(patient_response.data[0])
            
            # Clean up
            supabase.table("patients").delete().eq("id", patient_id).execute()
        
        # Check treatments table structure
        print("\nChecking treatments table...")
        # First create a patient to link to
        patient_data = {
            "name": "Test Patient",
            "age": 30,
            "gender": "Male",
            "condition": "Test Condition"
        }
        
        patient_response = supabase.table("patients").insert(patient_data).execute()
        if patient_response.data:
            patient_id = patient_response.data[0]["id"]
            
            # Now create a treatment
            treatment_data = {
                "patient_id": patient_id,
                "medication": "Test Med",
                "dosage": "10mg",
                "frequency": "1x daily",
                "start_date": "2025-11-05"
            }
            
            response = supabase.table("treatments").insert(treatment_data).execute()
            print("Treatment insert response:")
            print(response.data)
            
            # Get the inserted treatment to see all columns
            if response.data:
                treatment_id = response.data[0]["id"]
                treatment_response = supabase.table("treatments").select("*").eq("id", treatment_id).execute()
                print("Treatment data structure:")
                print(treatment_response.data[0])
                
                # Clean up
                supabase.table("treatments").delete().eq("id", treatment_id).execute()
            
            # Clean up patient
            supabase.table("patients").delete().eq("id", patient_id).execute()
            
        # Check dose_logs table structure
        print("\nChecking dose_logs table...")
        # First create a patient to link to
        patient_data = {
            "name": "Test Patient",
            "age": 30,
            "gender": "Male",
            "condition": "Test Condition"
        }
        
        patient_response = supabase.table("patients").insert(patient_data).execute()
        if patient_response.data:
            patient_id = patient_response.data[0]["id"]
            
            # Now create a dose log
            dose_data = {
                "patient_id": patient_id,
                "medication": "Test Med",
                "status": "Taken"
            }
            
            response = supabase.table("dose_logs").insert(dose_data).execute()
            print("Dose log insert response:")
            print(response.data)
            
            # Get the inserted dose log to see all columns
            if response.data:
                dose_id = response.data[0]["id"]
                dose_response = supabase.table("dose_logs").select("*").eq("id", dose_id).execute()
                print("Dose log data structure:")
                print(dose_response.data[0])
                
                # Clean up
                supabase.table("dose_logs").delete().eq("id", dose_id).execute()
            
            # Clean up patient
            supabase.table("patients").delete().eq("id", patient_id).execute()
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_table_structure()