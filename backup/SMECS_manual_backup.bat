@echo off

setlocal enableextensions enabledelayedexpansion

:: Preserve only the %MAXBACKUPS% most recent backups.
set "MAXBACKUPS=100"
set "delMsg="
for /f "skip=%MAXBACKUPS% delims=" %%a in (
  'dir "C:\Users\Banshee\Desktop\SMECS\backup\_database\*" /t:c /a:d /o:-d /b'
) do (
  if not defined delMsg (
    set delMsg=1
    echo More than %MAXBACKUPS% found - only the %MAXBACKUPS% most recent folders will be preserved.
  )
  rd /s /q "C:\Users\Banshee\Desktop\SMECS\backup\_database\%%a"
)


REM Creating the folder path for backup

SET "folderPath=%C:\Users\Banshee\Desktop\SMECS\backup\_database\%"
SET "folderPath1=%C:\Users\Banshee\Desktop\SMECS\backup\%"
SET "folderPath2=%C:\Users\Banshee\Desktop\SMECS\public\alertSentInfo\%"
SET "folderPath3=%C:\Users\Banshee\Desktop\SMECS\public\floorPlans\%"
SET "folderPath4=%C:\Users\Banshee\Desktop\SMECS\public\photosStudents\%"
SET "folderPath5=%C:\Users\Banshee\Desktop\SMECS\public\photosUsers\%"

for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"

set "datestamp=%YYYY%%MM%%DD%" & set "timestamp=%HH%%Min%%Sec%"
set "folderName=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%_ManualBackup"
set "folderName2=alertSentInfo"
set "folderName3=floorPlans"
set "folderName4=photosStudents"
set "folderName5=photosUsers"



SET "backupFolder=%folderPath%%folderName%"
SET "backupFolder2=%folderPath1%%folderName2%"
SET "backupFolder3=%folderPath1%%folderName3%"
SET "backupFolder4=%folderPath1%%folderName4%"
SET "backupFolder5=%folderPath1%%folderName5%"

 
REM Creating Folder. Folder will be created or overwritten if already exists


MKDIR %backupFolder%


REM Backup files to the folder path

robocopy %folderPath2% "%backupFolder2%" /E
robocopy %folderPath3% "%backupFolder3%" /E
robocopy %folderPath4% "%backupFolder4%" /E
robocopy %folderPath5% "%backupFolder5%" /E


CD C:\Program Files\MongoDB\Server\4.0.4\bin

mongodump --port 2999 --username a17824 --password Abington2018 -d SMECS_database --out %backupFolder%

ECHO mongodump completed successfully.

