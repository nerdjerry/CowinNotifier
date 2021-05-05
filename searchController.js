const constants = require('./constants');
const moment = require('moment');
const fetch = require('node-fetch');
const notifier = require('node-notifier');

module.exports = {
    searchByPincode: async (pincode) => {
        console.log(`Attempting search`)
        let todaysDate = moment();
        for (var i = 0; i < 5; i++) {
            let date = todaysDate.format("DD-MM-YYYY");
            await getAvailableSlotsForDateByPincode(date, pincode);
            todaysDate = todaysDate.add(7, 'days');
        }
    },
    searchByDistrict: async (district) => {
        console.log(`Attempting search`)
        let todaysDate = moment();
        for (var i = 0; i < 5; i++) {
            let date = todaysDate.format("DD-MM-YYYY");
            await getAvailableSlotsForDateByDistrictId(date, district);
            todaysDate = todaysDate.add(7, 'days');
        }
    }
}

async function getAvailableSlotsForDateByPincode(date, pincode) {
    fetch(`${constants.CALENDER_BY_PIN}?pincode=${pincode}&date=${date}`, {
        "method": "GET",
    }).then(res => res.json())
        .then(json => {
            parseResponseAndNotify(json)
            bookSlot(json);
        });
}

async function getAvailableSlotsForDateByDistrictId(date, districtId) {
    fetch(`${constants.CALENDER_BY_DISTRICT}/calendarByDistrict?district_id=${districtId}&date=${date}`, {
        "method": "GET",
    }).then(res => res.json())
        .then(json => {
			parseResponseAndNotify(json);
        });
}

function parseResponseAndNotify(json) {
    if (!json || !json.centers) {
        console.log("RepsonseChangedError!");
    }
    
    json.centers.forEach(center => {
        center.sessions.forEach(session => {
            if (session.min_age_limit == 18) {
                if (session.available_capacity != 0) {
                    let alertMsg = `Found a slot at ${center.name} for date ${session.date}`;
                    notifier.notify(alertMsg);
                    console.log(alertMsg)
                } 
                // else {
                //     let alertMsg = `Found a slot at ${center.name} for date ${session.date}`;
                //     notifier.notify(alertMsg);
                //     console.log(alertMsg)   
                // }
            }
        })
    });
}

function bookSlot(json){

    if(!json || !json.centers){
        console.log("Response Changed Error!");
    }

    
    json.centers.filter(center =>{
        return center.id == 174041 || center.name == 554256
    }).forEach(session => {
        if(session.min_age_limit == 18) {
            if(session.available_capacity != 0){
                fetch(`${constants.BOOK}`, {
                    "method" : "POST",
                    "body" : getSlotJSON(session.session_id)
                }).then(res => res.json())
                   .then(json => {
                        console.log(json);
                   })
            }
        }
    })
}

function getSlotJSON(session_id){
    let myPreference = {
        "dose": 1,
        "session_id": session_id,
        "slot": "01:00PM-03:00PM",
        "beneficiaries": [
            "27616081440890",
            "52449367588720"
        ]
    }
    return JSON.stringify(myPreference);
} 