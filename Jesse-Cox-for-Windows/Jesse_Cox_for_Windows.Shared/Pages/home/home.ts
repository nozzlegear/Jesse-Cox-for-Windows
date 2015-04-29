/// <reference path="../../default.ts" />
/// <reference path="../../typings/custom/ipage.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/winjs/winjs.d.ts" />
/// <reference path="../../typings/custom/youtube.playlist.video.d.ts" />

// # # #
// ȗțӻ⁸ Marker - DO NOT REMOVE - forces TypeScript to output files as UTF-8.
// # # #

module App
{
    export class HomeController implements App.IPage
    {
        static ProcessPage = (resolve: (pageController: App.IPage) => void, reject: (reason: string) => void, context: App.Context) =>
        {
            // Using promises (resolve and reject) gives us a chance to asynchronously load any dependencies via requirejs, 
            // or even make a webrequest before loading the page.
            resolve(new HomeController(context));
        }

        constructor(public Context: App.Context)
        {
            this.RefreshSources();
        }

        public HandlePageReady = () =>
        {
            this.PageIsReady(true);
        }

        public HandlePageUnload = (args: any) =>
        {
            this.Videos(null);
        }

        public HandlePageUpdateLayout = (element: any, args: any) =>
        {
            this.Context.IsNarrowViewport(this.Context.CheckIfNarrowViewport());
        }

        //#region Variables

        //#region Objects and array

        public Videos = ko.observableArray<YouTube.Playlist.Item>([]);

        //#endregion

        //#region Booleans

        public PageIsReady = ko.observable(false);

        public IsRefreshingSources = ko.observable(false);

        public TwitchIsLive = ko.observable(false);

        public CooptionalIsLive = ko.observable(false);

        //#endregion

        //#endregion

        //#region Utility functions

        public RefreshSources = () =>
        {
            if (!this.IsRefreshingSources())
            {
                this.IsRefreshingSources(true);

                //Close app bars
                var topAppBar = document.getElementById("topAppBar");
                var bottomAppBar = document.getElementById("bottomAppBar");

                if (topAppBar && topAppBar.winControl)
                {
                    topAppBar.winControl.hide();
                };

                if (bottomAppBar && bottomAppBar.winControl)
                {
                    bottomAppBar.winControl.hide();
                };

                // Create a generic 'done' handler for the three sources.
                // Once they all report done we can hide the overlay.
                var youtubeDone = false, youtubeError = false;
                var twitchDone = false, twitchError = false;
                var cooptionalDone = false, cooptionalError = false;
                var doneHandler = (source: Source) =>
                {
                    switch (source)
                    {
                        case App.Source.YouTube:
                            youtubeDone = true;
                            break;

                        case App.Source.Twitch:
                            twitchDone = true;
                            break;

                        case App.Source.Cooptional:
                            cooptionalDone = true;
                            break;
                    }

                    if (youtubeDone && twitchDone && cooptionalDone)
                    {
                        this.IsRefreshingSources(false);
                        
                        // TODO: If errors, show a message dialog.
                    };
                };
                var errorHandler = (source: Source) =>
                {
                    switch (source)
                    {
                        case App.Source.YouTube:
                            youtubeError = true;
                            break;

                        case App.Source.Twitch:
                            twitchError = true;
                            break;

                        case App.Source.Cooptional:
                            cooptionalError = true;
                            break;
                    }

                    //Always invoke the doneHandler to clear the overlay
                    doneHandler(source);
                };

                this.RefreshYouTubeVideos().done(doneHandler, errorHandler);
                this.RefreshTwitch().done(doneHandler, errorHandler);
                this.RefreshCooptional().done(doneHandler, errorHandler);
            };
        };

        private RefreshYouTubeVideos = () =>
        {
            var promise = new WinJS.Promise<Source>((resolve, reject) =>
            {
                var success = (videos) =>
                {
                    this.Videos(videos.items);
                    resolve(App.Source.YouTube);
                };
                var error = (reason: string) =>
                {
                    console.log("Failed to retrieve YouTube videos. Reason: ", reason)
                    reject(App.Source.YouTube);
                };

                this.Context.Engine.GetYouTubeVideos(10).done(success, error);
            });

            return promise;
        };

        private RefreshTwitch = () =>
        {
            var promise = new WinJS.Promise<Source>((resolve, reject) =>
            {
                var success = (data: App.GetTwitchResponse) =>
                {
                    this.TwitchIsLive(data.IsLive);
                    resolve(App.Source.Twitch);
                };
                var error = (reason: string) =>
                {
                    console.log("Failed to retrieve Twitch status. Reason: ", reason);
                    reject(App.Source.Twitch);
                };

                this.Context.Engine.GetTwitchIsLive().done(success, error);
            });

            return promise;
        };

        private RefreshCooptional = () =>
        {
            var promise = new WinJS.Promise<Source>((resolve, reject) =>
            {
                var success = (data: App.GetTwitchResponse) =>
                {
                    this.CooptionalIsLive(data.IsLive);
                    resolve(App.Source.Cooptional);
                };
                var error = (reason: string) =>
                {
                    console.log("Failed to retrieve Cooptional status. Reason: ", reason);
                    reject(App.Source.Cooptional);
                };

                this.Context.Engine.GetCooptionalIsLive().done(success, error);
            });

            return promise;
        };

        //#endregion

        //#region Event handlers

        public HandleOpenLiveLink = (context, event) =>
        {
            if (this.TwitchIsLive())
            {
                window.location.href = "https://twitch.tv/shaboozey";
            }
            else if(this.CooptionalIsLive())
            {
                window.location.href = "https://twitch.tv/totalbiscuit";
            }
        };

        public HandleOpenAppSettings = (context, event) =>
        {
            if (App.Utilities.IsPhone)
            {
                // TODO: Open phone-specific settings page.
            }
            else
            {
                WinJS.UI.SettingsFlyout.show()
            };
        };

        public HandleOpenAboutPage = (context, event) =>
        {
            console.log("Navigating to about page.");
            WinJS.Navigation.navigate("/pages/about/about.html", null)
        };

        //#endregion
    }
}