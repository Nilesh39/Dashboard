@echo off
echo ===================================================
echo Starting Instagram Analytics Suite...
echo ===================================================

echo Launching Backend FastAPI Server (Port 8000)...
start cmd /k "cd backend && python run.py"

echo Launching Frontend React Server (Port 5173)...
start cmd /k "cd frontend && npm run dev"

echo Done! Both servers are initializing in separate windows.
echo - Backend URL: http://localhost:8000
echo - Frontend URL: http://localhost:5173
echo ===================================================
pause
