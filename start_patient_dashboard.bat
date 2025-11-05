@echo off
echo Starting TheraLink Backend Server
echo =================================
echo.
echo Server will be available at http://127.0.0.1:8000
echo Patient Dashboard: http://127.0.0.1:8000/frontend/patient.html
echo.
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn main:app --reload