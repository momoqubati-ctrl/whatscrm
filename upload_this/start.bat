@echo off
chcp 65001 > nul
title WhatSCRM Server
echo ========================================================
echo               WhatSCRM Server
echo ========================================================
echo.
cd /d "%~dp0"

echo [1/2] Checking Database connection and tables...
node database/import_db.js

echo.
echo [2/2] Starting WhatSCRM Server on port 3004...
node server.js
pause
