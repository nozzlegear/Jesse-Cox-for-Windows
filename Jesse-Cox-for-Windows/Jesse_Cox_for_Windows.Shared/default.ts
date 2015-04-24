/// <reference path="typings/custom/windows.ui.viewmanagement.statusbar.d.ts" />
/// <reference path="typings/winrt/winrt.d.ts" />
/// <reference path="typings/winjs/winjs.d.ts" />
/// <reference path="typings/lodash/lodash.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />

module App
{
    "use strict";

    declare var Application;

    export class Context    
    {
        constructor()
        {
            //Set app event listeners
            WinJS.Application.addEventListener("activated", this.OnActivated);
            WinJS.Application.oncheckpoint = this.OnCheckpoint;

            ////Show the statusbar by default
            //this.StatusBar = Windows.UI.ViewManagement.StatusBar.getForCurrentView();
            //this.StatusBar.backgroundColor = Windows.UI.Colors.white;
            //this.StatusBar.foregroundColor = Windows.UI.Colors.black;
            //this.StatusBar.showAsync();

            //Define the default context so it can be accessed from WinJS bindings
            WinJS.Namespace.define("Context", this);

            WinJS.Application.start();
        }

        public Blackbox = {
            Save: (key: string, value: any) =>
            {
                Windows.Storage.ApplicationData.current.roamingSettings.values[key] = value;
            },
            Retrieve: (key: string) =>
            {
                return Windows.Storage.ApplicationData.current.roamingSettings.values[key];
            },
        };

        public AuntieDot = {
            Save: (key: string, value: any) =>
            {
                Windows.Storage.ApplicationData.current.localSettings.values[key] = value;
            },
            Retrieve: (key: string) =>
            {
                return Windows.Storage.ApplicationData.current.localSettings.values[key];
            },
        };

        //#region Variables

        //#region Objects and arrays

        public CurrentPage: any;

        public Resources = {
            AppName: WinJS.Resources.getString("strings/AppName").value
        };

        public StatusBar: Windows.UI.ViewManagement.StatusBar;

        //#endregion

        //#region Strings

        public YourName = WinJS.Binding.as({
            Value: "Test New Binding Setup"
        });

        //#endregion

        //#endregion

        //#region Utility functions

        public SetCurrentPage = (page) =>
        {
            this.CurrentPage = page;
        }

        public ProcessDataboundFunctions(functions: Object)
        {
            Object.keys(functions).forEach((key) =>
            {
                var func = functions[key];

                if (typeof func === "function")
                {
                    WinJS.Utilities.markSupportedForProcessing(functions[key]);
                };
            });
        }

        //#endregion

        //#region WinJS application event handlers

        private OnActivated = (args) =>
        {
            WinJS.Binding.bind(this.YourName, {
                Value: () =>
                {
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

            if (args.detail.kind === activeKind.launch)
            {
                if (args.detail.previousExecutionState !== execState.terminated)
                {
                    // # # #
                    // TODO: Application has been newly launched. 
                    // CONT: Check if user is logged in, navigate to home or login page accordingly.
                    // # # #
                } else
                {
                    // TODO: This application has been reactivated from suspension.
                    // Restore application state here.
                }

                // Optimize the load of the application and while the splash screen is shown, execute high priority scheduled work.
                ui.disableAnimations();

                var process = ui.processAll().then(() =>
                {
                    return sched.requestDrain(sched.Priority.aboveNormal + 1);
                }).then(() =>
                {
                    return ui.enableAnimations();
                }).then(() =>
                {
                    //Attach this app to the nav state
                    nav.state.app = this;

                    //Navigate to last location or app home page
                    return nav.navigate(initialLocation || Application.navigator.home, nav.state);
                });

                args.setPromise(process);
            };
        };

        private OnCheckpoint = (args) =>
        {
            // TODO: This application is about to be suspended. Save any state
            // that needs to persist across suspensions here. If you need to 
            // complete an asynchronous operation before your application is 
            // suspended, call args.setPromise().
        };

        //#endregion

        //#region Event handlers

        //#endregion
    }
}

//Your tax dollars at work!
new App.Context();