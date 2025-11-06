#!/usr/bin/env python3
"""
Test script for NFC functionality
"""

def test_nfc_imports():
    """Test that NFC imports work correctly"""
    try:
        import nfc
        print("✅ NFC library imported successfully")
        return True
    except ImportError as e:
        print(f"❌ NFC library import failed: {e}")
        return False

def test_supabase_imports():
    """Test that Supabase imports work correctly"""
    try:
        from supabase import create_client
        print("✅ Supabase library imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Supabase library import failed: {e}")
        return False

def test_environment():
    """Test environment setup"""
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if supabase_url and supabase_key:
        print("✅ Environment variables loaded successfully")
        return True
    else:
        print("❌ Environment variables missing")
        print("   Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env")
        return False

if __name__ == "__main__":
    print("🧪 Testing NFC Functionality Setup")
    print("=" * 40)
    
    tests = [
        test_nfc_imports(),
        test_supabase_imports(),
        test_environment()
    ]
    
    if all(tests):
        print("\n🎉 All tests passed! NFC functionality is ready.")
        print("\nTo use the NFC writer:")
        print("1. Run: python nfc_writer.py")
        print("2. Select a patient")
        print("3. Tap an NFC tag to write the patient URL")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")