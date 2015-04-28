var IsPhone = true;

(function () {
    importScripts("ms-appx:///tasks/timer.js");

    var closeTask = function () {
        close();
    };

    var task = new App.TimerTaskController(closeTask);
});