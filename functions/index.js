// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
"use strict";

//import * as Conversation from "./node_modules/actions-on-google/src/service/dialogflow/index";

const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion } = require("dialogflow-fulfillment");
const { dialogflow, SignIn } = require("actions-on-google");
// const { SignIn } = require("actions-on-google");

//const app = dialogflow({ debug: true });

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
      //conv = agent.conv();

      console.log("Hello to AVRN");
      //conv.ask("Welcome to AVRN SmartSwitch! Ready to continue ?");
      agent.add("Welcome to AVRN! Ready to continue ?");
    }

    function fallback(agent) {
      agent.add(`I didn't understand`);
      agent.add(`I'm sorry, can you try again?`);
    }

    function devices(agent) {
      var countdevice = agent.parameters["number-integer"];
      var rooms = agent.parameters["rooms"];
      var roomdevice = rooms.toString() + "" + countdevice.toString();
      console.log("The roomdevice is " + roomdevice);
      let paramany = agent.parameters["any"];
      console.log("Any param is " + paramany);
      console.log("Devices are " + listofdevices);
      var controldevice = "";
      let condition;

      for (var i = 0; i < listofdevices.length; i++) {
        //let newcondition;
        var k = listofdevices[i];
        var l = i + 1;
        var thedev = admin
          .database()
          .ref()
          .child("Devices/" + k)
          .orderByChild("Devices/DeviceName");
        console.log("thedev value is " + thedev.toString());

        thedev.on("value", function (snapshot) {
          //snapshot.forEach(function (childSnapshot) {
          var reqdata = snapshot.val();
          console.log("Apple is " + reqdata.Name);

          devname = reqdata.DeviceName;
          console.log("Checking puz " + devname);
        });

        console.log("Orange is " + devname);
        console.log("countdevice  " + countdevice);

        if (devname === roomdevice) {
          console.log("Checking  Condition", devname === roomdevice);
          controldevice = k;
          condition = true;
          console.log("jenkings " + devname);
        } else {
        }
        console.log("Iterating devices " + k + " " + i);
      }

      console.log(condition + " " + controldevice);
      if (condition === true) {
        console.log("Checking Condition Again", condition);
        thedeviceid = controldevice.toString();
        console.log("Got my device id as " + thedeviceid);
        conv.ask(
          `You are now controlling ${roomdevice}! You can now give controlling command.`
        );
      } else {
        conv.ask(
          `Please select from the list as device1 or device2 and so on... 
          You can control ${listofdevices}.`
        );
      }

      agent.add(conv);
    }

    function switchbulbs(agent) {
      var conv = agent.conv();
      var responseText = "";

      let bulb = agent.parameters["bulbs"];
      let status = agent.parameters["status"];
      let mycondition;

      let iddevice = thedeviceid;
      let on = "1";
      let off = "0";
      if (bulb !== "" && status !== "") {
        let device = iddevice.toString();
        var switches = bulb;

        var bulbStatus = status.toString();
        console.log("The device var is " + device);
        console.log("The Status var is " + status);
        console.log("The bulb var is " + switches);

        var currentStatus = admin
          .database()
          .ref()
          .child("Devices/" + device + "/Switches");
        console.log(currentStatus.toString());

        currentStatus.once("value", function (snapshot) {
          console.log("snapshot " + snapshot.val());
          if (snapshot.exists() && snapshot.hasChild(switches)) {
            console.log("The result is " + switches + ":" + bulbStatus);
            console.log("Snapshot is " + snapshot.val());

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
                console.log("My Condition is " + mycondition);
                console.log("Yes we are in " + currentStatus.toString());
              })
              .catch((e) => console.log(e));
          } else {
          }
        });
      } else {
      }

      if (bulbStatus === "1" && mycondition === true) {
        console.log("cond " + mycondition);
        conv.ask(
          "Switch has been turned On. Any things else would you like me to do?"
        );
      } else if (bulbStatus === "0" && mycondition === true) {
        conv.ask(
          "Switch has been turned off. Any things else would you like me to do?"
        );
      }
      // else if (mycondition === false) {
      //   conv.ask(
      //     "You don't have this switch. Please go with switches you own."
      //   );
      //}
      else {
        //console.log("cond " + mycondition);
        conv.ask(
          "Sorry I can't do this. Either you don't have this switch or you have requested inappropriate command"
        );
      }

      console.log("resText" + responseText);
      agent.add(conv);
    }

    function askforsignin(agent) {
      conv.ask(new SignIn());
      agent.add(conv);
    }

    function getsignin(agent) {
      const jwt = require("jsonwebtoken");
      const user = jwt.decode(conv.request.user.idToken);
      let email = user.email;
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
          console.log(mydata.UserInfo.Email + " mY message " + mydata);
          console.log("The login Id is " + mymail);

          if (mydata.UserInfo.Email === mymail) {
            listofdevices = [];
            var mydevice = mydata.Devices;
            var obj = mydata.Devices;

            Object.keys(obj).forEach((key) => {
              var snap = obj[key];
              if (!listofdevices.includes(snap.DeviceId)) {
                listofdevices.push(snap.DeviceId);
              }

              console.log("Real snap " + snap);
              console.log("snap is " + listofdevices);
            });

            console.log("The req device is" + mydevice);
            //console.log("HAHAHA you find my device " + devid);
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
          ` Hi ${user.given_name}! You're ready control your devices. You can now start controlling. Would you like me to show the list of devices you control?`
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
    agent.handleRequest(intentMap);
  }
);
