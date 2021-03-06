//Dependencies
var mongoose =  require('mongoose');


// DEFINE Users COLLECTION IN MONGOdb
var UsersSchema = new mongoose.Schema({
    userRoleID: [Number],
    userRoleName: [String],
    userPrivilegeID: Number,
    userPrivilegeName: String,
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    pin: String,
    photo: String,
    photoTemp: String,
    internal: { type: Boolean, default: false},
    parent: { type: Boolean, default: false},
    external: { type: Boolean, default: false},
    parentOf: [{
        studentID: Number,
        studentFirstName: String,
        studentLastName: String,
        studentPhoto: String
    }],
    companyName: String,
    contactName: String,
    softDeleted: { type: String, default: null},
    expirationDate: {
        type: Date,
        expires: 0
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    receptionPA: { type: Boolean, default: false},
    pushToken: [String],
    redirect: { type: String, default: 'home'},
    redirectTabUsers: { type: String, default: 'showUsers'},
    redirectTabAlertGroups: { type: String, default: 'showGroups'},
    redirectTabBuildings: { type: String, default: 'showBuilding'},
    redirectTabProcedure: { type: String, default: 'showGeneral'},
    redirectTabLightsPanicButtons: { type: String, default: 'showLights'},
    appSettings:{
        groupAlertsButtons: { type: Boolean, default: false},
        enableFingerprint: { type: Boolean, default: false},
        theme: String

    }

}, {usePushEach: true,  //stops Mongoose error of "Unknown modifier: $pushAll"
    collection:"Users"}); //stops Mongoose of giving plurals to our collections names
var Users;
module.exports.Users = mongoose.model("Users", UsersSchema);

// DEFINE UsersAddTemp COLLECTION IN MONGOdb
var UsersAddTempSchema = new mongoose.Schema({
    ttl: { type: Date, index: { expireAfterSeconds: 1800 }, default: Date.now }, //TTL delete document after 600 seconds (10min), 1800sec(30min)
    userRoleID: [Number],
    userRoleName: [String],
    userPrivilegeID: Number,
    userPrivilegeName: String,
    firstName: String,
    lastName: String,
    email: String,
    pin: String,
    photo: String,
    parentOf: [{
        studentID: Number,
        studentFirstName: String,
        studentLastName: String,
        studentPhoto: String
    }],
    parentOfOld: [],    //for back button on ejs to be able to get values
    studentsWithParents: [],
    companyName: String,
    contactName: String

}, {usePushEach: true,  //stops Mongoose error of "Unknown modifier: $pushAll"
    collection:"UsersAddTemp"}); //stops Mongoose of giving plurals to our collections names
var UsersAddTemp;
module.exports.UsersAddTemp = mongoose.model("UsersAddTemp", UsersAddTempSchema);


// DEFINE UsersAddTemp COLLECTION IN MONGOdb
var ParentSelfRegistrationSchema = new mongoose.Schema({
    email: String,
    userPrivilegeID: { type: Number, default: 5},
    firstName: { type: String, default: 'new'},
    lastName: { type: String, default: 'parent'},
    pin: String,
    redirect: { type: String, default: 'registerParent'},
    text: String
}, {usePushEach: true,  //stops Mongoose error of "Unknown modifier: $pushAll"
    collection:"ParentSelfRegistration"}); //stops Mongoose of giving plurals to our collections names
var ParentSelfRegistration;
module.exports.ParentSelfRegistration = mongoose.model("ParentSelfRegistration", ParentSelfRegistrationSchema);


// DEFINE PRIVILEGE COLLECTION IN MONGOdb
var PrivilegeSchema = new mongoose.Schema({
    privilegeID: { type: Number, unique: true },
    privilegeName: { type: String, unique: true }, // Administrator, PowerUser, Regular User
    useIcon: { type: Boolean, default: false },
    icon: String

}, {collection:"Privilege"}); //stops Mongoose of giving plurals to our collections names
var Privilege;
module.exports.Privilege = mongoose.model("Privilege", PrivilegeSchema);

// DEFINE ROLES2 COLLECTION IN MONGOdb
var Roles2Schema = new mongoose.Schema({
    sortID: { type: Number, unique: true },
    roleID: { type: Number, unique: true },
    roleName: { type: String, unique: true }, // Principal, Teacher, Staff, OfficeStaff, Bus Driver, Nurse, Parents, Counselor
    useIcon: { type: Boolean, default: false },
    icon: String

}, {collection:"Roles2"}); //stops Mongoose of giving plurals to our collections names
var Roles2;
module.exports.Roles2 = mongoose.model("Roles2", Roles2Schema);

// DEFINE Student COLLECTION IN MONGOdb
var StudentsSchema = new mongoose.Schema({
    studentID: { type: Number, unique: true },
    firstName: String,
    lastName: String,
    photoTemp: String,
    photo: String,
    busRide: { type: Boolean, default: false},
    parentOf: [{
        parentFirstName: String,
        parentLastName: String,
        parentPhoto: String
    }]

}, {usePushEach: true,  //stops Mongoose error of "Unknown modifier: $pushAll"
    collection:"Students"}); //stops Mongoose of giving plurals to our collections names
var Students;
module.exports.Students = mongoose.model("Students", StudentsSchema);



// DEFINE PermissionsGroup COLLECTION IN MONGOdb
var PermissionsGroupSchema = new mongoose.Schema({
    permissionsGroupID: { type: Number, unique: true },
    permissionsGroupName: { type: String, unique: true }, // Users, Alerts, Students
    sortID: { type: Number, unique: true }

}, {collection:"PermissionsGroup"}); //stops Mongoose of giving plurals to our collections names
var PermissionsGroup;
module.exports.PermissionsGroup = mongoose.model("PermissionsGroup", PermissionsGroupSchema);

// DEFINE Permissions COLLECTION IN MONGOdb
var PermissionsSchema = new mongoose.Schema({
    permissionsGroupID: Number,
    permissionsGroupName: String,
    sortID: { type: Number, unique: true },
    permissionsID: { type: Number, unique: true },
    permissionsName: { type: String, unique: true } // Permission to Add Users, Delete Users, Modify Users, Add User Photo

}, {collection:"Permissions"}); //stops Mongoose of giving plurals to our collections names
var Permissions;
module.exports.Permissions = mongoose.model("Permissions", PermissionsSchema);

// DEFINE AlertsGroup COLLECTION IN MONGOdb
var AlertsGroupSchema = new mongoose.Schema({
    groupID: { type: Number, unique: true },
    sortID: { type: Number, unique: true },
    name: { type: String, unique: true }, // Users, Alerts, Students
    useIcon: { type: Boolean, default: false },
    icon: String,
    color : {
        name: String,
        bgValue: String,
        textValue: String
    },
    sound: {
        soundID: { type: Number },
        soundType: String,
        name: String,
        mp3: String,
        channel: String
    },
    light: {
        mode: String,   //always on, blinking, strips, etc.
        colorRandom: { type: Boolean, default: false }  // true = random; false = same as group color
    }

}, {usePushEach: true,  //stops Mongoose error of "Unknown modifier: $pushAll"
    collection:"AlertsGroup"}); //stops Mongoose of giving plurals to our collections names
var AlertsGroup;
module.exports.AlertsGroup = mongoose.model("AlertsGroup", AlertsGroupSchema);

// DEFINE Alert COLLECTION IN MONGOdb
var AlertsSchema = new mongoose.Schema({
    group: {
        groupID: Number,
        sortID: Number,
        name: String,
        mp3: String,
        soundChannel: String,
        useIcon: Boolean,
        icon: String,
        color: {
            name: String,
            bgValue: String,
            textValue: String
        },
        light: {
            mode: String,   //always on, blinking, strips, etc.
            colorRandom: {type: Boolean, default: false}  // true = random; false = same as group color
        }
    },
    sortID: {type: Number, unique: true},
    alertID: {type: Number, unique: true},
    alertName: {type: String, unique: true}, // Lockdown, Evacuate...
    alertProcedure: String,
    procedureSpecific: [{
        Building: {
            buildingID: Number,
            sortID: Number,
            name: String
        },
        Floor: {
            floorID: Number,
            sortID: Number,
            name: String
        },
        roomID: {type: Number, unique: true},
        sortID: {type: Number, unique: true},
        roomName: String,
        procedure: String
    }],
    alertRequest911Call: {type: Boolean, default: false},
    whoCanCall911: [String],
    alertRequestProcedureCompleted: {type: Boolean, default: true},
    alertRequestWeAreSafe: {type: Boolean, default: true},
    alertRequestForINeedHelp: {type: Boolean, default: true},
    alertRequestSendEmail: {type: Boolean, default: false},
    alertRequestSendSMS: {type: Boolean, default: false},
    alertAutoDrill: {
        alertAutoDrill: {type: Boolean, default: false},
        occurrences: {type: Number, default: 5},
        dates: {
            start: {
                fullStartDate: String,
                month: Number,
                day: Number
            },
            end: {
                fullEndDate: String,
                month: Number,
                day: Number
            }
        },
        everyNumber: {type: Number, default: 1},
        everyType: {type: String, default: 'weeks'},       // "days" "weeks" "months" "years"
        days: {
            sunday: {type: Boolean, default: false},
            monday: {type: Boolean, default: false},
            tuesday: {type: Boolean, default: false},
            wednesday: {type: Boolean, default: false},
            thursday: {type: Boolean, default: false},
            friday: {type: Boolean, default: false},
            saturday: {type: Boolean, default: false}
        },
        times: {
            fullTime: {type: String, default: '10:05 AM'},
            hour: {type: String, default: '10'},
            minutes: {type: String, default: '05'},
            amPm: {type: String, default: 'AM'}
        }
    },
    softDeleted: { type: Boolean, default: false },
    useIcon: { type: Boolean, default: false },
    icon: String,
    alertLight: { type: Boolean, default: true },
    alertLightSound: { type: Boolean, default: true },
    whoCanSendReceive: {
        sendReal: [{
            roleID: Number,
            roleName: String,
            checkbox: { type: Boolean, default: false }
        }],
        receiveReal: [{
            roleID: Number,
            roleName: String,
            checkbox: { type: Boolean, default: false }
        }],
        sendDrill: [{
            roleID: Number,
            roleName: String,
            checkbox: { type: Boolean, default: false }
        }],
        receiveDrill: [{
            roleID: Number,
            roleName: String,
            checkbox: { type: Boolean, default: false }
        }]
    },
    alertRoad: [{
        step: Number,
        callFunction: Array,
        redirectAPI: String,
        redirectEJS: String
    }],
    sendEmailWith: {
        emailID: Number,
        email: String
    }


}, {usePushEach: true,  //stops Mongoose error of "Unknown modifier: $pushAll"
    collection:"Alerts"}); //stops Mongoose of giving plurals to our collections names
var Alerts;
module.exports.Alerts = mongoose.model("Alerts", AlertsSchema);

// DEFINE AlertRoadFunctions COLLECTION IN MONGOdb
var AlertRoadFunctionsSchema = new mongoose.Schema({
    sortID: { type: Number, unique: true },
    functionID: { type: Number, unique: true },
    functionName: { type: String, unique: true },
    alertsWithThisFunction: Array

}, {collection:"AlertRoadFunctions"}); //stops Mongoose of giving plurals to our collections names
module.exports.AlertRoadFunctions = mongoose.model("AlertRoadFunctions", AlertRoadFunctionsSchema);

// DEFINE AlertRoadRedirection COLLECTION IN MONGOdb
var AlertRoadRedirectionSchema = new mongoose.Schema({
    sortID: { type: Number, unique: true },
    redirectID: { type: Number, unique: true },
    redirectAPI: { type: String, unique: true },
    redirectEJS: { type: String, unique: true },
    alertsWithThisRedirect: Array

}, {collection:"AlertRoadRedirection"}); //stops Mongoose of giving plurals to our collections names
module.exports.AlertRoadRedirection = mongoose.model("AlertRoadRedirection", AlertRoadRedirectionSchema);

// DEFINE AlertSentInfo COLLECTION IN MONGOdb
var AlertSentInfoSchema = new mongoose.Schema({
    group: {
        groupID: Number,
        name: String,     //red, green, blue, yellow
        sound: String,
        soundChannel: String,
        icon: String,
        color: {
            name: String,
            bgValue: String,
            textValue: String
        },
        light: {
            mode: String,   //always on, blinking, strips, etc.
            colorRandom: { type: Boolean, default: false }  // true = random; false = same as group color
        }
    },
    alert: {
        alertID: Number,
        name: String,          //stranger, evacuate
        icon: String,
        light: { type: Boolean, default: true },
        lightSound: { type: Boolean, default: true }
    },
    sentBy: String,
    sentDate: String,
    sentTime: String,
    sentRoleIDScope: [Number],
    sentRoleNameScope: [String],      // Teachers, Staff, Parents...
    sentTo: [{                      //30
        firstName: String,
        lastName: String,
        pushToken: [String],
        email: String,
        photo: String,
        received: {
            receivedBoolean: {type: Boolean, default: false},         //22
            receivedDate: String,
            receivedTime: String,
            timeDif: String
        },
        viewed: {
            viewedBoolean: {type: Boolean, default: false},         //22
            viewedDate: String,
            viewedTime: String,
            timeDif: String
        },
        procedureCompleted: {
            boolean: {type: Boolean, default: false},
            date: String,
            time: String,
            timeDif: String
        },
        weAreSafe: {
            boolean: {type: Boolean, default: false},
            date: String,
            time: String,
            timeDif: String
        },
        called911: {
            boolean: {type: Boolean, default: false},
            date: String,
            time: String,
            timeDif: String
        },
        iNeedHelp: {
            boolean: {type: Boolean, default: false},
            date: String,
            time: String,
            timeDif: String,
            helpers: [{
                firstName: String,
                lastName: String,
                pushToken: [String],
                email: String,
                photo: String,
                date: String,
                time: String,
                timeDif: String
            }]
        }
    }],
    status: {
        statusString: { type: String, default: 'open' },         // Open, Closed
        statusClosedDate: String,
        statusClosedTime: String
    },
    realDrillDemo: String,
    requestSendEmail: { type: Boolean, default: false },
    requestSendSMS: { type: Boolean, default: false },
    requestProcedureCompleted: { type: Boolean, default: false },
    requestWeAreSafe: { type: Boolean, default: false },
    requestINeedHelp: { type: Boolean, default: false },
    request911Call: { type: Boolean, default: false },
    whoCanCall911: [String],
    sniperCoordinateX: String,
    sniperCoordinateY: String,
    note: String,
    materialSpill: String,
    resolution: String,
    buildingID: String,
    buildingName: String,
    floorID: String,
    floorName: String,                 //read from FloorLevels database (radio buttons)
    floorPhoto: String,
    floorLocation: String,              //auto load picture from floorLevels database
    studentName: String,           //read from Student database
    studentPhoto: String,      //auto load from Student database
    missingChildLastTimeSeen: String,
    missingChildLastPlaceSeen: String,
    missingChildClothesWearing: String,
    studentWithGunSeated: String,
    studentWithGunBehaviour: String,
    latitude: String,           //bus accident alert gps
    longitude: String,           //bus accident alert gps
    mapBus: String,             //tp view map image in reports
    busAccidentNoInjuries : { type: Boolean, default: false },
    busMorningAfternoon: String,            //bus time: morning or afternoon
    busDelayedAhead: String,                //bus is delayed or ahead
    busTimeChanged: String,                 //0:45, 1:30...
    earlyDismissalDate: String,
    earlyDismissalTime: String,
    multiSelectionNames: [String],
    multiSelectionIDs: [String],
    askedForAssistance: Boolean,
    medicalInjuredParties: Number,
    daysClosed: String,
    requestAssistance: [{
        utilityID: Number,
        utilityName: String,
        contactName: String,
        phone: String,
        email: String,
        defaultContact: String,
        smecsApp: { type: Boolean, default: false },
        reqSmecsApp: {
            sentReqSmecsApp: Boolean,
            stat: String,                   //status = 'open' or 'closed'
            sentTime: String
        },
        reqEmail: {
            sentReqEmail: Boolean,
            stat: String,                   //status = 'open' or 'closed'
            sentTime: String
        },
        reqCall: {
            sentReqCall: Boolean,
            stat: String,                   //status = 'open' or 'closed'
            sentTime: String
        }
    }],
    sentSmecsAppUsersScope: [{
        utilityID: Number,
        utilityName: String,
        userEmail: String,
        userPushToken: String
    }],
    archived: { type: Boolean, default: false },
    softDeletedBy: { type: String, default: null},
    softDeletedDate: { type: String, default: null},
    softDeletedTime: { type: String, default: null},
    expirationDate: {
        type: Date,
        expires: 0
    },
    alertRoad: [{
        step: Number,
        callFunction: Array,
        redirectAPI: String,
        redirectEJS: String
    }],
    alertWith: {
        notes: {type: Boolean, default: false},
        floor: {type: Boolean, default: false},
        student: {type: Boolean, default: false},
        mapBus: {type: Boolean, default: false},
        busAccidentNoInjuries: {type: Boolean, default: false},
        busEarlyLate: {type: Boolean, default: false},
        earlyDismissal: {type: Boolean, default: false},
        materialSpill: {type: Boolean, default: false},
        multiMedical: {type: Boolean, default: false},
        multiSchoolClosed: {type: Boolean, default: false},
        multiSelection: {type: Boolean, default: false},
        multiUtilities: {type: Boolean, default: false},
        notesStudentWithGun: {type: Boolean, default: false},
        missingStudent: {type: Boolean, default: false},
        evacuateTo: {type: Boolean, default: false},
        reqAssistance: {type: Boolean, default: false},
        htmlTags: {
            showHideDiv: String,
            labelFloor: String
        }
    },
    autoAlert: {type: Boolean, default: false},  //for automatic alerts created on requested assistance alert
    parent: String  //to delete/close/archive autoAlerts related to main alert (this applies only to utility failures and requeste assistance alerts

}, {usePushEach: true,  //stops Mongoose error of "Unknown modifier: $pushAll"
    collection:"AlertSentInfo"}); //stops Mongoose of giving plurals to our collections names
var AlertSentInfo;
module.exports.AlertSentInfo = mongoose.model("AlertSentInfo", AlertSentInfoSchema);

// DEFINE AlertSentTemp COLLECTION IN MONGOdb
var AlertSentTempSchema = new mongoose.Schema({
    alertGroupID: Number,
    alertGroupName: String,
    groupSound: String,
    groupSoundChannel: String,
    groupIcon: String,
    groupColorName: String,
    groupColorBk: String,
    groupColorTx: String,
    groupLight: {
        mode: String,   //always on, blinking, strips, etc.
        colorRandom: { type: Boolean, default: false }  // true = random; false = same as group color
    },
    alertNameID: Number,
    alertName: String,
    alertIcon: String,
    light: { type: Boolean, default: true },
    lightSound: { type: Boolean, default: true },
    sentBy: String,
    sentTime: String,
    notePlaceholder: String,
    realDrillDemo: String,
    requestSendEmail: { type: Boolean, default: false },
    requestSendSMS: { type: Boolean, default: false },
    requestProcedureCompleted: { type: Boolean, default: false },
    requestWeAreSafe: { type: Boolean, default: false },
    requestINeedHelp: { type: Boolean, default: false },
    request911Call: { type: Boolean, default: false },
    whoCanCall911: [String],
    sentRoleIDScope: [Number],
    sentRoleNameScope: [String],      // Teachers, Staff, Parents...
    sentTo: [{
        firstName: String,
        lastName: String,
        email: String,
        pushToken: [String],
        photo: String
    }],
    sentSmecsAppUsersScope: [{
        utilityID: Number,
        utilityName: String,
        userEmail: String,
        userPushToken: String
    }],
    ttl: { type: Date, index: { expireAfterSeconds: 1800 }, default: Date.now }, //TTL delete document after 600seconds(10min), 86400sec(1 day)
    placeholderNote: String,
    note: String,
    noteWithoutTags: String,
    materialSpill: String,
    buildingID: String,
    buildingName: String,
    floorName: String,                 //read from FloorLevels database (radio buttons)
    floorID: String,                    //for Hazardous Alert "all floors exit to evacuate" option
    floorPhoto: String,
    sniperCoordinateX: String,
    sniperCoordinateY: String,
    floorLocation: String,              //auto load picture from floorLevels database
    studentName: String,
    studentPhoto: String,      //auto load from Student database
    missingChildLastTimeSeen: String,
    missingChildLastPlaceSeen: String,
    missingChildClothesWearing: String,
    studentWithGunSeated: String,
    studentWithGunBehaviour: String,
    latitude: String,           //bus accident alert gps
    longitude: String,           //bus accident alert gps
    mapBus: String,
    busAccidentNoInjuries : { type: Boolean, default: false },
    busMorningAfternoon: String,            //bus time: morning or afternoon
    busDelayedAhead: String,                //bus is delayed or ahead
    busTimeChanged: String,                 //0:45, 1:30...
    earlyDismissalDate: String,
    earlyDismissalTime: String,
    multiSelectionNames: [String],          // Utilities in Failure or Medical Emergencies
    multiSelectionIDs: [String],
    medicalInjuredParties: Number,          //comboBox, listBox
    daysClosed: String,
    requestAssistance: [{
        utilityID: Number,
        utilityName: String,
        contactName: String,
        phone: String,
        email: String,
        defaultContact: String,
        smecsApp: { type: Boolean, default: false },
        reqSmecsApp: {
            sentReqSmecsApp: Boolean,
            stat: String,                   //status = 'open' or 'closed'
            sentTime: String
        },
        reqEmail: {
            sentReqEmail: Boolean,
            stat: String,                   //status = 'open' or 'closed'
            sentTime: String
        },
        reqCall: {
            sentReqCall: Boolean,
            stat: String,                   //status = 'open' or 'closed'
            sentTime: String
        }
    }],
    reqAssOn: [String],
    reqAssOff: [String],
    roadIndex: String,
    alertSent: { type: Boolean, default: false },
    alertRoad: [{
        step: Number,
        callFunction: Array,
        redirectAPI: String,
        redirectEJS: String
    }],
    roadIndexNumberToExit: String,
    roadIndexExit:{ type: Boolean, default: false },
    alertWith: {
        notes: {type: Boolean, default: false},
        floor: {type: Boolean, default: false},
        student: {type: Boolean, default: false},
        mapBus: {type: Boolean, default: false},
        busAccidentNoInjuries: {type: Boolean, default: false},
        busEarlyLate: {type: Boolean, default: false},
        earlyDismissal: {type: Boolean, default: false},
        materialSpill: {type: Boolean, default: false},
        multiMedical: {type: Boolean, default: false},
        multiSchoolClosed: {type: Boolean, default: false},
        multiSelection: {type: Boolean, default: false},
        multiUtilities: {type: Boolean, default: false},
        notesStudentWithGun: {type: Boolean, default: false},
        missingStudent: {type: Boolean, default: false},
        evacuateTo: {type: Boolean, default: false},
        reqAssistance: {type: Boolean, default: false},
        htmlTags: {
            showHideDiv: String,
            labelFloor: String
        }
    },
    utils: Array    //for alert 26 req assistance on createAlert.js (temporary variable only needed in AlertSentTemp)


}, {usePushEach: true,  //stops Mongoose error of "Unknown modifier: $pushAll"
    collection:"AlertSentTemp"}); //stops Mongoose of giving plurals to our collections names
var AlertSentTemp;
module.exports.AlertSentTemp = mongoose.model("AlertSentTemp", AlertSentTempSchema);
// Fix for Mongoose not creating the TTL indexes (see https://github.com/LearnBoost/mongoose/issues/2459#issuecomment-62802096 )
mongoose.model('AlertSentTemp').ensureIndexes(function(err) {});



// DEFINE AlertReportsSent COLLECTION IN MONGOdb
var ReportsSentSchema = new mongoose.Schema({
    alertReportsSentID: Number,
    time: String,
    groupID: Number,
    name: String,
    alertID: Number,
    alertName: String,
    sentBy: String,
    successful: String, // 22/30
    readBy: String,     // 17/22
    details: String,     // (phone screen snapshot from received alert) Note, Floor, Last Time seen, etc, etc...
    status: String      // Open, Closed
}, {collection:"ReportsSent"}); //stops Mongoose of giving plurals to our collections names
var ReportsSent;
module.exports.ReportsSent = mongoose.model("ReportsSent", ReportsSentSchema);

// DEFINE ReportsReceived COLLECTION IN MONGOdb
var ReportsReceivedSchema = new mongoose.Schema({
    alertReportsReceivedID: Number,
    groupID: Number,
    name: String,
    alertID: Number,
    alertName: String,
    scope: String,      // Teachers, Staff, Parents...
    to: String,         //who alert was sent
    received:String,    //who received alert
    viewed: String      //time user take to read alert
}, {collection:"ReportsReceived"}); //stops Mongoose of giving plurals to our collections names
var ReportsReceived;
module.exports.ReportsReceived = mongoose.model("ReportsReceived", ReportsReceivedSchema);

// DEFINE aclPermissions COLLECTION IN MONGOdb
var AclPermissionsSchema = new mongoose.Schema({
    privilegeGroupID: Number,
    privilegeGroupName: String, // Administrator, PowerUser, Regular User
    permissionsID: Number,
    permissionsName: String, // Permission to Add Users, Delete Users, Modify Users, Add User Photo
    checkBoxID: { type: Number, unique: true },
    checkBoxName: { type: String, unique: true },
    checkBoxValue: { type: Boolean, default: false}

}, {collection:"AclPermissions"}); //stops Mongoose of giving plurals to our collections names
var AclPermissions;
module.exports.AclPermissions = mongoose.model("AclPermissions", AclPermissionsSchema);


// DEFINE Building COLLECTION IN MONGOdb
var BuildingSchema = new mongoose.Schema({
    buildingID: { type: Number, unique: true },
    sortID: { type: Number, unique: true },
    buildingName: { type: String, unique: true } // Asthma, Diabetic, Loss of Consciousness, 3rd

}, {collection:"Building"}); //stops Mongoose of giving plurals to our collections names
var Building;
module.exports.Building = mongoose.model("Building", BuildingSchema);


// DEFINE Floors COLLECTION IN MONGOdb
var FloorsSchema = new mongoose.Schema({
    Building: {
        buildingID: Number,
        sortID: Number,
        name: String
    },
    floorID: { type: Number, unique: true },
    sortID: { type: Number, unique: true },
    floorName: String, // Cafetaria, 1st Floor, 2nd, 3rd
    floorPlan: String

}, {collection:"Floors"}); //stops Mongoose of giving plurals to our collections names
var Floors;
module.exports.Floors = mongoose.model("Floors", FloorsSchema);

// DEFINE Room COLLECTION IN MONGOdb
var RoomSchema = new mongoose.Schema({
    Building: {
        buildingID: Number,
        sortID: Number,
        name: String
    },
    Floor: {
        floorID: Number,
        sortID: Number,
        name: String
    },
    roomID: { type: Number, unique: true },
    sortID: { type: Number, unique: true },
    roomName: String,
    smecsLightAllRoles: { type: Boolean, default: true },
    roomRoleName: [String]

}, {collection:"Room"}); //stops Mongoose of giving plurals to our collections names
var Room;
module.exports.Room = mongoose.model("Room", RoomSchema);

// DEFINE Utilities COLLECTION IN MONGOdb
var UtilitiesSchema = new mongoose.Schema({
    sortID: { type: Number, unique: true },
    utilityID: { type: Number, unique: true },
    utilityName: { type: String, unique: true }, // Gas, Water, Electricity...
    contactName: String,
    phone: String,
    email: String,
    smecsApp: { type: Boolean, default: false },
    smecsUsers: [String],
    defaultContact: { type: String, default: 'ask' }

}, {collection:"Utilities"}); //stops Mongoose of giving plurals to our collections names
var Utilities;
module.exports.Utilities = mongoose.model("Utilities", UtilitiesSchema);


// DEFINE Medical COLLECTION IN MONGOdb
var MedicalSchema = new mongoose.Schema({
    utilityID: { type: Number, unique: true },
    sortID: { type: Number, unique: true },
    utilityName: { type: String, unique: true } // Asthma, Diabetic, Loss of Consciousness, 3rd

}, {collection:"Medical"}); //stops Mongoose of giving plurals to our collections names
var Medical;
module.exports.Medical = mongoose.model("Medical", MedicalSchema);


// DEFINE SchoolClosed COLLECTION IN MONGOdb
var SchoolClosedSchema = new mongoose.Schema({
    utilityID: { type: Number, unique: true },
    sortID: { type: Number, unique: true },
    utilityName: { type: String, unique: true } // holiday, flue, Loss of Consciousness, 3rd

}, {collection:"SchoolClosed"}); //stops Mongoose of giving plurals to our collections names
var SchoolClosed;
module.exports.SchoolClosed = mongoose.model("SchoolClosed", SchoolClosedSchema);


// DEFINE EvacuteTo COLLECTION IN MONGOdb
var EvacuateToSchema = new mongoose.Schema({
    utilityID: { type: Number, unique: true },
    sortID: { type: Number, unique: true },
    utilityName: { type: String, unique: true } // church, Parking lot, street

}, {collection:"EvacuateTo"}); //stops Mongoose of giving plurals to our collections names
var EvacuateTo;
module.exports.EvacuateTo = mongoose.model("EvacuateTo", EvacuateToSchema);


// DEFINE Email COLLECTION IN MONGOdb
var EmailAddressesSchema = new mongoose.Schema({
    emailID: { type: Number, unique: true },
    sortID: { type: Number, unique: true },
    email: { type: String, unique: true },
    emailPassword: String,
}, {collection:"EmailAddresses"}); //stops Mongoose of giving plurals to our collections names
var EmailAddresses;
module.exports.EmailAddresses = mongoose.model("EmailAddresses", EmailAddressesSchema);



// DEFINE PA-PreRecorded System COLLECTION IN MONGOdb
var PA_RecordedSchema = new mongoose.Schema({
    active: { type: Boolean, default: true},
    //titleID: { type: Number, unique: true },     // 1
    titleName: { type: String, unique: true },   // Dismissal
    tileMp3: String,                             // dismissal.mp3
    schedule: { type: Boolean, default: false},
    days: [String],                             // Monday, Tuesday...
    time: String,                               // 2:00PM
    destination: [String],                      // All Rooms, Custom Floors, Custom Rooms
    whoCanSend: [String]                        // Teachers, Staff, Office Staff...


}, {collection:"PA_Recorded"}); //stops Mongoose of giving plurals to our collections names
var PA_Recorded;
module.exports.PA_Recorded = mongoose.model("PA_Recorded", PA_RecordedSchema);


// DEFINE Icons COLLECTION IN MONGOdb
var IconsSchema = new mongoose.Schema({
    useAlertGroupIcons: { type: Boolean, default: false },
    useAlertsIcons: { type: Boolean, default: false },
    useRolesIcons: { type: Boolean, default: false },
    usePrivilegeIcons: { type: Boolean, default: false },
    useParentsUsersIcons: { type: Boolean, default: true },
    useParentsStudentsIcons: { type: Boolean, default: true }

}, {collection:"Icons"}); //stops Mongoose of giving plurals to our collections names
var Icons;
module.exports.Icons = mongoose.model("Icons", IconsSchema);


// DEFINE Light COLLECTION IN MONGOdb
var LightsSchema = new mongoose.Schema({
    nameID: { type: Number, unique: true },
    sortID: { type: Number, unique: true },
    name: String,
    model: {
        mac: String,
        name: String,
        sound: { type: Boolean, default: false },
        mic: { type: Boolean, default: false },
        screenDisplay: {
            hasScreen: {type: Boolean, default: false},
            size: String   //small, medium, large,
        },
        connection: {
            type: String,   //USB, Cat5, wireless
            connected: {type: Boolean, default: false},
        },
        power: {
            type: String,   //batteries, AC, POE
            level: String
        }
    },
    location: String,    //room where is installed
    enableLight: {type: Boolean, default: true},  //this allows to disable/enable light in a specific room
    enableSound: {type: Boolean, default: true},  //this allows to disable/enable sound in a specific room


}, {collection:"Lights"}); //stops Mongoose of giving plurals to our collections names
var Lights;
module.exports.Lights = mongoose.model("Lights", LightsSchema);


// DEFINE Light COLLECTION IN MONGOdb
var PanicButtonsSchema = new mongoose.Schema({
    nameID: { type: Number, unique: true },
    sortID: { type: Number, unique: true },
    name: String,
    whoHasIt: String,
    wireless: [{
        ssid: String,
        encryptionType: String,
        encryptionPass: String
    }],
    model: {
        mac: String,
        name: String,
        powerLevel: String
    }

}, {collection:"PanicButtons"}); //stops Mongoose of giving plurals to our collections names
var PanicButtons;
module.exports.PanicButtons = mongoose.model("PanicButtons", PanicButtonsSchema);