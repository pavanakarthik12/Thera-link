# TheraLink Backend

A FastAPI backend for medication adherence tracking with AI feedback.

## Features

- Patient management
- Treatment tracking
- Medication dose logging
- AI-powered motivational feedback
- Risk prediction using ML
- Doctor dashboard (for medical professionals)
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

1. Doctor Dashboard (for medical professionals):
   Open `frontend/index.html` in your browser

2. Patient Dashboard (for patients to track medications):
   Open `frontend/patient.html?id=PATIENT_ID` in your browser
   Or use the patient link generated in the doctor dashboard

## Testing

Run the test script to create sample data and test the complete flow:
```bash
python test_complete_flow.py
```

This will create a sample patient with prescriptions and demonstrate the complete workflow between doctor and patient dashboards.

## Architecture

### Roles and Permissions

| Role    | Permissions                    | Description                                  |
|---------|--------------------------------|----------------------------------------------|
| Doctor  | Add patients, assign medications | Register new patients, assign prescriptions, view progress |
| Patient | Log dose adherence             | View prescriptions, mark doses as Taken/Missed |

### Data Flow

1. **Doctor Registration Flow**
   - Doctor creates a new patient via `POST /api/patient/new`
   - Doctor assigns medications via `POST /api/treatment/new`
   - Backend saves both to Supabase
   - After creation, the backend provides a unique patient link

2. **Patient Update Flow**
   - Patient opens their unique link
   - The page calls `GET /api/patient/{id}` for info + prescriptions
   - Each medication has "Taken" | "Missed" buttons
   - When patient clicks a button: `POST /api/log_dose`
   - Backend logs the dose, recalculates adherence %, updates patients.adherence_percent, predicts risk_label, and stores Gemini feedback

3. **Doctor Monitoring Flow**
   - Doctor dashboard fetches `GET /api/summary/{patient_id}`
   - Shows patient name, age, condition, list of medications, adherence %, risk level, and latest AI motivational feedback
   - Doctor cannot modify doses; they only view them