@echo off
echo Starting DataLens — Hotel Booking Dashboard...
echo.

REM Start backend in a new window
start "DataLens Backend" cmd /k "uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000"

REM Give backend a moment to start
timeout /t 3 /nobreak >nul

REM Install frontend deps if needed, then start frontend
echo Starting frontend...
cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install
)
start "DataLens Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ==============================================
echo  DataLens is starting up!
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:8000/docs
echo ==============================================
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
pause
