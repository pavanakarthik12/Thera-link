#!/usr/bin/env python3
"""
NFC Writer Utility for TheraLink
Writes patient dashboard URLs to NFC tags
"""

import nfc
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_supabase_client() -> Client:
    """Initialize Supabase client"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file")
    return create_client(url, key)

def write_nfc_tag(patient_url: str) -> bool:
    """
    Write patient URL to NFC tag
    """
    try:
        def on_connect(tag):
            # Create NDEF message with URL
            message = nfc.ndef.Message(nfc.ndef.UriRecord(patient_url))
            tag.ndef.message = message
            print(f"✅ NFC Tag written successfully!")
            print(f"URL: {patient_url}")
            return True

        # Connect to NFC reader
        with nfc.ContactlessFrontend('usb') as clf:
            print("🔍 Waiting for NFC tag... Tap the tag to write.")
            clf.connect(rdwr={'on-connect': on_connect})
            return True
            
    except Exception as e:
        print(f"❌ Error writing NFC tag: {e}")
        return False

def list_patients():
    """List all patients from Supabase"""
    try:
        supabase = get_supabase_client()
        response = supabase.table("patients").select("id, name").execute()
        return response.data
    except Exception as e:
        print(f"❌ Error fetching patients: {e}")
        return []

def main():
    """Main NFC writer utility"""
    print("📱 TheraLink NFC Writer Utility")
    print("=" * 40)
    
    # List patients
    patients = list_patients()
    if not patients:
        print("❌ No patients found in database")
        return
    
    print("\n📋 Available Patients:")
    for i, patient in enumerate(patients, 1):
        print(f"{i}. {patient['name']} (ID: {patient['id'][:8]}...)")
    
    # Get user selection
    try:
        choice = int(input(f"\nSelect patient (1-{len(patients)}): ")) - 1
        if choice < 0 or choice >= len(patients):
            print("❌ Invalid selection")
            return
        
        selected_patient = patients[choice]
        # Use the frontend port (8081) for the patient dashboard URL
        patient_url = f"http://localhost:8081/patient/{selected_patient['id']}"
        
        print(f"\n📝 Selected Patient: {selected_patient['name']}")
        print(f"🔗 URL to write: {patient_url}")
        
        # Confirm before writing
        confirm = input("\nWrite this URL to NFC tag? (y/N): ").lower()
        if confirm != 'y':
            print("❌ Operation cancelled")
            return
        
        # Write to NFC tag
        success = write_nfc_tag(patient_url)
        if success:
            print("\n🎉 NFC tag written successfully!")
            print("✅ Patient can now tap this tag to open their dashboard")
        else:
            print("\n❌ Failed to write NFC tag")
            
    except ValueError:
        print("❌ Invalid input. Please enter a number.")
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")

if __name__ == "__main__":
    main()