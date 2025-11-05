from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from routers import patients, treatments, logs, summary

# Import database and AI modules
from database import supabase
from ai_model import generate_ai_feedback, create_and_save_risk_model
import joblib

app = FastAPI(title="TheraLink Backend", description="Medication adherence tracking with AI feedback")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(patients.router)
app.include_router(treatments.router)
app.include_router(logs.router)
app.include_router(summary.router)

@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}

@app.get("/test")
async def test_system():
    """
    Test all system components: Supabase connection, Gemini API, and ML model.
    """
    try:
        # Test Supabase connection by querying patients table
        supabase.table("patients").select("id").limit(1).execute()
        supabase_status = "OK"
    except Exception as e:
        supabase_status = f"ERROR: {str(e)}"
    
    try:
        # Test Gemini API
        test_feedback = generate_ai_feedback(80, "Medium")
        gemini_status = "OK" if test_feedback else "ERROR"
    except Exception as e:
        gemini_status = f"ERROR: {str(e)}"
    
    try:
        # Test ML model
        try:
            # Try to load existing model
            model = joblib.load('risk_model.pkl')
            ml_status = "OK"
        except FileNotFoundError:
            # If model doesn't exist, create it
            create_and_save_risk_model()
            ml_status = "OK - Model created"
    except Exception as e:
        ml_status = f"ERROR: {str(e)}"
    
    return {
        "supabase": supabase_status,
        "gemini_api": gemini_status,
        "ml_model": ml_status,
        "message": "System test completed"
    }

# Create ML model on startup if it doesn't exist
@app.on_event("startup")
async def startup_event():
    """
    Create ML model on startup if it doesn't exist.
    """
    try:
        joblib.load('risk_model.pkl')
    except FileNotFoundError:
        create_and_save_risk_model()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)