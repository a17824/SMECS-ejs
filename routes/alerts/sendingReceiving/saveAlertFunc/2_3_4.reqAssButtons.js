//Dependencies
let models = require('./../../../models');


module.exports.sendingAlert = function(arraySituations, utilities, callback) {

    //radio OFF/ON
    let check = '';
    let onOffSwitch = 'onoffswitch';
    let checkbox = 'onoffswitch-checkbox';
    let label = 'onoffswitch-label';
    let inner = 'onoffswitch-inner';
    let switch_ = 'onoffswitch-switch';

    //end of radio OFF/ON

    utilities.forEach(function (utility) {
        let arrayButtons = [];

        //radio ON
        if (utility.smecsApp) {

            if (utility.defaultContact === 'smecsApp') {
                check = 'checked';
            }

            let button = {
                spacesA: 'spaces1',
                spacesB: 'spaces2',
                value: utility.utilityID + '_|_' + utility.utilityName + '_|_smecsApp',
                radioLabel: 'smecs app',
                radioChecked: check,

                radioSent: {
                    onOffSwitch: onOffSwitch,
                    checkbox: checkbox,
                    label: label,
                    inner: inner,
                    switch_: switch_
                }
            };
            //reset button
            arrayButtons.push(button);
            check = '';


        }

        if (utility.email !== '') {

            if (utility.defaultContact === 'email') {
                check = 'checked';
            }

            let button = {
                spacesA: 'spaces1',
                spacesB: 'spaces2',
                value: utility.utilityID + '_|_' + utility.utilityName + '_|_email',
                radioLabel: 'send email',
                radioChecked: check,
                radioSent: {
                    onOffSwitch: onOffSwitch,
                    checkbox: checkbox,
                    label: label,
                    inner: inner,
                    switch_: switch_
                }
            };
            //reset button
            arrayButtons.push(button);
            check = '';

        }
        if (utility.phone !== '') {

            if (utility.defaultContact === 'phone') {
                check = 'checked';
            }

            let button = {
                spacesA: 'spaces1',
                spacesB: 'spaces4',
                value: utility.utilityID + '_|_' + utility.utilityName + '_|_call',
                radioLabel: 'call',
                radioChecked: check,
                radioSent: {
                    onOffSwitch: onOffSwitch,
                    checkbox: checkbox,
                    label: label,
                    inner: inner,
                    switch_: switch_
                }
            };
            //reset button
            arrayButtons.push(button);
            check = '';

        }
        //end of radio SENT

        let situation = {
            utilityID: utility.utilityID,
            utilityName: utility.utilityName,
            arrayButtons: arrayButtons
        };

        arraySituations.push(situation);
    });
    callback('done building req. buttons')
};




module.exports.reviewAlert = function(arraySituations, alert, callback) {

    let array = [];
    let reqOnArray = [];
    alert.reqAssOn.forEach(function (val) {
        array = [];
        array = val.split('_|_').map(String);

        let reqOn = {
            utilityID: array[0],
            utilityName: array[1],
            type: array[2]

        };
        reqOnArray.push(reqOn);

    });


    //radio OFF/ON
    let check = 'disabled';
    let onOffSwitch = 'onoffswitch';
    let checkbox = 'onoffswitch-checkbox';
    let label = 'onoffswitch-label';
    let inner = 'onoffswitch-inner';
    let switch_ = 'onoffswitch-switch';

    //end of radio OFF/ON

    alert.requestAssistance.forEach(function (utility) {
        let arrayButtons = [];

        //radio ON
        if (utility.smecsApp) {
            for(let x = 0; x < reqOnArray.length; x++) {
                if (utility.utilityID == reqOnArray[x].utilityID && reqOnArray[x].type === 'smecsApp') {
                    check = 'checked disabled';
                }
            }

            let button = {
                spacesA: 'spaces1',
                spacesB: 'spaces2',
                value: utility.utilityID + '_|_' + utility.utilityName + '_|_smecsApp',
                radioLabel: 'smecs app',
                radioChecked: check,

                radioSent: {
                    onOffSwitch: onOffSwitch,
                    checkbox: checkbox,
                    label: label,
                    inner: inner,
                    switch_: switch_
                }
            };
            //reset button
            arrayButtons.push(button);
            check = 'disabled';


        }

        if (utility.email !== '') {
            for(let x = 0; x < reqOnArray.length; x++) {
                if (utility.utilityID == reqOnArray[x].utilityID && reqOnArray[x].type === 'email') {
                    check = 'checked disabled';
                }
            }

            let button = {
                spacesA: 'spaces1',
                spacesB: 'spaces2',
                value: utility.utilityID + '_|_' + utility.utilityName + '_|_email',
                radioLabel: 'send email',
                radioChecked: check,
                radioSent: {
                    onOffSwitch: onOffSwitch,
                    checkbox: checkbox,
                    label: label,
                    inner: inner,
                    switch_: switch_
                }
            };
            //reset button
            arrayButtons.push(button);
            check = 'disabled';

        }
        if (utility.phone !== '') {
            for(let x = 0; x < reqOnArray.length; x++) {
                if (utility.utilityID == reqOnArray[x].utilityID && reqOnArray[x].type === 'call') {
                    check = 'checked disabled';
                }
            }

            let button = {
                spacesA: 'spaces1',
                spacesB: 'spaces4',
                value: utility.utilityID + '_|_' + utility.utilityName + '_|_call',
                radioLabel: 'call',
                radioChecked: check,
                radioSent: {
                    onOffSwitch: onOffSwitch,
                    checkbox: checkbox,
                    label: label,
                    inner: inner,
                    switch_: switch_
                }
            };
            //reset button
            arrayButtons.push(button);
            check = 'disabled';

        }
        //end of radio SENT

        let situation = {
            utilityID: utility.utilityID,
            utilityName: utility.utilityName,
            arrayButtons: arrayButtons
        };

        arraySituations.push(situation);
    });
    callback('done building req. buttons')
};





module.exports.reportDetails = function(arraySituations, alert, disableReqButton, callback) {

    //radio OFF/ON
    let check = '';
    let onOffSwitch = 'onoffswitch';
    let checkbox = 'onoffswitch-checkbox';
    let label = 'onoffswitch-label';
    let inner = 'onoffswitch-inner';
    let switch_ = 'onoffswitch-switch';

    //end of radio OFF/ON

    alert.requestAssistance.forEach(function (utility) {
        let arrayButtons = [];

        //radio SENT
        if (utility.smecsApp) {

            if (utility.defaultContact === 'smecsApp') {
                check = 'checked';
            }
            if (utility.reqSmecsApp.sentReqSmecsApp) {
                check = 'checked disabled';
                onOffSwitch = 'onoffswitchSent';
                checkbox = 'onoffswitch-checkboxSent';
                label = 'onoffswitch-labelSent';
                inner = 'onoffswitch-innerSent';
                switch_ = 'onoffswitch-switchSent';
            }
            else disableReqButton = false;

            let button = {
                spacesA: 'spaces1',
                spacesB: 'spaces2',
                value: utility.utilityID + '_|_' + utility.utilityName + '_|_smecsApp',
                radioLabel: 'smecs app',
                radioChecked: check,

                radioSent: {
                    onOffSwitch: onOffSwitch,
                    checkbox: checkbox,
                    label: label,
                    inner: inner,
                    switch_: switch_
                }
            };
            //reset button
            arrayButtons.push(button);
            check = '';
            onOffSwitch = 'onoffswitch';
            checkbox = 'onoffswitch-checkbox';
            label = 'onoffswitch-label';
            inner = 'onoffswitch-inner';
            switch_ = 'onoffswitch-switch';

        }

        if (utility.email !== '' && !alert.autoAlert) {

            if (utility.defaultContact === 'email') {
                check = 'checked';
            }
            if (utility.reqEmail.sentReqEmail) {
                check = 'checked disabled';
                onOffSwitch = 'onoffswitchSent';
                checkbox = 'onoffswitch-checkboxSent';
                label = 'onoffswitch-labelSent';
                inner = 'onoffswitch-innerSent';
                switch_ = 'onoffswitch-switchSent';
            }
            else disableReqButton = false;

            let button = {
                spacesA: 'spaces1',
                spacesB: 'spaces2',
                value: utility.utilityID + '_|_' + utility.utilityName + '_|_email',
                radioLabel: 'send email',
                radioChecked: check,
                radioSent: {
                    onOffSwitch: onOffSwitch,
                    checkbox: checkbox,
                    label: label,
                    inner: inner,
                    switch_: switch_
                }
            };
            //reset button
            arrayButtons.push(button);
            check = '';
            onOffSwitch = 'onoffswitch';
            checkbox = 'onoffswitch-checkbox';
            label = 'onoffswitch-label';
            inner = 'onoffswitch-inner';
            switch_ = 'onoffswitch-switch';
        }
        if (utility.phone !== ''  && !alert.autoAlert) {

            if (utility.defaultContact === 'call') {
                check = 'checked';
            }
            if (utility.reqCall.sentReqCall) {
                check = 'checked disabled';
                onOffSwitch = 'onoffswitchSent';
                checkbox = 'onoffswitch-checkboxSent';
                label = 'onoffswitch-labelSent';
                inner = 'onoffswitch-innerSent';
                switch_ = 'onoffswitch-switchSent';
            }
            else disableReqButton = false;

            let button = {
                spacesA: 'spaces1',
                spacesB: 'spaces4',
                value: utility.utilityID + '_|_' + utility.utilityName + '_|_call',
                radioLabel: 'call',
                radioChecked: check,
                radioSent: {
                    onOffSwitch: onOffSwitch,
                    checkbox: checkbox,
                    label: label,
                    inner: inner,
                    switch_: switch_
                }
            };
            //reset button
            arrayButtons.push(button);
            check = '';
            onOffSwitch = 'onoffswitch';
            checkbox = 'onoffswitch-checkbox';
            label = 'onoffswitch-label';
            inner = 'onoffswitch-inner';
            switch_ = 'onoffswitch-switch';
        }
        //end of radio SENT

        let situation = {
            utilityID: utility.utilityID,
            utilityName: utility.utilityName,
            arrayButtons: arrayButtons
        };

        arraySituations.push(situation);
        //console.log('arraySituations1 = ',arraySituations);

        //check if reqButton shoud be enable or disable

    });
    callback(disableReqButton)
};
