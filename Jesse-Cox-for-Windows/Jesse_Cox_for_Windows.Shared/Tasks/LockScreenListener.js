// # # #
// ȗțӻ⁸ Marker - DO NOT REMOVE - forces TypeScript to output files as UTF-8.
// # # #
var IsPhone = false;
var App;
(function (App) {
    var LockScreenListenerController = (function () {
        function LockScreenListenerController() {
            //Load app utilities
            importScripts("ms-appx:///libraries/custom/utilities/utilities.js");
            //Save the new status to local storage. If the app is running, it will try to register the task.
            App.Utilities.LocalStorage.Save("LockScreenStatus", "Added");
            close();
        }
        return LockScreenListenerController;
    })();
    App.LockScreenListenerController = LockScreenListenerController;
})(App || (App = {}));
new App.LockScreenListenerController();
//# sourceMappingURL=LockScreenListener.js.map