
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

    var soundType = [
        'Animals',
        'Sirens',
        'misc'
    ];


    var animals = {
        Animals: [
            {name: 'Fire Truck Horn', mp3: 'fire-truck-air-horn_daniel-simion'},
            {name: 'Railroad Crossing Bell', mp3: 'railroad_crossing_bell-Brylon_Terry-1551570865'},
            {name: 'Missile Alert', mp3: 'BOMB_SIREN-BOMB_SIREN-247265934'},
            {name: 'Crazy Brain', mp3: 'Crazy_Brain-Mike_Koenig-1457119440'},
            {name: 'Tornado Siren II', mp3: 'Tornado_Siren_II-Delilah-747233690'},
            {name: 'Mandatory Evacuation', mp3: 'gentex_cammander_3_code_3_horn-Brandon-938131891'},
            {name: 'Wake Up Call', mp3: 'Wake Up Call-SoundBible.com-1842390350'}


        ]
    };
    var sirens = {
        Sirens: [
            {name: 'Alien Siren', mp3: 'Alien_Siren-KevanGC-610357990'},
            {name: 'Car Alarm', mp3: 'Car Alarm-SoundBible.com-2096911689'},
            {name: 'School Fire Alarm', mp3: 'School_Fire_Alarm-Cullen_Card-202875844'},
            {name: 'Ambulance', mp3: 'Police-TheCristi95-214716303'},
            {name: 'Mandatory Evacuation', mp3: 'gentex_cammander_3_code_3_horn-Brandon-938131891'},
            {name: 'Train Whistle', mp3: 'Train Whistle-SoundBible.com-458982136'}


        ]
    };
    var sirens = {
        Sirens: [
            {name: 'Eas Beep', mp3: 'Eas Beep-SoundBible.com-238025417'},
            {name: 'Sunday Church Ambiance', mp3: 'Sunday Church Ambiance-SoundBible.com-974744686'}

        ]
    };
    sound.push(soundType);
    sound.push(animals);
    sound.push(sirens);

    callback(sound);
}