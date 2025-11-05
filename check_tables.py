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
        
        # Check dose_logs table structure
        print("\nChecking dose_logs table...")
        dose_data = {
            "patient_id": "test-id",
            "medication": "Test Med",
            "status": "Taken"
        }
        
        response = supabase.table("dose_logs").insert(dose_data).execute()
        print("Dose log insert response:")
        print(response.data)
        
        # Clean up
        if response.data:
            dose_id = response.data[0]["id"]
            supabase.table("dose_logs").delete().eq("id", dose_id).execute()
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_table_structure()