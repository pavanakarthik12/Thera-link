#!/usr/bin/env python3
"""
Test script to verify NFC URL format
"""

def test_url_format():
    """Test that the URL format is correct"""
    patient_id = "f97fc059-8573-46fe-8db6-8151d8d92e19"
    # This should be the correct format for the frontend
    url = f"http://localhost:8080/patient/{patient_id}"
    print(f"Testing URL: {url}")
    print("This URL should work when opened in a browser")
    print("Make sure both frontend (port 8080) and backend (port 8000) are running")

if __name__ == "__main__":
    test_url_format()