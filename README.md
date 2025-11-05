# TheraLink Backend

A FastAPI backend for medication adherence tracking with AI feedback.

## Features

- Patient management
- Treatment tracking
- Medication dose logging
- AI-powered motivational feedback
- Risk prediction using ML
- Simple HTML frontend for testing

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
| `/api/treatment/new` | POST   | Add prescription                         |
| `/api/log_dose`      | POST   | Add medication log                       |
| `/api/summary/{id}`  | GET    | Fetch adherence %, risk label, and feedback |

## Frontend

Open `frontend/index.html` in your browser to test the API endpoints.

## Testing with curl

```bash
# Health check
curl http://127.0.0.1:8000/health

# Create new patient
curl -X POST http://127.0.0.1:8000/api/patient/new \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","age":30,"gender":"Male","condition":"Hypertension"}'

# Log a dose
curl -X POST http://127.0.0.1:8000/api/log_dose \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"PATIENT_UUID","medication":"Lisinopril","status":"Taken"}'

# Fetch summary
curl http://127.0.0.1:8000/api/summary/PATIENT_UUID
```

## Note on Supabase Tables

The application expects the following tables to exist in your Supabase database:

1. `patients` - with columns for patient information
2. `treatments` - for prescription information
3. `dose_logs` - for medication dose tracking
4. `ai_feedback` - for storing AI-generated feedback

If you encounter issues with table structures, you may need to adjust the column names in the code to match your existing table schema.