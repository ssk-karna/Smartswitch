The AVRN Smartswitch device enables users to switch on and off switches remotely.
Following are the steps for google assistant set up to turn on and off switches in database.

Initializing database -

1.  Open your project folder in terminal and execute following commands.-

    - npm install -g firebase-tools
    - firebase login(select project account)
    - firebase init

2.  Follow the process, when it asks which features you want to set up for this folder, choose Functions

    - Choose your existing Dialogflow project

    - When it asks if you want to use ESLint, choose No

    - Do not install all dependencies yet.

    - Check all dependencies update and install the latest version of them.

3.  Inside functions folder run

    - npm install // This will update all the dependencies
    - npm install --save firebase-admin // This will connect you as owner of the project.

4.  In the functions folder again run

    - npm install actions-on-google // This will install actions-on-google library
      which is important for SignIn operations.
    - npm install dotenv

5.  Now open your google actions open the required project, go to build actions and select 'Custom intent'. This will redirect you to dialogflow console where you can build all your intents.

6.  Enable 'webhook' and 'slot-filling' in every intent otherwise it might show error in case of fallbacks.

7.  In 'get-Signin' intent add 'Google Sign Permission' in 'Context'.

8.  Make sure to add at least on 'Default'response to your Welcome intent. "Never leave empty."

9.  In integration option mark "Welcome Intent" and "get-Signin Intent" as "Required Signin".

10. Inside every intent , under parameter section mark every entity as "Required".

11. Again Open your firebase database, open your project and then Project settings>Service Accounts> Firebase admin SDK => Copy the snippet for node.js and paste it in the "Index.js".

12. Below the snippet given in mentioned in previous step, Select "Generate primary key option".
    A keyfile file will be downloaded.

13. Cut/Copy the file, open functions folder inside your project folder. Create a folder named "config". Paste the file in config folder.

14. Add the file path in required block in ServiceAccount variable.

15. Open your functions folder in terminal and execute -

    - npm install jsonwebtoken // This allows your code to access details of user login.

16. Now every thing is setup. Edit the code in Index.js as per requirements and deploy to firebase using -
    _ firebase deploy
    or  
    _ firebase deploy --only functions.
    inide project folder.

17. After completing the project and testing, you can release alpha, beta or production versions.

18. For this open your project in goole-actions console.
    Under Deploy tab

    - Fill the requirement details of app.
    - Select countries where your app you want to be available.
    - Select surface capabilities i.e. Where your google assistant can be called.

19. After setting all this release your required version.

20. The google assistant integration is complete for project now.

NOTE:

- Please make sure all the dependencies and functions mentioned must be installed in the every step otherwise errors might occur at various occasions.

- For execution of functions in firebase your billing details must be filled up in your google cloud account. Google doesn't allow functions to work until payment options of user are added.
