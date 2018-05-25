
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

        'Animals','Fire Truck Horn','fire-truck-air-horn_daniel-simion',
        'Animals','Railroad Crossing Bell','railroad_crossing_bell-Brylon_Terry-1551570865',
        'Animals','Missile Alert','BOMB_SIREN-BOMB_SIREN-247265934',
        'Animals','Crazy Brain','Crazy_Brain-Mike_Koenig-1457119440',
        'Animals','Tornado Siren II','Tornado_Siren_II-Delilah-747233690',
        'Animals','Wake Up Call','Wake Up Call-SoundBible.com-1842390350',
        'Animals','Wake Up Call','Wake Up Call-SoundBible.com-1842390350',
        'Animals','Wake Up Call','Wake Up Call-SoundBible.com-1842390350'

    ];

    var sirens = [
        'Sirens','Alien Siren','Alien_Siren-KevanGC-610357990',
        'Sirens','Car Alarm','Car Alarm-SoundBible.com-2096911689',
        'Sirens','School Fire Alarm','School_Fire_Alarm-Cullen_Card-202875844',
        'Sirens','Ambulance','Police-TheCristi95-214716303',
        'Sirens','Mandatory Evacuation','gentex_cammander_3_code_3_horn-Brandon-938131891',
        'Sirens','Train Whistle','Train Whistle-SoundBible.com-458982136',
        'Animals','Wake Up Call','Wake Up Call-SoundBible.com-1842390350',
        'Animals','Wake Up Call','Wake Up Call-SoundBible.com-1842390350'

    ];

    var misc = [
        'Misc','Eas Beep','Eas Beep-SoundBible.com-238025417',
        'Misc','Sunday Church Ambiance','Sunday Church Ambiance-SoundBible.com-974744686'

    ];

    sound.push(soundTypeId);
    sound.push(soundType);
    sound.push(animals);
    sound.push(sirens);
    sound.push(misc);

    callback(sound);
};