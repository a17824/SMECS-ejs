
function iconBuild(icons){
    for (var i=1; i <= 97; i++) {
        icons.push({'iconFilePath': '/public/icons/' + i + '.png', 'iconValue': i});
    }
}

function colorBuild(callback){
    var Color = {
        Data: [
            {RgbValue: 'ff0000', ColorName: 'Red'},
            {RgbValue: '008000', ColorName: 'Green'},
            {RgbValue: '0000FF', ColorName: 'Blue'},
            {RgbValue: 'FFFF00', ColorName: 'Yellow'},
            {RgbValue: 'FFD700', ColorName: 'Gold'},
            {RgbValue: '000000', ColorName: 'Black'},
            //{RgbValue: 'FFFFFF', ColorName: 'White'},
            {RgbValue: 'FF00FF', ColorName: 'Magenta'},
            {RgbValue: 'FFA500', ColorName: 'Orange'},
            {RgbValue: '76EEC6', ColorName: 'Aquamarine'},
            {RgbValue: '4682B4', ColorName: 'Steelblue'},
            {RgbValue: 'CD69C9', ColorName: 'Orchild'},
            {RgbValue: '6A5ACD', ColorName: 'Slateblue'},
            {RgbValue: '8FBC8F', ColorName: 'Darkseagreen'}
        ]
    };
    callback(Color);
}

module.exports.soundBuild = function(callback) {
    var sound = [];

    var soundTypeId = [
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

    sound.push(soundTypeId);
    sound.push(soundType);
    sound.push(animals);
    sound.push(sirens);
    sound.push(misc);

    callback(sound);
};