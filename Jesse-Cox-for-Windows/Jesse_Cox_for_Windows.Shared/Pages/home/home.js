/// <reference path="../../default.ts" />
/// <reference path="../../typings/custom/ipage.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/winjs/winjs.d.ts" />
/// <reference path="../../typings/custom/youtube.playlist.video.d.ts" />
// # # #
// ȗțӻ⁸ Marker - DO NOT REMOVE - forces TypeScript to output files as UTF-8.
// # # #
var App;
(function (App) {
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
                console.log("Updating");
                _this.Context.IsNarrowViewport(_this.Context.CheckIfNarrowViewport());
            };
            //#region Variables
            //#region Objects and array
            // ListView
            this.Videos = ko.observableArray([]);
            //#endregion
            //#region Booleans
            this.PageIsReady = ko.observable(false);
            this.IsRefreshingSources = ko.observable(false);
            this.TwitchIsLive = ko.observable(false);
            this.CooptionalIsLive = ko.observable(false);
            //#endregion
            //#endregion
            //#region Utility functions
            this.RefreshSources = function () {
                if (!_this.IsRefreshingSources()) {
                    _this.IsRefreshingSources(true);
                    //Close app bars
                    var topAppBar = document.getElementById("topAppBar");
                    var bottomAppBar = document.getElementById("bottomAppBar");
                    if (topAppBar && topAppBar.winControl) {
                        topAppBar.winControl.hide();
                    }
                    ;
                    if (bottomAppBar && bottomAppBar.winControl) {
                        bottomAppBar.winControl.hide();
                    }
                    ;
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
                        _this.Videos(videos.items);
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
                    var success = function (data) {
                        _this.TwitchIsLive(data.IsLive);
                        resolve(1 /* Twitch */);
                    };
                    var error = function (reason) {
                        console.log("Failed to retrieve Twitch status. Reason: ", reason);
                        reject(1 /* Twitch */);
                    };
                    _this.Context.Engine.GetTwitchIsLive().done(success, error);
                });
                return promise;
            };
            this.RefreshCooptional = function () {
                var promise = new WinJS.Promise(function (resolve, reject) {
                    var success = function (data) {
                        _this.CooptionalIsLive(data.IsLive);
                        resolve(2 /* Cooptional */);
                    };
                    var error = function (reason) {
                        console.log("Failed to retrieve Cooptional status. Reason: ", reason);
                        reject(2 /* Cooptional */);
                    };
                    _this.Context.Engine.GetCooptionalIsLive().done(success, error);
                });
                return promise;
            };
            //#endregion
            //#region Event handlers
            this.HandleOpenLiveLink = function (context, event) {
                if (_this.TwitchIsLive()) {
                    window.location.href = "https://twitch.tv/shaboozey";
                }
                else if (_this.CooptionalIsLive()) {
                    window.location.href = "https://twitch.tv/totalbiscuit";
                }
            };
            this.HandleOpenAppSettings = function (context, event) {
                if (App.Utilities.IsPhone) {
                }
                else {
                    WinJS.UI.SettingsFlyout.show();
                }
                ;
            };
            this.HandleOpenAboutPage = function (context, event) {
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
//# sourceMappingURL=home.js.map