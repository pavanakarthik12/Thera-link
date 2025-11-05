@echo off
echo Starting TheraLink Backend Server...
echo ====================================
echo Make sure you're in the theralink-backend directory
echo Press Ctrl+C to stop the server
echo.
python -m uvicorn main:app --reload