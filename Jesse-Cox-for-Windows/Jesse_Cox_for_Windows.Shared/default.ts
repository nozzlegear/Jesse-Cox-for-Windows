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

            //Hide status bar on phones
            if (Windows.UI.ViewManagement.StatusBar)
            {
                this.StatusBar = Windows.UI.ViewManagement.StatusBar.getForCurrentView();
                this.StatusBar.hideAsync();
            }

            //Initialize Engine
            this.Engine = new App.ApplicationEngine(this.GetAppSetting("YouTubeApiKey"));

            //Define the default context so it can be accessed from WinJS bindings
            WinJS.Namespace.define("Context", this);

            WinJS.Application.start();
        }

        //#region Storage

        public RoamingStorage = {
            Save: (key: string, value: any) =>
            {
                Windows.Storage.ApplicationData.current.roamingSettings.values[key] = value;
            },
            Retrieve: (key: string) =>
            {
                return Windows.Storage.ApplicationData.current.roamingSettings.values[key];
            },
            Delete: (key: string) =>
            {
                Windows.Storage.ApplicationData.current.roamingSettings.values.remove(key);
            },
        };

        public LocalStorage = {
            Save: (key: string, value: any) =>
            {
                Windows.Storage.ApplicationData.current.localSettings.values[key] = value;
            },
            Retrieve: (key: string) =>
            {
                return Windows.Storage.ApplicationData.current.localSettings.values[key];
            },
            Delete: (key: string) =>
            {
                Windows.Storage.ApplicationData.current.localSettings.values.remove(key);
            },
        };

        public SessionStorage = {
            Save: (key: string, value: any) =>
            {
                sessionStorage.setItem(key, value);
            },
            Retrieve: (key: string) =>
            {
                return sessionStorage.getItem(key);
            },
            Delete: (key: string) =>
            {
                sessionStorage.removeItem(key);
            }
        };

        //#endregion

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

        public GetAppSetting = (key: string) =>
        {
            return WinJS.Resources.getString("AppSettings.private/" + key).value;
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
            var youtube = this.LocalStorage.Retrieve("NotifyYouTube");
            var twitch = this.LocalStorage.Retrieve("NotifyTwitch");
            var cooptional = this.LocalStorage.Retrieve("NotifyCooptional");
            var isBoolean = (val: boolean) => typeof (val) === "boolean";

            settings.NotifyYouTube(isBoolean(youtube) ? youtube : true);
            settings.NotifyTwitch(isBoolean(twitch) ? twitch : true);
            settings.NotifyCooptional(isBoolean(cooptional) ? cooptional : true);
        };

        private RegisterKnockoutSubscriptions = () =>
        {
            this.NotificationSettings.NotifyYouTube.subscribe((newValue) =>
            {
                this.LocalStorage.Save("NotifyYouTube", newValue);
            });

            this.NotificationSettings.NotifyTwitch.subscribe((newValue) =>
            {
                this.LocalStorage.Save("NotifyTwitch", newValue);
            });

            this.NotificationSettings.NotifyCooptional.subscribe((newValue) =>
            {
                this.LocalStorage.Save("NotifyCooptional", newValue);
            });
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

                if (launchString)
                {
                    console.log("Launch string", launchString, "Exec state is running? ", args.detail.previousExecutionState === execState.running);
                }

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