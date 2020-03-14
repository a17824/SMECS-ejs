//Dependencies
var spawn = require('child_process').spawn,
    ls    = spawn('cmd.exe', ["/c", `backup\\SMECS_auto_backup.bat`],{env: process.env});







module.exports.backup = function (){

    ls.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    ls.on('exit', function (code) {
        console.log('child process exited with code ' + code);
    });
};
