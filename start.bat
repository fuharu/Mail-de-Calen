@echo off
echo Starting Mail de Calen...

echo Starting backend server...
start "Backend Server" cmd /k "cd backend && python main.py"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting frontend server...
start "Frontend Server" cmd /k "npm start"

echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs

pause
