// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
"use strict";

//import * as Conversation from "./node_modules/actions-on-google/src/service/dialogflow/index";

const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion } = require("dialogflow-fulfillment");
const { dialogflow, SignIn } = require("actions-on-google");

process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements

var admin = require("firebase-admin");

var serviceAccount = require("Add file path");
const { convert } = require("actions-on-google/dist/service/actionssdk");
const { user } = require("firebase-functions/lib/providers/auth");
const { firebaseConfig } = require("firebase-functions");

{
  /* <a href="https://assistant.google.com/services/invoke/uid/000000c58b2dda34?hl=en">
  🅖 Ask AVRN SmartSwitch to AVRN test
</a>; */
}
let userid = "";
let username = "";
let thedeviceid = "";
var mycondition = false;
var listofdevices = [];
let devname;
var roomlist = [];
let devlistname;
let roomlistname = [];

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://udemy-ass1.firebaseio.com",
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(
  (request, response) => {
    const agent = new WebhookClient({ request, response });
    const conv = agent.conv();

    console.log(
      "Dialogflow Request headers: " + JSON.stringify(request.headers)
    );
    console.log("Dialogflow Request body: " + JSON.stringify(request.body));
    console.log("Dialogflow Intent:" + agent.intent);
    console.log("Dialogflow Parameters:" + agent.parameters);
    console.log("Dialogflow bulbs:" + agent.parameters["bulbs"]);
    console.log("Dialogflow status:" + agent.parameters["status"]);
    console.log("Dialogflow name:" + agent.parameters["name"]);
    console.log("Dialogflow devices:" + agent.parameters["number-integer"]);
    console.log("Dialogflow rooms:" + agent.parameters["rooms"]);
    console.log("Dialogflow any:" + agent.parameters["any"]);

    function welcome(agent) {
      console.log("Hello to AVRN");
      agent.add("Welcome to AVRN! Ready to continue ?");
    }

    function fallback(agent) {
      agent.add(`I didn't understand`);
      agent.add(`I'm sorry, can you try again?`);
    }

    function devices(agent) {
      var countdevice = agent.parameters["number-integer"];
      var rooms = agent.parameters["rooms"]; //getting roomname
      var roomdevice = rooms.toString() + "" + countdevice.toString(); //deviceName that user says
      let paramany = agent.parameters["any"];
      console.log("Devices are " + listofdevices);
      var controldevice = ""; //device that user is currently controlling
      let condition;

      for (var i = 0; i < listofdevices.length; i++) {
        var k = listofdevices[i]; //getting devices from list individually
        var l = i + 1;
        var thedev = admin
          .database()
          .ref()
          .child("Devices/" + k)
          .orderByChild("Devices/DeviceName");

        thedev.on("value", function (snapshot) {
          //snapshot.forEach(function (childSnapshot) {
          var reqdata = snapshot.val();
          roomlist = [];
          devname = reqdata.DeviceName;

          if (!roomlist.includes(devname)) {
            roomlist.push(devname);
          }
        });

        console.log("Checking roomlist" + roomlist);
        console.log("Checking devname again is " + devname);
        console.log("countdevice  " + countdevice);

        if (devname === roomdevice) {
          controldevice = k;
          condition = true; //adding condition as final mark that execution is succesfull
        } else {
        }
        console.log("Iterating devices " + k + " " + i);
      }

      console.log(condition + " " + controldevice);
      if (condition === true) {
        thedeviceid = controldevice.toString();

        conv.ask(
          `You are now controlling ${roomdevice}! You can now give controlling command.`
        );
      } else {
        conv.ask(
          `Please select device name from the list. 
          You can control ${roomlist}.`
        );
      }

      agent.add(conv);
    }

    function switchbulbs(agent) {
      var conv = agent.conv();
      var responseText = "";

      let bulb = agent.parameters["bulbs"]; //getting the switch number
      let status = agent.parameters["status"]; // action as on or off
      let mycondition;

      let iddevice = thedeviceid;
      let on = "1";
      let off = "0";
      if (bulb !== "" && status !== "") {
        //if sentence is complete then only function will execute
        let device = iddevice.toString();
        var switches = bulb;

        var bulbStatus = status.toString();
        console.log("The device var is " + device);
        console.log("The Status var is " + status);
        console.log("The bulb var is " + switches);

        var currentStatus = admin
          .database()
          .ref()
          .child("Devices/" + device + "/Switches"); //path of requested switch
        console.log(currentStatus.toString());

        currentStatus.once("value", function (snapshot) {
          console.log("snapshot " + snapshot.val());
          if (snapshot.exists() && snapshot.hasChild(switches)) {
            console.log("Number of child " + snapshot.hasChild(switches));
            mycondition = true;
            currentStatus
              .update({
                [switches]: bulbStatus,
              })
              .then(() => {
                mycondition = true;
                responseText = "The switch has been updated";
                console.log(responseText);
              })
              .catch((e) => console.log(e));
          } else {
          }
        });
      } else {
      }

      if (bulbStatus === "1" && mycondition === true) {
        conv.ask(
          "Switch has been turned On. Any things else would you like me to do?"
        );
      } else if (bulbStatus === "0" && mycondition === true) {
        conv.ask(
          "Switch has been turned off. Any things else would you like me to do?"
        );
      } else {
        conv.ask(
          "Sorry I can't do this. Either you don't have this switch or you have requested inappropriate command"
        );
      }

      console.log("resText" + responseText);
      agent.add(conv);
    }
    function show(agent) {
      for (var i = 0; i < listofdevices.length; i++) {
        var k = listofdevices[i];

        var thedevlist = admin
          .database()
          .ref()
          .child("Devices/" + k)
          .orderByChild("Devices/DeviceName");
        console.log("thedev value is " + thedevlist.toString());
        thedevlist.on("value", function (snapshot) {
          //snapshot.forEach(function (childSnapshot) {
          var datareq = snapshot.val();

          devlistname = datareq.DeviceName;
          console.log("Checking devname " + devlistname);
          if (!roomlistname.includes(devlistname)) {
            roomlistname.push(devlistname); // saving list of devices in an array to show
          }
        });
      }
      console.log("Room name list " + roomlistname);
      conv.ask("Following are the list of devices you own: " + roomlistname);
      agent.add(conv);
    }
    function askforsignin(agent) {
      conv.ask(new SignIn());
      agent.add(conv);
    }

    function getsignin(agent) {
      const jwt = require("jsonwebtoken");
      const user = jwt.decode(conv.request.user.idToken);
      let email = user.email; // getting user email
      userid = email;
      let name_user = user.given_name;
      username = name_user.toString();

      console.log("user");
      console.log(user);
      var Ref = admin
        .database()
        .ref()
        .child("Users")
        .orderByChild("UserInfo/Email");

      Ref.on("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var mydata = childSnapshot.val();
          var mymail = userid;
          console.log("The login Id is " + mymail);

          if (mydata.UserInfo.Email === mymail) {
            //comparing if user email exists in database
            listofdevices = [];
            roomlistname = [];
            var mydevice = mydata.Devices;
            var obj = mydata.Devices;

            Object.keys(obj).forEach((key) => {
              var snap = obj[key];
              if (!listofdevices.includes(snap.DeviceId)) {
                listofdevices.push(snap.DeviceId); // saving list of devices that user owns
              }

              console.log("Real snap " + snap);
            });

            console.log("The req device is" + mydevice);
          } else {
            console.log("You are not a registered user.");
          }
        });
      });

      if (email === null) {
        conv.close("It is fine. We respect your privacy");
      } else {
        console.log("In getsignin method" + listofdevices);
        conv.ask(
          ` Hi ${user.given_name}! You're ready control to your devices. You can now start controlling. Would you like me to show the list of devices you control?`
        );
      }
      agent.add(conv);
    }

    // // Uncomment and edit to make your own Google Assistant intent handler
    // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    //function googleAssistantHandler(agent) {
    //let conv = agent.conv(); // Get Actions on Google library conv instance
    //conv.ask("Hello from the Actions on Google client library!"); // Use Actions on Google library
    //agent.add(conv); // Add Actions on Google library responses to your agent's response
    //}
    // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
    // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("Default Fallback Intent", fallback);
    intentMap.set("switchbulb", switchbulbs);
    intentMap.set("ask-signin", askforsignin);
    intentMap.set("get-signin", getsignin);
    intentMap.set("Devices", devices);
    intentMap.set("Show", show);
    agent.handleRequest(intentMap);
  }
);
