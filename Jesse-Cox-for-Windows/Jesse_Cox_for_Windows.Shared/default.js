/// <reference path="libraries/custom/applicationengine/applicationengine.ts" />
/// <reference path="pages/home/home.ts" />
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
            //#region Utility functions
            this.CheckIfPhone = function () {
                return (document.querySelector("#phone") && true) || (document.body.clientWidth < 850);
            };
            this.PrepareGlobalExceptionHandler = function () {
                WinJS.Promise.onerror = function (eventInfo) {
                    //Swallow error.
                };
            };
            this.GetAppSetting = function (key) {
                return WinJS.Resources.getString("AppSettings.private/" + key).value;
            };
            this.RegisterSettings = function () {
                WinJS.Utilities.markSupportedForProcessing(_this.HandleBeforeShowSettings);
                WinJS.Utilities.markSupportedForProcessing(_this.HandleBeforeHideSettings);
                // Populate Settings pane and tie commands to Settings flyouts.
                WinJS.Application.onsettings = function (e) {
                    e.detail.applicationcommands = {
                        "settingsPane": { href: "/pages/settings/settings.html", title: "General Settings" },
                        "aboutPane": { href: "/pages/settings/about.html", title: "About" }
                    };
                    WinJS.UI.SettingsFlyout.populateSettings(e);
                };
            };
            this.LoadNotificationSettings = function () {
                var settings = _this.NotificationSettings;
                var youtube = _this.LocalStorage.Retrieve("NotifyYouTube");
                var twitch = _this.LocalStorage.Retrieve("NotifyTwitch");
                var cooptional = _this.LocalStorage.Retrieve("NotifyCooptional");
                var isBoolean = function (val) { return typeof (val) === "boolean"; };
                settings.NotifyYouTube(isBoolean(youtube) ? youtube : true);
                settings.NotifyTwitch(isBoolean(twitch) ? twitch : true);
                settings.NotifyCooptional(isBoolean(cooptional) ? cooptional : true);
            };
            this.RegisterKnockoutSubscriptions = function () {
                //Automatically save the notification settings when they change.
                _this.NotificationSettings.NotifyYouTube.subscribe(function (newValue) {
                    _this.LocalStorage.Save("NotifyYouTube", newValue);
                });
                _this.NotificationSettings.NotifyTwitch.subscribe(function (newValue) {
                    _this.LocalStorage.Save("NotifyTwitch", newValue);
                });
                _this.NotificationSettings.NotifyCooptional.subscribe(function (newValue) {
                    _this.LocalStorage.Save("NotifyCooptional", newValue);
                });
            };
            this.RegisterBackgroundTasks = function () {
                var timerTaskName = "backgroundSourceCheckTask";
                var background = Windows.ApplicationModel.Background;
                var taskIterator = background.BackgroundTaskRegistration.allTasks.first();
                var taskRegistered = false;
                while (taskIterator.hasCurrent) {
                    var task = taskIterator.current.value;
                    if (task.name === timerTaskName) {
                        taskRegistered = true;
                        break;
                    }
                    taskIterator.moveNext();
                }
                if (!taskRegistered) {
                    if (_this.IsPhone()) {
                    }
                    var success = function (result) {
                        if (result === background.BackgroundAccessStatus.denied) {
                            /* Windows: Background activity and updates for this app are disabled by the user.
                            *
                            *  Windows Phone: The maximum number of background apps allowed across the system has been reached or background activity and updates for this app are disabled by the user.
                            */
                            console.log("Background access denied.");
                        }
                        else if (result === background.BackgroundAccessStatus.unspecified) {
                            // The user didn't explicitly disable or enable access and updates. 
                            console.log("Background access denied, grant was unspecified.");
                        }
                        else {
                            var builder = new background.BackgroundTaskBuilder();
                            var timeTrigger = new background.TimeTrigger(15, false);
                            var conditionTrigger = new background.SystemTrigger(background.SystemTriggerType.internetAvailable, false);
                            builder.name = timerTaskName;
                            builder.taskEntryPoint = "Libraries/custom/ApplicationEngine/ApplicationEngine.js";
                            builder.setTrigger(conditionTrigger);
                            builder.setTrigger(timeTrigger);
                            var task = builder.register();
                            console.log("Task registered.");
                        }
                        ;
                    };
                    var error = function () {
                        // TODO: Display an error to the user telling them the app cannot give notifications. Should only show this error once per app version.
                    };
                    background.BackgroundExecutionManager.requestAccessAsync().done(success, error);
                }
            };
            //#endregion
            //#region Variables
            //#region Objects and arrays
            this.CurrentPage = ko.observable();
            this.NotificationSettings = {
                NotifyYouTube: ko.observable(true),
                NotifyTwitch: ko.observable(true),
                NotifyCooptional: ko.observable(true)
            };
            //#endregion
            //#region Strings
            this.StringResources = {
                AppName: WinJS.Resources.getString("strings/AppName").value
            };
            //#endregion
            //#region Booleans
            this.IsPhone = ko.observable(this.CheckIfPhone());
            //#endregion
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
                    var launchString = args.detail.arguments;
                    if (launchString) {
                        console.log("Launch string", launchString, "Exec state is running? ", args.detail.previousExecutionState === execState.running);
                    }
                    if (args.detail.previousExecutionState !== execState.terminated) {
                    }
                    else {
                    }
                    console.log("Current page exists?", _this.CurrentPage());
                    // Optimize the load of the application and while the splash screen is shown, execute high priority scheduled work.
                    ui.disableAnimations();
                    var process = ui.processAll().then(function () {
                        return sched.requestDrain(sched.Priority.aboveNormal + 1);
                    }).then(function () {
                        ui.enableAnimations();
                    }).then(function () {
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
            this.HandleBeforeShowSettings = function (args) {
                ko.applyBindings(_this, args.target);
            };
            this.HandleBeforeHideSettings = function (args) {
                ko.cleanNode(args.target);
            };
            //Set app event listeners
            WinJS.Application.addEventListener("activated", this.OnActivated);
            WinJS.Application.oncheckpoint = this.OnCheckpoint;
            //WinJS promises will crash the app (by design) if there is no global error handlers
            this.PrepareGlobalExceptionHandler();
            //Must register all pages and settings
            this.RegisterSettings();
            this.RegisterApplicationPages();
            //Load notifications and subscribe to changes
            this.LoadNotificationSettings();
            this.RegisterKnockoutSubscriptions();
            //Check for and register background task
            this.RegisterBackgroundTasks();
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
                        //Bind Knockout
                        ko.cleanNode(document.getElementById("contenthost"));
                        ko.applyBindings(_this, document.getElementById("contenthost"));
                        _this.CurrentPage().HandlePageReady();
                        WinJS.UI.processAll();
                    });
                },
                unload: function (args) {
                    var currentPage = _this.CurrentPage();
                    if (currentPage && currentPage.HandlePageUnload) {
                        _this.CurrentPage().HandlePageUnload(args);
                    }
                },
                updateLayout: function (el, args) {
                    var currentPage = _this.CurrentPage();
                    if (currentPage && currentPage.HandlePageUpdateLayout) {
                        _this.CurrentPage().HandlePageUpdateLayout(el, args);
                    }
                }
            };
            //Automatically call the page's updateLayout when the window is resized
            var resizeDebouncer;
            window.onresize = function (event) {
                if (resizeDebouncer != null) {
                    clearTimeout(resizeDebouncer);
                }
                ;
                resizeDebouncer = setTimeout(function () {
                    defaultHandlers.updateLayout(window, event);
                }, 300);
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
var context = new App.Context();
//# sourceMappingURL=default.js.map