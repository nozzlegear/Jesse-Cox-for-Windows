var IsPhone = false;

module App
{
    export class LockScreenListenerController
    {
        constructor()
        {
            //Load app utilities
            importScripts("ms-appx:///libraries/custom/utilities/utilities.js");

            //Save the new status to local storage. If the app is running, it will try to register the task.
            App.Utilities.LocalStorage.Save("LockScreenStatus", "Added");
        }
    }
} 

new App.LockScreenListenerController();