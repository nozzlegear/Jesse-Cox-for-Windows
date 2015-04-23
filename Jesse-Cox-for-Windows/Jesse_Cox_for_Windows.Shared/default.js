/// <reference path="typings/custom/windows.ui.viewmanagement.statusbar.d.ts" />
/// <reference path="typings/winrt/winrt.d.ts" />
/// <reference path="typings/winjs/winjs.d.ts" />
/// <reference path="typings/lodash/lodash.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
var App;
(function (App) {
    "use strict";
    var Context = (function () {
        function Context() {
            var _this = this;
            this.Blackbox = {
                Save: function (key, value) {
                    Windows.Storage.ApplicationData.current.roamingSettings.values[key] = value;
                },
                Retrieve: function (key) {
                    return Windows.Storage.ApplicationData.current.roamingSettings.values[key];
                },
            };
            this.AuntieDot = {
                Save: function (key, value) {
                    Windows.Storage.ApplicationData.current.localSettings.values[key] = value;
                },
                Retrieve: function (key) {
                    return Windows.Storage.ApplicationData.current.localSettings.values[key];
                },
            };
            this.Resources = WinJS.Binding.as({
                AppName: WinJS.Resources.getString("strings/AppName").value
            });
            //#endregion
            //#region Strings
            this.YourName = WinJS.Binding.as({
                Value: "Test New Binding Setup"
            });
            //#endregion
            //#endregion
            //#region Utility functions
            this.SetCurrentPage = function (page) {
                _this.CurrentPage = page;
            };
            //#endregion
            //#region WinJS application event handlers
            this.OnActivated = function (args) {
                WinJS.Binding.bind(_this.YourName, {
                    Value: function () {
                        // This is an example of how to subscribe to WinJS bindings.
                    }
                });
                var execState = Windows.ApplicationModel.Activation.ApplicationExecutionState;
                var activeKind = Windows.ApplicationModel.Activation.ActivationKind;
                var activation = Windows.ApplicationModel.Activation;
                var app = WinJS.Application;
                var nav = WinJS.Navigation;
                var sched = WinJS.Utilities.Scheduler;
                var ui = WinJS.UI;
                var initialLocation = nav.location;
                //Ensure nav state exists
                nav.state = nav.state || {};
                if (args.detail.kind === activeKind.launch) {
                    if (args.detail.previousExecutionState !== execState.terminated) {
                        // # # #
                        // TODO: Application has been newly launched. 
                        // CONT: Check if user is logged in, navigate to home or login page accordingly.
                        // # # #
                        if (!_this.AuntieDot.Retrieve("RedditUsername")) {
                            //User is not logged in.
                            initialLocation = "/pages/login/login.html";
                        }
                        ;
                    }
                    else {
                    }
                    // Optimize the load of the application and while the splash screen is shown, execute high priority scheduled work.
                    ui.disableAnimations();
                    var process = ui.processAll().then(function () {
                        return sched.requestDrain(sched.Priority.aboveNormal + 1);
                    }).then(function () {
                        //All functions bound with declarative binding in HTML must be marked as supported
                        return _this.ProcessDataboundFunctions(_this.EventHandlers);
                    }).then(function () {
                        return ui.enableAnimations();
                    }).then(function () {
                        //Attach this app to the nav state
                        nav.state.app = _this;
                        //Navigate to last location or app home page
                        return nav.navigate(initialLocation || Application.navigator.home, nav.state);
                    });
                    args.setPromise(process);
                }
                ;
            };
            this.OnCheckpoint = function (args) {
                // TODO: This application is about to be suspended. Save any state
                // that needs to persist across suspensions here. If you need to 
                // complete an asynchronous operation before your application is 
                // suspended, call args.setPromise().
            };
            //#endregion
            //#region Event handlers
            this.EventHandlers = {
                TestHandler: function (e) {
                    _this.Resources.AppName = "Your tax dollars at work!";
                }
            };
            //Set app event listeners
            WinJS.Application.addEventListener("activated", this.OnActivated);
            WinJS.Application.oncheckpoint = this.OnCheckpoint;
            //Show the statusbar by default
            this.StatusBar = Windows.UI.ViewManagement.StatusBar.getForCurrentView();
            this.StatusBar.backgroundColor = Windows.UI.Colors.white;
            this.StatusBar.foregroundColor = Windows.UI.Colors.black;
            this.StatusBar.showAsync();
            //Define the default context so it can be accessed from WinJS bindings
            WinJS.Namespace.define("Context", this);
            WinJS.Application.start();
        }
        Context.prototype.ProcessDataboundFunctions = function (functions) {
            Object.keys(functions).forEach(function (key) {
                var func = functions[key];
                if (typeof func === "function") {
                    WinJS.Utilities.markSupportedForProcessing(functions[key]);
                }
                ;
            });
        };
        return Context;
    })();
    App.Context = Context;
})(App || (App = {}));
//Your tax dollars at work!
new App.Context();
