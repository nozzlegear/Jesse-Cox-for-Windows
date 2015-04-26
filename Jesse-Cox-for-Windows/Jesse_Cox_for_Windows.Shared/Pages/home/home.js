/// <reference path="../../typings/winjs/winjs.d.ts" />
/// <reference path="../../typings/custom/youtube.playlist.video.d.ts" />
var App;
(function (App) {
    var Source;
    (function (Source) {
        Source[Source["YouTube"] = 0] = "YouTube";
        Source[Source["Twitch"] = 1] = "Twitch";
        Source[Source["Cooptional"] = 2] = "Cooptional";
    })(Source || (Source = {}));

    var HomeController = (function () {
        function HomeController(Context) {
            var _this = this;
            this.Context = Context;
            this.HandlePageReady = function () {
                _this.PageIsReady(true);
            };
            this.HandlePageUnload = function (args) {
                _this.Videos(null);
            };
            this.HandlePageUpdateLayout = function (element, args) {
                _this.Context.IsPhone(_this.Context.CheckIfPhone());
            };
            //#region Variables
            //#region Objects and array
            // ListView
            this.listViewArray = ko.observableArray([
                { text: "Josh", rating: ko.observable(4) },
                { text: "Paul", rating: ko.observable(5) },
                { text: "Chris", rating: ko.observable(3) },
                { text: "Edgar", rating: ko.observable(2) }
            ]);
            this.Videos = ko.observableArray([]);
            this.Test = ko.observableArray([]);
            //#endregion
            //#region Booleans
            this.PageIsReady = ko.observable(false);
            this.IsRefreshingSources = ko.observable(false);
            //#endregion
            //#endregion
            //#region Utility functions
            this.RefreshSources = function () {
                if (!_this.IsRefreshingSources()) {
                    _this.IsRefreshingSources(true);

                    // Create a generic 'done' handler for the three sources.
                    // Once they all report done we can hide the overlay.
                    var youtubeDone = false, youtubeError = false;
                    var twitchDone = false, twitchError = false;
                    var cooptionalDone = false, cooptionalError = false;
                    var doneHandler = function (source) {
                        switch (source) {
                            case 0 /* YouTube */:
                                youtubeDone = true;
                                break;

                            case 1 /* Twitch */:
                                twitchDone = true;
                                break;

                            case 2 /* Cooptional */:
                                cooptionalDone = true;
                                break;
                        }

                        if (youtubeDone && twitchDone && cooptionalDone) {
                            _this.IsRefreshingSources(false);
                            // TODO: If errors, show a message dialog.
                        }
                        ;
                    };
                    var errorHandler = function (source) {
                        switch (source) {
                            case 0 /* YouTube */:
                                youtubeError = true;
                                break;

                            case 1 /* Twitch */:
                                twitchError = true;
                                break;

                            case 2 /* Cooptional */:
                                cooptionalError = true;
                                break;
                        }

                        //Always invoke the doneHandler to clear the overlay
                        doneHandler(source);
                    };

                    _this.RefreshYouTubeVideos().done(doneHandler, errorHandler);
                    _this.RefreshTwitch().done(doneHandler, errorHandler);
                    _this.RefreshCooptional().done(doneHandler, errorHandler);
                }
                ;
            };
            this.RefreshYouTubeVideos = function () {
                var promise = new WinJS.Promise(function (resolve, reject) {
                    var success = function (videos) {
                        WinJS.Namespace.define("Videos", {
                            data: new WinJS.Binding.List(videos.items)
                        });

                        _this.Videos(videos);
                        _this.Test(videos.items);
                        resolve(0 /* YouTube */);
                    };
                    var error = function (reason) {
                        console.log("Failed to retrieve YouTube videos. Reason: ", reason);
                        reject(0 /* YouTube */);
                    };

                    _this.Context.Engine.GetYouTubeVideos(10).done(success, error);
                });

                return promise;
            };
            this.RefreshTwitch = function () {
                var promise = new WinJS.Promise(function (resolve, reject) {
                    // TEMP
                    resolve(1 /* Twitch */);
                });

                return promise;
            };
            this.RefreshCooptional = function () {
                var promise = new WinJS.Promise(function (resolve, reject) {
                    // TEMP
                    resolve(2 /* Cooptional */);
                });

                return promise;
            };
            this.RefreshSources();
        }
        HomeController.ProcessPage = function (resolve, reject, context) {
            // Using promises (resolve and reject) gives us a chance to asynchronously load any dependencies via requirejs,
            // or even make a webrequest before loading the page.
            resolve(new HomeController(context));
        };
        return HomeController;
    })();
    App.HomeController = HomeController;
})(App || (App = {}));
