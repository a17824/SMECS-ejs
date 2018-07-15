
function iconBuild(icons){
    for (var i=1; i <= 97; i++) {
        icons.push({'iconFilePath': '/public/icons/' + i + '.png', 'iconValue': i});
    }
}

module.exports.groupColorExport = function(callback) {
    colorBuild(function (result) {
        var color = result;
        callback(color);
    });
};


function colorBuild(callback){
    var Color = {
        Data: [
            {RgbValue: 'df514f', ColorName: 'Red', ColorText: 'FFFFFF'},
            {RgbValue: 'CD69C9', ColorName: 'Orchild', ColorText: 'FFFFFF'},
            {RgbValue: 'FF00FF', ColorName: 'Magenta', ColorText: 'FFFFFF'},
            {RgbValue: '2db69c', ColorName: 'Green', ColorText: 'FFFFFF'},
            {RgbValue: '8FBC8F', ColorName: 'Darkseagreen', ColorText: 'FFFFFF'},
            {RgbValue: '76EEC6', ColorName: 'Aquamarine', ColorText: 'FFFFFF'},
            {RgbValue: '307bbc', ColorName: 'Blue', ColorText: 'FFFFFF'},
            {RgbValue: '59c0df', ColorName: 'LightBlue', ColorText: 'FFFFFF'},
            {RgbValue: '6A5ACD', ColorName: 'Slateblue', ColorText: 'FFFFFF'},
            {RgbValue: 'efad4f', ColorName: 'Orange', ColorText: 'FFFFFF'},
            {RgbValue: 'FFD700', ColorName: 'Gold', ColorText: 'FFFFFF'},
            {RgbValue: 'fdfd96 ', ColorName: 'Yellow', ColorText: '000000'},
            {RgbValue: '000000', ColorName: 'Black', ColorText: 'FFFFFF'}
            //{RgbValue: 'FFFFFF', ColorName: 'White'},



        ]
    };
    callback(Color);
}

module.exports.soundBuild = function(callback) {
    var sound = [];

    var soundID = [
        1,
        2,
        3

    ];

    var soundType = [
        'Animals',
        'Sirens',
        'misc'
    ];

    var animals = [

        'Animals','Fire Truck Horn','fire_truck_air_horn',
        'Animals','Railroad Crossing Bell','railroad',
        'Animals','Missile Alert','bomb_siren',
        'Animals','Crazy Brain','crazy_brain',
        'Animals','Tornado Siren II','tornado',
        'Animals','Wake Up Call','wake_up',
        'Animals','Wake Up Call','wake_up',
        'Animals','Wake Up Call','wake_up'

    ];

    var sirens = [
        'Sirens','Alien Siren','alien_siren',
        'Sirens','Car Alarm','car_alarm',
        'Sirens','School Fire Alarm','fire_alarm',
        'Sirens','Ambulance','police',
        'Sirens','Mandatory Evacuation','gentex',
        'Sirens','Train Whistle','train_whistle',
        'Animals','Wake Up Call','wake_up',
        'Animals','Wake Up Call','wake_up'

    ];

    var misc = [
        'Misc','Eas Beep','eas_beep',
        'Misc','Sunday Church Ambiance','church'

    ];

    sound.push(soundID);
    sound.push(soundType);
    sound.push(animals);
    sound.push(sirens);
    sound.push(misc);
    callback(sound);
};