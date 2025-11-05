@echo off
echo Starting TheraLink Backend Server
echo =================================
echo.
echo Server will be available at http://127.0.0.1:8000
echo Doctor Dashboard: http://127.0.0.1:8000/frontend/index.html
echo Patient Dashboard: http://127.0.0.1:8000/frontend/patient.html?id=PATIENT_ID
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "c:\Users\pavan\OneDrive\Desktop\theralink-backend"
python -m uvicorn main:app --reload