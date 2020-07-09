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
//var db = admin.database();

//var database = firebase.database();

var serviceAccount = require("./config/udemy-ass1-firebase-adminsdk-78wt0-bbec96a5bb.json");
const { convert } = require("actions-on-google/dist/service/actionssdk");
const { user } = require("firebase-functions/lib/providers/auth");

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

    // // Uncomment and edit to make your own intent handler
    // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function yourFunctionHandler(agent) {
    //   agent.add(
    //     `This message is from Dialogflow's Cloud Functions for Firebase editor!`
    //   );
    //   agent.add(
    //     new Card({
    //       title: `Title: this is a card title`,
    //       imageUrl:
    //         "https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png",
    //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
    //       buttonText: "This is a button",
    //       buttonUrl: "https://assistant.google.com/",
    //     })
    //   );
    //   agent.add(new Suggestion(`Quick Reply`));
    //   agent.add(new Suggestion(`Suggestion`));
    //   agent.setContext({
    //     name: "weather",
    //     lifespan: 2,
    //     parameters: { city: "Rome" },
    //   });
    // }

    // app.intent("Default Welcome Intent", (conv) => {
    //   conv.ask(new SignIn());
    // });

    // app.intent("get-signin", (conv, params, signin) => {
    //   if (signin.status === "OK") {
    //     const email = conv.user.email;

    //     conv.ask(`I got your email as ${email}. What do you want to do next?`);
    //   } else {
    //     conv.ask("Couldn't get email. Anything else?");
    //   }
    // });

    // function name(agent) {
    //   let result = "";
    //   let myname = agent.parameters["name"];

    //   if (myname !== null) {
    //     username = myname.toString();
    //     result = "Hi! What can I do for you?";
    //   } else {
    //     response = "You are not logged in. Login first.";
    //   }

    //   agent.add(result);
    // }

    function switchbulbs(agent) {
      //let conv = agent.conv();

      // conv = agent.conv();
      // if (signin.status === "OK") {
      //   const email = conv.user.email;
      //   mail = email.toString();
      // } else {
      //   console.log(responseText);
      //   responseText = "couldn't get email!";
      // }
      let responseText = "";
      let reply = "";
      let bulb = agent.parameters["bulbs"];
      let status = agent.parameters["status"];
      let theuser = userid;
      let iddevice = thedeviceid;
      let on = 1;
      let off = 0;

      // if (signin.status === "OK" && username !== null) {
      if (bulb !== "" && status !== "") {
        let device = iddevice.toString();
        let switches = bulb.toString();
        let bulbStatus = status.toString();
        console.log("The device var is " + device);
        console.log("The Status var is " + status);
        console.log("The bulb var is " + bulb);

        var currentStatus = admin
          .database()
          .ref()
          .child("/Devices_To_User/" + device + "/Switches");
        console.log(currentStatus.toString());

        //var dataswitch = switches.toString();

        //var userRef = currentStatus.child("userid");
        //var newuserRef = userRef.push();
        //let email = mail;

        // let userid = admin
        //   .database()
        //   .ref()
        //   .child("/" + "user");

        currentStatus.once("value", function (snapshot) {
          if (snapshot.exists() && snapshot.hasChild(`${switches}`)) {
            //&&
            //snapshot.hasChild("useid")
            console.log("The result is " + switches + ":" + bulbStatus);
            // currentStatus.update({
            //   switches: bulbStatus,
            // });
            responseText = "The switch has been updated";
            console.log(responseText);
            console.log("Yes we are in " + currentStatus.toString());

            // userRef.push({
            //   userid: theuser,
            // });
            // if (bulbStatus === on) {
            //   reply = switches + " has been turned on";
            // } else if (bulbStatus === off) {
            //   reply = switches + " has been turned off";
            // } else {
            //   reply = "Please try to control with appropriate command !";
            // }

            console.log(reply);
          } else {
            responseText = "This switch is not available!";
            // userRef.push({
            //   userid: theuser,
          }
        });

        //   userid.set({
        //     user: email,
        //   });
        //}
      } else {
        responseText = "Sorry! I can only turn on and turn off light.";
        //conv.close(responseText);
        //conv.close(responseText);
      }
      // } else {
      //   responseText = "You need to sign in first.";
      // }
      agent.add(responseText);
      agent.add(reply);
    }
    //
    // var deviceRef = admin
    //   .database()
    //   .ref("Device_To_User")
    //   .orderByChild("DeviceId");
    // deviceRef.on("value", deviceData);

    // function deviceData(data) {
    //   console.log(data.val());

    var Ref = admin
      .database()
      .ref()
      .child("Users")
      .orderByChild("UserInfo/Email");

    Ref.on("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var mydata = childSnapshot.val();
        //var keys = Object.keys(mydata);
        var mymail = userid;
        var mydevice = "";
        console.log(mydata.UserInfo.Email + " mY message ");
        console.log("The login Id is " + mymail);

        if (mydata.UserInfo.Email === mymail) {
          mydevice = mydata.Devices.DeviceId;
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

    // Ref.equalTo(userid).once("value", (snapshot) => {
    //   let themail = userid.toString();

    //   if (snapshot.exists()) {
    //     console.log("exists " + themail);
    //   } else {
    //     console.log("not a user");
    //   }
    // });

    // function gotData(data) {
    //   //console.log(data.val());
    //   var usermail = userid;
    //   var product = data.val();
    //   var keys = Object.keys(product);
    //   //console.log(keys);
    //   console.log("The user is " + usermail);

    //   for (var i = 0; i < keys.length; i++) {
    //     var k = keys[i];
    //     var info = admin.database().ref(`${k}`).child("UserInfo/Email");
    //     var infoval = info.val();

    //     if (infoval === null) {
    //       console.log("Does not Exists!");
    //     } else {
    //       console.log(" exist!");
    //       console.log("The email is " + infoval);
    //     }
    //     //var infoKeys =
    //   }
    // }

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
        conv.ask(` Hi ${user.given_name}! Thank you for sharing data.`);
      }
      agent.add(conv);
    }

    // function voting(agent) {
    //   let responseText = "";
    //   let wrestler = agent.parameters["Wrestler"];

    //   if (wrestler !== "") {
    //     let artistName = wrestler.replace(" ", "").toLowerCase();
    //     let currentArtist = admin
    //       .database()
    //       .ref()
    //       .child("/artist/" + artistName);

    //     currentArtist.once("value", function (snapshot) {
    //       if (snapshot.exists() && snapshot.hasChild("votes")) {
    //         let obj = snapshot.val();
    //         currentArtist.update({
    //           votes: obj.votes + 1,
    //         });
    //       } else {
    //         currentArtist.set({
    //           votes: 1,
    //         });
    //       }
    //     });

    //     responseText = "Thankyou for voting!";
    //   } else {
    //     responseText =
    //       "You chose wrong participant. Your voting as been refused. Please try again later!";
    //   }

    //   agent.add(responseText);
    // }

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
    // //intentMap.set("your intent name here", yourFunctionHandler);
    // //intentMap.set("your intent name here", googleAssistantHandler);
    // //intentMap.set("Wrestler Voting", voting);
    intentMap.set("switchbulb", switchbulbs);
    //intentMap.set("name", name);
    intentMap.set("ask-signin", askforsignin);
    intentMap.set("get-signin", getsignin);
    agent.handleRequest(intentMap);
  }
);
