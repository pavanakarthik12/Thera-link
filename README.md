# TheraLink Backend

A FastAPI backend for medication adherence tracking with AI feedback.

## Features

- Patient management
- Treatment tracking
- Medication dose logging
- AI-powered motivational feedback
- Risk prediction using ML
- Doctor dashboard (HTML test interface)
- Patient dashboard (for patients to track their medications)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file with your credentials:
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints

| Endpoint             | Method | Description                              |
| -------------------- | ------ | ---------------------------------------- |
| `/health`            | GET    | Health check                             |
| `/test`              | GET    | Test all systems                         |
| `/api/patient/new`   | POST   | Create new patient                       |
| `/api/patient/{id}`  | GET    | Get patient details and prescriptions    |
| `/api/treatment/new` | POST   | Add prescription                         |
| `/api/log_dose`      | POST   | Add medication log                       |
| `/api/summary/{id}`  | GET    | Fetch adherence %, risk label, and feedback |

## Frontend

1. Doctor Dashboard (for testing API endpoints):
   Open `frontend/index.html` in your browser

2. Patient Dashboard (for patients to track medications):
   Open `frontend/patient.html` in your browser

## Testing

Run the test script to create sample data:
```bash
python test_patient_dashboard.py
```

This will create a sample patient with prescriptions that you can use to test the patient dashboard.