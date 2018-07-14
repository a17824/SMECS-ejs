
function iconBuild(icons){
    for (var i=1; i <= 97; i++) {
        icons.push({'iconFilePath': '/public/icons/' + i + '.png', 'iconValue': i});
    }
}

function colorBuild(callback){
    var Color = {
        Data: [
            {RgbValue: 'df514f', ColorName: 'Red', ColorText: 'Red2'},
            {RgbValue: 'CD69C9', ColorName: 'Orchild', ColorText: 'Red2'},
            {RgbValue: 'FF00FF', ColorName: 'Magenta', ColorText: 'Red2'},
            {RgbValue: '2db69c', ColorName: 'Green', ColorText: 'Red2'},
            {RgbValue: '8FBC8F', ColorName: 'Darkseagreen', ColorText: 'Red2'},
            {RgbValue: '76EEC6', ColorName: 'Aquamarine', ColorText: 'Red2'},
            {RgbValue: '307bbc', ColorName: 'Blue', ColorText: 'Red2'},
            {RgbValue: '59c0df', ColorName: 'LightBlue', ColorText: 'Red2'},
            {RgbValue: '6A5ACD', ColorName: 'Slateblue', ColorText: 'Red2'},
            {RgbValue: 'efad4f', ColorName: 'Orange', ColorText: 'Red2'},
            {RgbValue: 'FFD700', ColorName: 'Gold', ColorText: 'Red2'},
            {RgbValue: 'fdfd96 ', ColorName: 'Yellow', ColorText: 'Red2'},
            {RgbValue: '000000', ColorName: 'Black', ColorText: 'Red2'}
            //{RgbValue: 'FFFFFF', ColorName: 'White'},



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