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

var serviceAccount = require("./config/udemy-ass1-firebase-adminsdk-78wt0-bbec96a5bb.json");
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

    function welcome(agent) {
      //conv = agent.conv();

      console.log("Hello to AVRN");
      //conv.ask("Welcome to AVRN SmartSwitch! Ready to continue ?");
      agent.add("Welcome to AVRN SmartSwitch! Ready to continue ?");
    }

    function fallback(agent) {
      agent.add(`I didn't understand`);
      agent.add(`I'm sorry, can you try again?`);
    }

    function switchbulbs(agent) {
      //var conv = agent.conv();
      var responseText = "";

      let bulb = agent.parameters["bulbs"];
      let status = agent.parameters["status"];

      let iddevice = thedeviceid;
      let on = "1";
      let off = "0";
      if (bulb !== "" && status !== "") {
        let device = iddevice.toString();
        var switches = bulb;
        let reqswitch = "Switch" + switches;
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
            currentStatus
              .update({
                [switches]: bulbStatus,
              })
              .then(() => {
                responseText = "The switch has been updated";
                console.log(responseText);
                console.log("Yes we are in " + currentStatus.toString());
              })
              .catch((e) => console.log(e));
          } else {
          }
        });
      } else {
      }
      if (bulbStatus === "1") {
        conv.close("Switch has been turned On");
      } else if (bulbStatus === "0") {
        conv.close("Switch has been turned off");
      } else {
        conv.close("Please go with appropriate command.");
      }
      console.log("resText" + responseText);
      agent.add(conv);
    }

    var Ref = admin
      .database()
      .ref()
      .child("Users")
      .orderByChild("UserInfo/Email");

    Ref.on("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var mydata = childSnapshot.val();

        var mymail = userid;
        var mydevice = "";
        console.log(mydata.UserInfo.Email + " mY message ");
        console.log("The login Id is " + mymail);

        if (mydata.UserInfo.Email === mymail) {
          mydevice = mydata.Devices.DeviceId;
          let thedevicesr = {};
          thedevicesr.add(mydevice);
          console.log("The req device is" + mydevice);
          thedeviceid = mydevice;
          //conv.ask(`Hi ${user.given_name}! You are a user. You can now control the switches of
          //${thedeviceid}`);
          console.log("HAHAHA you find my device " + thedeviceid);
        } else {
          console.log("You are not a registered user.");
          //conv.close(
          //"You are not a registered user! You cannot control the switches."
          //);
        }
      });
    });

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

      if (email === null) {
        conv.close("It is fine. We respect your privacy");
      } else {
        conv.ask(
          ` Hi ${user.given_name}! Thank you for sharing data. What can I do for you ?`
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
    agent.handleRequest(intentMap);
  }
);
