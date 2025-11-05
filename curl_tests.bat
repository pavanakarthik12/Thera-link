@echo off
echo Testing TheraLink Backend with curl
echo ==================================
echo.

echo Testing health endpoint...
curl http://127.0.0.1:8000/health
echo.
echo.

echo Testing system test endpoint...
curl http://127.0.0.1:8000/test
echo.
echo.

echo Note: For POST requests, you'll need to manually replace the patient ID in the commands below
echo Example POST commands:
echo curl -X POST http://127.0.0.1:8000/api/patient/new -H "Content-Type: application/json" -d "{\"name\":\"John Doe\",\"age\":30,\"gender\":\"Male\",\"condition\":\"Hypertension\"}"
echo.
echo curl -X POST http://127.0.0.1:8000/api/log_dose -H "Content-Type: application/json" -d "{\"patient_id\":\"PATIENT_UUID\",\"medication\":\"Lisinopril\",\"status\":\"Taken\"}"
echo.
echo curl http://127.0.0.1:8000/api/summary/PATIENT_UUID
echo.

pause