import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def check_feedback_table():
    """Check the structure of the ai_feedback table"""
    try:
        # Check what's in the table
        response = supabase.table("ai_feedback").select("*").limit(5).execute()
        print("Current feedback table contents:")
        print(response.data)
        
        # Check table structure
        print("\nChecking table structure...")
        # This is a workaround since we can't directly query the schema
        try:
            # Try to insert a simple record
            test_data = {
                "feedback": "Test feedback message"
            }
            response = supabase.table("ai_feedback").insert(test_data).execute()
            print("Insert without specific columns succeeded")
            print(response.data)
        except Exception as e:
            print(f"Insert failed: {e}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_feedback_table()