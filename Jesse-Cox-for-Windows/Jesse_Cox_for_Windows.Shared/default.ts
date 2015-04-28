/// <reference path="libraries/custom/applicationengine/applicationengine.ts" />
/// <reference path="pages/home/home.ts" />
/// <reference path="typings/custom/ipage.d.ts" />
/// <reference path="typings/custom/windows.ui.viewmanagement.statusbar.d.ts" />
/// <reference path="typings/winrt/winrt.d.ts" />
/// <reference path="typings/winjs/winjs.d.ts" />
/// <reference path="typings/lodash/lodash.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />

module App
{
    declare var Application;

    export class Context
    {
        constructor()
        {
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
            if (Windows.UI.ViewManagement.StatusBar)
            {
                this.StatusBar = Windows.UI.ViewManagement.StatusBar.getForCurrentView();
                this.StatusBar.hideAsync();
            }

            //Initialize Engine
            this.Engine = new App.ApplicationEngine(App.Utilities.GetAppSetting("YouTubeApiKey"));

            //Define the default context so it can be accessed from WinJS bindings
            WinJS.Namespace.define("Context", this);

            WinJS.Application.start();
        }

        //#region Utility functions

        public CheckIfPhone = () =>
        {
            return (document.querySelector("#phone") && true) || (document.body.clientWidth < 850);
        };

        private PrepareGlobalExceptionHandler = () =>
        {
            WinJS.Promise.onerror = (eventInfo) =>
            {
                //Swallow error.
            };
        }

        private RegisterSettings = () =>
        {
            WinJS.Utilities.markSupportedForProcessing(this.HandleBeforeShowSettings);
            WinJS.Utilities.markSupportedForProcessing(this.HandleBeforeHideSettings);

            // Populate Settings pane and tie commands to Settings flyouts.
            WinJS.Application.onsettings = function (e)
            {
                e.detail.applicationcommands = {
                    "settingsPane": { href: "/pages/settings/settings.html", title: "General Settings" },
                    "aboutPane": { href: "/pages/settings/about.html", title: "About" },
                };

                WinJS.UI.SettingsFlyout.populateSettings(e);
            }
        }

        private RegisterApplicationPages()
        {
            //All pages call ready, unload and updatelayout in the same way.
            var defaultHandlers = {
                ready: () =>
                {
                    this.PageLoadingPromise.then((pageController: App.IPage) =>
                    {
                        this.CurrentPage(pageController);

                        //Bind Knockout
                        ko.cleanNode(document.getElementById("contenthost"));
                        ko.applyBindings(this, document.getElementById("contenthost"));

                        this.CurrentPage().HandlePageReady();

                        WinJS.UI.processAll();
                    });
                },
                unload: (args) =>
                {
                    var currentPage = this.CurrentPage();
                    if (currentPage && currentPage.HandlePageUnload)
                    {
                        this.CurrentPage().HandlePageUnload(args);
                    }
                },
                updateLayout: (el, args) =>
                {
                    var currentPage = this.CurrentPage();
                    if (currentPage && currentPage.HandlePageUpdateLayout)
                    {
                        this.CurrentPage().HandlePageUpdateLayout(el, args);
                    }
                },
            };

            //Automatically call the page's updateLayout when the window is resized
            var resizeDebouncer;
            window.onresize = (event) =>
            {
                if (resizeDebouncer != null)
                {
                    clearTimeout(resizeDebouncer);
                };

                resizeDebouncer = setTimeout(() =>
                {
                    defaultHandlers.updateLayout(window, event);
                }, 300);
            };

            //Home page
            WinJS.UI.Pages.define("/pages/home/home.html", _.extend(defaultHandlers, {
                processed: (e, args) =>
                {
                    // In a larger app, we would use require.js to asynchronously load each page controller.
                    // Since this is a small app, we're just including the controllers on the default page.
                    this.PageLoadingPromise = new WinJS.Promise<IPage>((resolve, reject) =>
                    {
                        App.HomeController.ProcessPage(resolve, reject, this);
                    });
                }
            }));
        }

        private LoadNotificationSettings = () =>
        {
            var settings = this.NotificationSettings;
            var youtube = App.Utilities.LocalStorage.Retrieve("NotifyYouTube");
            var twitch = App.Utilities.LocalStorage.Retrieve("NotifyTwitch");
            var cooptional = App.Utilities.LocalStorage.Retrieve("NotifyCooptional");
            var isBoolean = (val: boolean) => typeof (val) === "boolean";

            settings.NotifyYouTube(isBoolean(youtube) ? youtube : true);
            settings.NotifyTwitch(isBoolean(twitch) ? twitch : true);
            settings.NotifyCooptional(isBoolean(cooptional) ? cooptional : true);
        };

        private RegisterKnockoutSubscriptions = () =>
        {
            //Automatically save the notification settings when they change.
            this.NotificationSettings.NotifyYouTube.subscribe((newValue) =>
            {
                App.Utilities.LocalStorage.Save("NotifyYouTube", newValue);
            });

            this.NotificationSettings.NotifyTwitch.subscribe((newValue) =>
            {
                App.Utilities.LocalStorage.Save("NotifyTwitch", newValue);
            });

            this.NotificationSettings.NotifyCooptional.subscribe((newValue) =>
            {
                App.Utilities.LocalStorage.Save("NotifyCooptional", newValue);
            });
        };

        private RegisterBackgroundTasks = () =>
        {
            var timerTaskName = "backgroundSourceCheckTask";
            var background = Windows.ApplicationModel.Background;
            var taskIterator = background.BackgroundTaskRegistration.allTasks.first();
            var taskRegistered = false;

            //Iterate over tasks (can't use lodash) to see if it's registered
            while (taskIterator.hasCurrent)
            {
                var task = taskIterator.current.value;

                if (task.name === timerTaskName)
                {
                    taskRegistered = true;
                    console.log("Task exists.");
                    break;
                }

                taskIterator.moveNext();
            }

            if (!taskRegistered)
            {
                if (this.IsPhone())
                {
                    // TODO: Check app version. If it's a new version, Windows Phone needs to remove background access and request it again.
                }

                var success = (result: Windows.ApplicationModel.Background.BackgroundAccessStatus) =>
                {
                    if (result === background.BackgroundAccessStatus.denied)
                    {
                        /* Windows: Background activity and updates for this app are disabled by the user.
                        *
                        *  Windows Phone: The maximum number of background apps allowed across the system has been reached or background activity and updates for this app are disabled by the user. 
                        */
                        console.log("Background access denied.");
                    }
                    else if (result === background.BackgroundAccessStatus.unspecified)
                    {
                        // The user didn't explicitly disable or enable access and updates. 
                        console.log("Background access denied, grant was unspecified.");
                    }
                    else
                    {
                        var builder = new background.BackgroundTaskBuilder();
                        var timeTrigger = new background.TimeTrigger(15, false);
                        var conditionTrigger = new background.SystemTrigger(background.SystemTriggerType.internetAvailable, false);

                        builder.name = timerTaskName;
                        builder.taskEntryPoint = "Tasks\\Timer.js";
                        builder.setTrigger(conditionTrigger);
                        builder.setTrigger(timeTrigger);

                        var task = builder.register();

                        console.log("Task registered.");
                    };
                };
                var error = () =>
                {
                    // TODO: Display an error to the user telling them the app cannot give notifications. Should only show this error once per app version.
                };

                background.BackgroundExecutionManager.requestAccessAsync().done(success, error);
            }
        }

        //#endregion

        //#region Variables

        //#region Objects and arrays

        public CurrentPage = ko.observable<App.IPage>();

        public Engine: App.ApplicationEngine;

        public StatusBar: Windows.UI.ViewManagement.StatusBar;

        private PageLoadingPromise: WinJS.Promise<IPage>;

        public NotificationSettings = {
            NotifyYouTube: ko.observable(true),
            NotifyTwitch: ko.observable(true),
            NotifyCooptional: ko.observable(true),
        }

        //#endregion

        //#region Strings

        public StringResources = {
            AppName: WinJS.Resources.getString("strings/AppName").value
        };

        //#endregion

        //#region Booleans

        public IsPhone = ko.observable(this.CheckIfPhone());

        //#endregion

        //#endregion

        //#region WinJS application event handlers

        private OnActivated = (args) =>
        {
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
                var launchString = args.detail.arguments;

                if (launchString && this.CurrentPage())
                {
                    //Page is already loaded. Launch the URL.
                    Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(launchString));
                }
                else
                {
                    if (args.detail.previousExecutionState !== execState.terminated)
                    {
                        // TODO: Application has been newly launched. 
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
                        ui.enableAnimations();
                    }).then(() =>
                    {
                        if (launchString)
                        {
                            try {
                                Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(launchString));
                            }
                            catch (e)
                            {
                                console.log("Could not launch from launch string.", e);
                            };
                        }

                        //Navigate to last location or app home page
                        return nav.navigate(initialLocation || Application.navigator.home, nav.state);
                    });

                    args.setPromise(process);
                };
            };
        };

        private OnCheckpoint = (args) =>
        {
            // TODO: This application is about to be suspended. Save any state
            // that needs to persist across suspensions here. If you need to 
            // complete an asynchronous operation before your application is 
            // suspended, call args.setPromise().
        };

        public HandleBeforeShowSettings = (args) =>
        {
            ko.applyBindings(this, args.target);
        }

        public HandleBeforeHideSettings = (args) =>
        {
            ko.cleanNode(args.target);
        }

        //#endregion
    }
}

//Your tax dollars at work!
var context = new App.Context();