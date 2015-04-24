/// <reference path="typings/custom/ipage.d.ts" />
/// <reference path="typings/custom/windows.ui.viewmanagement.statusbar.d.ts" />
/// <reference path="typings/winrt/winrt.d.ts" />
/// <reference path="typings/winjs/winjs.d.ts" />
/// <reference path="typings/lodash/lodash.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />

module App {
    declare var Application;

    export class Context {
        constructor() {
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

        //#region Storage

        public RoamingStorage = {
            Save: (key: string, value: string) => {
                Windows.Storage.ApplicationData.current.roamingSettings.values[key] = value;
            },
            Retrieve: (key: string) => {
                return Windows.Storage.ApplicationData.current.roamingSettings.values[key];
            },
            Delete: (key: string) => {
                Windows.Storage.ApplicationData.current.roamingSettings.values.remove(key);
            },
        };

        public LocalStorage = {
            Save: (key: string, value: string) => {
                Windows.Storage.ApplicationData.current.localSettings.values[key] = value;
            },
            Retrieve: (key: string) => {
                return Windows.Storage.ApplicationData.current.localSettings.values[key];
            },
            Delete: (key: string) => {
                Windows.Storage.ApplicationData.current.localSettings.values.remove(key);
            },
        };

        public SessionStorage = {
            Save: (key: string, value: string) => {
                sessionStorage.setItem(key, value);
            },
            Retrieve: (key: string) => {
                return sessionStorage.getItem(key);
            },
            Delete: (key: string) => {
                sessionStorage.removeItem(key);
            }
        };

        //#endregion

        //#region Variables

        //#region Objects and arrays

        public CurrentPage = ko.observable<App.IPage>();

        public Engine: App.ApplicationEngine;

        public StatusBar: Windows.UI.ViewManagement.StatusBar;

        private PageLoadingPromise: WinJS.Promise<IPage>;

        private AppSettings: Object;

        //#endregion

        //#region Strings

        public StringResources = {
            AppName: WinJS.Resources.getString("strings/AppName").value
        };

        //#endregion

        //#endregion

        //#region Utility functions

        public GetAppSetting = (key: string) => {
            return this.AppSettings[key];
        }

        public RegisterApplicationPages() {
            //All pages call ready, unload and updatelayout in the same way.
            var defaultHandlers = {
                ready: () => {
                    this.PageLoadingPromise.then((pageController: App.IPage) => {
                        this.CurrentPage(pageController);
                        this.CurrentPage().HandlePageReady();
                    });
                },
                unload: (args) => {
                    if (this.CurrentPage()) {
                        this.CurrentPage().HandlePageUnload(args);
                    }
                },
                updateLayout: (el, args) => {
                    if (this.CurrentPage()) {
                        this.CurrentPage().HandlePageUpdateLayout(el, args);
                    }
                },
            };

            //Home page
            WinJS.UI.Pages.define("/pages/home/home.html", _.extend(defaultHandlers, {
                processed: (e, args) => {
                    // In a larger app, we would use require.js to asynchronously load each page controller.
                    // Since this is a small app, we're just including the controllers on the default page.
                    this.PageLoadingPromise = new WinJS.Promise<IPage>((resolve, reject) => {
                        App.HomeController.ProcessPage(resolve, reject, this);
                    });
                }
            }));
        }

        //#endregion

        //#region WinJS application event handlers

        private OnActivated = (args) => {
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
                    // TODO: Application has been newly launched. 
                } else {
                    // TODO: This application has been reactivated from suspension.
                    // Restore application state here.
                }

                // Optimize the load of the application and while the splash screen is shown, execute high priority scheduled work.
                ui.disableAnimations();

                var process = ui.processAll().then(() => {
                    return sched.requestDrain(sched.Priority.aboveNormal + 1);
                }).then(() => {
                    var url = new Windows.Foundation.Uri("ms-appx:///AppSettings.private.json");
                    return Windows.Storage.StorageFile.getFileFromApplicationUriAsync(url).then((file) => {
                        Windows.Storage.FileIO.readTextAsync(file).then((text) => {
                            //this.AppSettings = JSON.parse(text);
                        });
                    });
                }).then(() => {
                    return ui.enableAnimations();
                }).then(() => {
                    //Attach this app to the nav state
                    nav.state.app = this;

                    //Navigate to last location or app home page
                    return nav.navigate(initialLocation || Application.navigator.home, nav.state);
                });

                args.setPromise(process);
            };
        };

        private OnCheckpoint = (args) => {
            // TODO: This application is about to be suspended. Save any state
            // that needs to persist across suspensions here. If you need to 
            // complete an asynchronous operation before your application is 
            // suspended, call args.setPromise().
        };

        //#endregion
    }
}

//Your tax dollars at work!
ko.applyBindings(new App.Context(), document.getElementById("contentHost"));