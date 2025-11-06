# TheraLink NFC Integration Guide

## Overview
TheraLink now supports NFC linking for patient dashboards. Each patient can have their unique dashboard URL written to an NFC tag for quick access.

## NFC Features

### 1. Patient Dashboard NFC Access
- Patients can tap their NFC tag to open their personalized dashboard
- Works on Android devices with Chrome browser
- Fallback message for unsupported devices

### 2. Doctor NFC Link Generation
- Doctors can copy the NFC link for any patient directly from the dashboard
- Links follow the format: `http://localhost:8000/patient/<patient_id>`

### 3. Local NFC Writer Utility
- Command-line tool to write patient URLs to NFC tags
- Pulls patient data directly from Supabase
- Real-time confirmation of successful writes

## Setup Instructions

### 1. Install NFC Dependencies
```bash
pip install -r requirements.txt
```

This will install `nfcpy` library needed for NFC operations.

### 2. NFC Writer Utility Usage
Run the NFC writer utility:
```bash
python nfc_writer.py
```

Follow the prompts:
1. Select a patient from the list
2. Confirm the URL to write
3. Tap an NFC tag to write the URL

### 3. Patient Dashboard NFC Support
The patient dashboard automatically detects NFC capability:
- If supported: "Your device supports NFC. Tap your TheraLink card to open this dashboard."
- If not supported: "Tap your TheraLink card or manually enter your patient ID."

### 4. Doctor Dashboard NFC Links
In the patient list, doctors can:
- Click "View" to see detailed patient information
- Click "NFC Link" to copy the patient's dashboard URL to clipboard

## Technical Implementation

### Web NFC Reading (Patient Dashboard)
```javascript
if ('NDEFReader' in window) {
  const reader = new NDEFReader();
  reader.scan().then(() => {
    reader.onreading = event => {
      const record = event.message.records[0];
      const url = new TextDecoder().decode(record.data);
      if (url.includes("/patient/")) {
        window.location.href = url;
      }
    };
  }).catch(err => console.log("NFC unavailable:", err));
}
```

### NFC Writing (Python Utility)
```python
import nfc

def write_nfc_tag(patient_url):
    def on_connect(tag):
        tag.ndef.message = nfc.ndef.Message(nfc.ndef.UriRecord(patient_url))
        print(f"✅ NFC Tag written: {patient_url}")
        return True

    with nfc.ContactlessFrontend('usb') as clf:
        clf.connect(rdwr={'on-connect': on_connect})
```

## Testing NFC Features

### Prerequisites
1. NFC-enabled Android device (Chrome browser)
2. NFC tags (NTAG213 or similar)
3. NFC reader/writer hardware (ACR122U, PN532, etc.)

### Test Flow
1. Start the backend server: `uvicorn main:app --reload`
2. Start the frontend: `npm run dev`
3. Register a new patient in the doctor dashboard
4. Run the NFC writer utility: `python nfc_writer.py`
5. Select the patient and write to an NFC tag
6. Tap the NFC tag on an Android device to open the patient dashboard

## Troubleshooting

### NFC Not Detected
- Ensure NFC is enabled on your device
- Check that your NFC reader is properly connected
- Verify NFC tags are compatible (NTAG213 recommended)

### URL Not Opening
- Confirm the backend server is running on `localhost:8000`
- Check that the patient ID in the URL is valid
- Verify the patient exists in the database

### Permission Issues
- On Windows, run the NFC utility as Administrator
- On Linux, ensure proper USB permissions for NFC reader
- On macOS, install libusb if prompted

## Security Notes
- NFC tags store only URLs, no personal data
- All links remain local (localhost), no external exposure
- Patient IDs are validated on the backend before returning data
- Future deployment will replace localhost with HTTPS domains