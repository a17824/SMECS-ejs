
function iconBuild(icons){
    for (var i=1; i <= 192; i++) {
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
            {RgbValue: 'fdfd96', ColorName: 'Yellow', ColorText: '000000'},
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

        'Animals','Dog','sound1','6aa84b5b-80e8-42e4-934c-134b7e51c652',
        'Animals','Rooster','sound2','b13fd426-26d5-48c3-b0d3-fc6f726a33de',
        'Animals','Elephant','sound3','3cec665c-300c-457d-9e8c-6e52f83ede1a',
        'Animals','Chimpanzee','sound4','c5581150-4f49-46c7-ab88-5c2695e1ecdc',
        'Animals','Cat','sound5','0d4cea54-62ba-4c8c-901d-4bc5870ef3d1',
        'Animals','Wolf','sound6','6c5dfdf0-caf5-4626-8524-5d36529d200a',
        'Animals','Hawk','sound7','ae503bb9-40d8-420d-88ad-9fcaac79fda7'

    ];

    var sirens = [
        'Sirens','Alien Siren','sound8','06fe60ec-0168-4832-9a46-adb6ca18ed96',
        'Sirens','School Fire Alarm','sound9','91a9048a-4ffa-428b-98a9-3d7df439d3cb',
        'Sirens','Ambulance','sound10','552ff526-a792-4e68-83c7-7e90243145cb',
        'Sirens','Mandatory Evacuation','sound11','0c2b752b-a700-4159-99b9-0fed932dd987',
        'Sirens','Train Whistle','sound12','076b300e-d521-41a7-bba8-72df9bfc8bbd',
        'Sirens','Police Siren Sound','sound13','b8d69dab-02ea-4c67-a190-bd3b1e95cd50',
        'Sirens','Fire Trucks Sirens','sound14','a3c92208-65d9-4fd6-b08a-89bbec270d05'

    ];

    var misc = [
        'Misc','Eas Beep','sound15','df9390af-770f-4684-acf6-a55f92e638b3',
        'Misc','Sunday Church Ambiance','sound16','8d96a139-a82c-41e2-b025-3f26fa082264',
        'Misc','Car Alarm','sound17','330eb56b-d3e7-4907-bdc5-b0d765f6fee4',
        'Misc','Crazy Brain','sound18','d29776ea-dd7c-471c-82e0-5db6eacace30',
        'Misc','Railroad','sound19','8f213ed7-52e1-4730-b72c-fb912ef4d5f8',
        'Misc','Tornado','sound20','20138857-d9a2-4112-b04d-125dbb056707',
        'Misc','Boat','sound21','42c6a28f-f817-4686-896d-9679791af98c'

    ];

    sound.push(soundID);
    sound.push(soundType);
    sound.push(animals);
    sound.push(sirens);
    sound.push(misc);
    callback(sound);
};



module.exports.lightMode = function(callback) {
    var lightMode = [
        'always on',
        'blinking',
        'strips'
    ];
    callback(lightMode);
};
