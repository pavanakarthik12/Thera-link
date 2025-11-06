#!/usr/bin/env python3
"""
Verify NFC URL format
"""

def verify_url_format():
    """Verify that the URL format matches the expected route"""
    patient_id = "f97fc059-8573-46fe-8db6-8151d8d92e19"
    
    # This is the URL that should be written to the NFC tag
    nfc_url = f"http://localhost:8080/patient/{patient_id}"
    
    # This is the route pattern in App.tsx
    route_pattern = "/patient/:id"
    
    print(f"NFC URL: {nfc_url}")
    print(f"Route pattern: {route_pattern}")
    
    # Check if the URL matches the route pattern
    # The URL should be: http://localhost:8080/patient/{uuid}
    # Which should match the route: /patient/:id
    
    from urllib.parse import urlparse
    parsed = urlparse(nfc_url)
    
    print(f"Parsed URL path: {parsed.path}")
    
    # Check if the path starts with /patient/
    if parsed.path.startswith("/patient/"):
        # Extract the patient ID part
        path_parts = parsed.path.split("/")
        if len(path_parts) >= 3 and path_parts[1] == "patient" and path_parts[2]:
            print("✅ URL format is correct")
            print(f"Patient ID: {path_parts[2]}")
        else:
            print("❌ URL format is incorrect - patient ID missing")
    else:
        print("❌ URL format is incorrect - doesn't start with /patient/")

if __name__ == "__main__":
    verify_url_format()