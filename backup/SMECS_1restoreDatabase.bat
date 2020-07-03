@echo off

setlocal enableextensions enabledelayedexpansion

set folderToRestore=%1
echo folderToRestore equals %folderToRestore%


SET "folderPath1=%C:\Users\Banshee\Desktop\SMECS\backup\_database\%"
SET "folderPath2=%folderPath1%%folderToRestore%"
SET "folderPath3=SMECS_database"
SET "finalPath=%folderPath1%%folderToRestore%\%folderPath3%"
echo finalPath equals %finalPath%


CD C:\Program Files\MongoDB\Server\4.0.4\bin
mongorestore --drop --port 2999 -u a17824 -p Abington2018 -d SMECS_database %finalPath%

ECHO mongodump completed successfully.

