/// <reference path="../../typings/winjs/winjs.d.ts" />
/// <reference path="../../typings/custom/youtube.playlist.video.d.ts" />
module App
{
    enum Source
    {
        YouTube,
        Twitch,
        Cooptional
    }

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
            this.Context.IsPhone(this.Context.CheckIfPhone());
        }

        //#region Variables

        //#region Objects and array

        // ListView
        public listViewArray = ko.observableArray([
            { text: "Josh", rating: ko.observable(4) },
            { text: "Paul", rating: ko.observable(5) },
            { text: "Chris", rating: ko.observable(3) },
            { text: "Edgar", rating: ko.observable(2) }
        ]);

        public Videos = ko.observableArray<YouTube.Playlist.Item>([]);

        public Test = ko.observableArray<YouTube.Playlist.Item>([]);

        //#endregion

        //#region Booleans

        public PageIsReady = ko.observable(false);

        public IsRefreshingSources = ko.observable(false);

        //#endregion

        //#endregion

        //#region Utility functions

        private RefreshSources = () =>
        {
            if (!this.IsRefreshingSources())
            {
                this.IsRefreshingSources(true);

                // Create a generic 'done' handler for the three sources.
                // Once they all report done we can hide the overlay.
                var youtubeDone = false, youtubeError = false;
                var twitchDone = false, twitchError = false;
                var cooptionalDone = false, cooptionalError = false;
                var doneHandler = (source: Source) =>
                {
                    switch (source)
                    {
                        case Source.YouTube:
                            youtubeDone = true;
                            break;

                        case Source.Twitch:
                            twitchDone = true;
                            break;

                        case Source.Cooptional:
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
                        case Source.YouTube:
                            youtubeError = true;
                            break;

                        case Source.Twitch:
                            twitchError = true;
                            break;

                        case Source.Cooptional:
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
                    WinJS.Namespace.define("Videos", {
                        data: new WinJS.Binding.List(videos.items)
                    });

                    this.Videos(videos);
                    this.Test(videos.items);
                    resolve(Source.YouTube);
                };
                var error = (reason: string) =>
                {
                    console.log("Failed to retrieve YouTube videos. Reason: ", reason)
                    reject(Source.YouTube);
                };

                this.Context.Engine.GetYouTubeVideos(10).done(success, error);
            });

            return promise;
        };

        private RefreshTwitch = () =>
        {
            var promise = new WinJS.Promise<Source>((resolve, reject) =>
            {
                // TEMP
                resolve(Source.Twitch);
            });

            return promise;
        };

        private RefreshCooptional = () =>
        {
            var promise = new WinJS.Promise<Source>((resolve, reject) =>
            {
                // TEMP
                resolve(Source.Cooptional);
            });

            return promise;
        };

        //#endregion
    }
}