@echo off

setlocal enableextensions enabledelayedexpansion



REM Creating the folder path for restore

SET "backupFolder2=%C:\Users\Banshee\Desktop\SMECS\backup\alertSentInfo%"
SET "backupFolder3=%C:\Users\Banshee\Desktop\SMECS\backup\floorPlans%"
SET "backupFolder4=%C:\Users\Banshee\Desktop\SMECS\backup\photosStudents%"
SET "backupFolder5=%C:\Users\Banshee\Desktop\SMECS\backup\photosUsers%"

SET "folderToPaste2=%C:\Users\Banshee\Desktop\SMECS\public\alertSentInfo%"
SET "folderToPaste3=%C:\Users\Banshee\Desktop\SMECS\public\floorPlans%"
SET "folderToPaste4=%C:\Users\Banshee\Desktop\SMECS\public\photosStudents%"
SET "folderToPaste5=%C:\Users\Banshee\Desktop\SMECS\public\photosUsers%"

REM Deletes Folders before copy
REM this is the command to delete folders before copy them: @RD /S /Q "D:\PHP_Projects\testproject\Release\testfolder"


REM Copy files to the folder path

robocopy %backupFolder2% "%folderToPaste2%" /E
robocopy %backupFolder3% "%folderToPaste3%" /E
robocopy %backupFolder4% "%folderToPaste4%" /E
robocopy %backupFolder5% "%folderToPaste5%" /E


ECHO copy completed successfully.

