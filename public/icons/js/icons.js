
function iconBuild(icons){
    for (var i=1; i <= 173; i++) {
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
            {RgbValue: '000000', ColorName: 'Black', ColorText: 'FFFFFF'},
            {RgbValue: 'FFFFFF', ColorName: 'White', ColorText: '000000'}



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

        'Animals','Dog','dog',
        'Animals','Rooster','rooster',
        'Animals','Elephant','elephant',
        'Animals','Chimpanzee','chimpanzee',
        'Animals','Cat','cat',
        'Animals','Wolf','wolf',
        'Animals','Hawk','hawk'

    ];

    var sirens = [
        'Sirens','Alien Siren','alien_siren',
        'Sirens','School Fire Alarm','fire_alarm',
        'Sirens','Ambulance','police',
        'Sirens','Mandatory Evacuation','gentex',
        'Sirens','Train Whistle','train_whistle',
        'Sirens','Police Siren Sound','police_siren',
        'Sirens','Fire Trucks Sirens','fire_trucks2'

    ];

    var misc = [
        'Misc','Eas Beep','eas_beep',
        'Misc','Sunday Church Ambiance','church',
        'Misc','Car Alarm','car_alarm',
        'Misc','Crazy Brain','crazy_brain',
        'Misc','Railroad','railroad',
        'Misc','Tornado','tornado',
        'Misc','Boat','boat'

    ];

    sound.push(soundID);
    sound.push(soundType);
    sound.push(animals);
    sound.push(sirens);
    sound.push(misc);
    callback(sound);
};