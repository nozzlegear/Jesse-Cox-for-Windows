/// <reference path="typings/custom/ipage.d.ts" />
/// <reference path="typings/custom/windows.ui.viewmanagement.statusbar.d.ts" />
/// <reference path="typings/winrt/winrt.d.ts" />
/// <reference path="typings/winjs/winjs.d.ts" />
/// <reference path="typings/lodash/lodash.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
var App;
(function (App) {
    var Context = (function () {
        function Context() {
            var _this = this;
            //#region Storage
            this.RoamingStorage = {
                Save: function (key, value) {
                    Windows.Storage.ApplicationData.current.roamingSettings.values[key] = value;
                },
                Retrieve: function (key) {
                    return Windows.Storage.ApplicationData.current.roamingSettings.values[key];
                },
                Delete: function (key) {
                    Windows.Storage.ApplicationData.current.roamingSettings.values.remove(key);
                }
            };
            this.LocalStorage = {
                Save: function (key, value) {
                    Windows.Storage.ApplicationData.current.localSettings.values[key] = value;
                },
                Retrieve: function (key) {
                    return Windows.Storage.ApplicationData.current.localSettings.values[key];
                },
                Delete: function (key) {
                    Windows.Storage.ApplicationData.current.localSettings.values.remove(key);
                }
            };
            this.SessionStorage = {
                Save: function (key, value) {
                    sessionStorage.setItem(key, value);
                },
                Retrieve: function (key) {
                    return sessionStorage.getItem(key);
                },
                Delete: function (key) {
                    sessionStorage.removeItem(key);
                }
            };
            //#endregion
            //#region Variables
            //#region Objects and arrays
            this.CurrentPage = ko.observable();
            //#endregion
            //#region Strings
            this.StringResources = {
                AppName: WinJS.Resources.getString("strings/AppName").value
            };
            //#endregion
            //#endregion
            //#region Utility functions
            this.GetAppSetting = function (key) {
                return _this.AppSettings[key];
            };
            //#endregion
            //#region WinJS application event handlers
            this.OnActivated = function (args) {
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
                    }
                    else {
                    }
                    // Optimize the load of the application and while the splash screen is shown, execute high priority scheduled work.
                    ui.disableAnimations();
                    var process = ui.processAll().then(function () {
                        return sched.requestDrain(sched.Priority.aboveNormal + 1);
                    }).then(function () {
                        var url = new Windows.Foundation.Uri("ms-appx:///AppSettings.private.json");
                        return Windows.Storage.StorageFile.getFileFromApplicationUriAsync(url).then(function (file) {
                            Windows.Storage.FileIO.readTextAsync(file).then(function (text) {
                                //this.AppSettings = JSON.parse(text);
                            });
                        });
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
            //Set app event listeners
            WinJS.Application.addEventListener("activated", this.OnActivated);
            WinJS.Application.oncheckpoint = this.OnCheckpoint;
            //Must register all pages
            this.RegisterApplicationPages();
            //Hide status bar on phones
            if (Windows.UI.ViewManagement.StatusBar) {
                this.StatusBar = Windows.UI.ViewManagement.StatusBar.getForCurrentView();
                this.StatusBar.hideAsync();
            }
            //Initialize Engine
            this.Engine = new App.ApplicationEngine(this.GetAppSetting("YouTubeApiKey"));
            //Define the default context so it can be accessed from WinJS bindings
            WinJS.Namespace.define("Context", this);
            WinJS.Application.start();
        }
        Context.prototype.RegisterApplicationPages = function () {
            var _this = this;
            //All pages call ready, unload and updatelayout in the same way.
            var defaultHandlers = {
                ready: function () {
                    _this.PageLoadingPromise.then(function (pageController) {
                        _this.CurrentPage(pageController);
                        _this.CurrentPage().HandlePageReady();
                    });
                },
                unload: function (args) {
                    if (_this.CurrentPage()) {
                        _this.CurrentPage().HandlePageUnload(args);
                    }
                },
                updateLayout: function (el, args) {
                    if (_this.CurrentPage()) {
                        _this.CurrentPage().HandlePageUpdateLayout(el, args);
                    }
                }
            };
            //Home page
            WinJS.UI.Pages.define("/pages/home/home.html", _.extend(defaultHandlers, {
                processed: function (e, args) {
                    // In a larger app, we would use require.js to asynchronously load each page controller.
                    // Since this is a small app, we're just including the controllers on the default page.
                    _this.PageLoadingPromise = new WinJS.Promise(function (resolve, reject) {
                        App.HomeController.ProcessPage(resolve, reject, _this);
                    });
                }
            }));
        };
        return Context;
    })();
    App.Context = Context;
})(App || (App = {}));
//Your tax dollars at work!
ko.applyBindings(new App.Context(), document.getElementById("contentHost"));
//# sourceMappingURL=default.js.map