/// <reference path="../libraries/custom/applicationengine/applicationengine.ts" />
var App;
(function (App) {
    var SourceCheckResult = (function () {
        function SourceCheckResult(Type) {
            this.Type = Type;
            this.ShouldShowToast = false;
        }
        return SourceCheckResult;
    })();
    var TimerTaskController = (function () {
        function TimerTaskController(FinalizeAndCloseTask) {
            var _this = this;
            this.FinalizeAndCloseTask = FinalizeAndCloseTask;
            this.CheckYouTubeVideos = function () {
                var promise = new WinJS.Promise(function (resolve, reject) {
                    var output = new SourceCheckResult(0 /* YouTube */);
                    var success = function (playlist) {
                        var video = playlist.items && playlist.items[0];
                        var storageKey = "LastYouTubeId";
                        if (video) {
                            console.log("Video", video);
                            // Check if we've seen this video before.
                            if (App.Utilities.LocalStorage.Retrieve(storageKey) !== video.id) {
                                output.ShouldShowToast = true;
                                output.LaunchUrl = "https://www.youtube.com/watch/?v=" + video.snippet.resourceId.videoId;
                                output.ToastThumbnail = video.snippet.thumbnails.default.url;
                                //Save the video's id so we don't show more toasts for it in the future. 
                                App.Utilities.LocalStorage.Save(storageKey, video.id);
                            }
                        }
                        resolve(output);
                    };
                    var error = function (reason) {
                        console.log("Failed to retrieve YouTube videos. Reason: ", reason);
                        reject(output);
                    };
                    _this.Engine.GetYouTubeVideos(1).done(success, error);
                });
                return promise;
            };
            this.CheckTwitch = function () {
                var promise = new WinJS.Promise(function (resolve, reject) {
                    var output = new SourceCheckResult(1 /* Twitch */);
                    var success = function (data) {
                        var storageKey = "LastTwitchId";
                        if (data.IsLive) {
                            console.log("Twitch stream", data.StreamId);
                            // Check if we've seen this video before.
                            if (App.Utilities.LocalStorage.Retrieve(storageKey) !== data.StreamId) {
                                output.ShouldShowToast = true;
                                output.LaunchUrl = "https://twitch.tv/shaboozey";
                                output.ToastThumbnail = "/images/live-now.png";
                                //Save the video's id so we don't show more toasts for it in the future. 
                                App.Utilities.LocalStorage.Save(storageKey, data.StreamId);
                            }
                        }
                        resolve(output);
                    };
                    var error = function (reason) {
                        console.log("Failed to retrieve Twitch status. Reason: ", reason);
                        reject(output);
                    };
                    _this.Engine.GetTwitchIsLive().done(success, error);
                });
                return promise;
            };
            this.CheckCooptional = function () {
                var promise = new WinJS.Promise(function (resolve, reject) {
                    var output = new SourceCheckResult(2 /* Cooptional */);
                    var success = function (data) {
                        var storageKey = "LastCooptionalId";
                        if (data.IsLive) {
                            console.log("Cooptional stream", data.StreamId);
                            // Check if we've seen this video before.
                            if (App.Utilities.LocalStorage.Retrieve(storageKey) !== data.StreamId) {
                                output.ShouldShowToast = true;
                                output.LaunchUrl = "https://twitch.tv/totalbiscuit";
                                output.ToastThumbnail = "/images/live-now.png";
                                //Save the video's id so we don't show more toasts for it in the future. 
                                App.Utilities.LocalStorage.Save(storageKey, data.StreamId);
                            }
                        }
                        resolve(output);
                    };
                    var error = function (reason) {
                        console.log("Failed to retrieve Cooptional status. Reason: ", reason);
                        reject(output);
                    };
                    _this.Engine.GetCooptionalIsLive().done(success, error);
                });
                return promise;
            };
            this.ImportScripts();
            this.ConfigureVariables();
            this.CheckSources();
        }
        //#region Utility functions
        TimerTaskController.prototype.ImportScripts = function () {
            //Import App Utilities first, so we can check which version of WinJS to import
            importScripts("ms-appx:///libraries/custom/utilities/utilities.js");
            if (!App.Utilities.IsPhone) {
                importScripts("//Microsoft.WinJS.2.0/js/base.js");
            }
            else {
                importScripts("//Microsoft.Phone.WinJS.2.1/js/base.js");
            }
            ;
            importScripts("ms-appx:///libraries/custom/applicationengine/applicationengine.js", "ms-appx:///libraries/yeahtoast/yeahtoast.js");
        };
        TimerTaskController.prototype.ConfigureVariables = function () {
            this.Engine = new App.ApplicationEngine(App.Utilities.GetAppSetting("YouTubeApiKey"));
        };
        //#endregion
        //#endregion
        //#region Task functions
        TimerTaskController.prototype.CheckSources = function () {
            var _this = this;
            // Create a generic 'done' handler for the three sources.
            // Once they all report done we can close the task.
            var youtubeResult;
            var twitchResult;
            var cooptionalResult;
            var doneHandler = function (data) {
                switch (data.Type) {
                    case 0 /* YouTube */:
                        youtubeResult = data;
                        break;
                    case 1 /* Twitch */:
                        twitchResult = data;
                        break;
                    case 2 /* Cooptional */:
                        cooptionalResult = data;
                        break;
                }
                if (youtubeResult && twitchResult && cooptionalResult) {
                    //Check if we need to show a toast. Twitch > Cooptional > Youtube
                    if (cooptionalResult.ShouldShowToast) {
                        YeahToast.show({ title: "The Co-Optional Podcast is live on Twitch!", launchString: cooptionalResult.LaunchUrl, imgsrc: cooptionalResult.ToastThumbnail });
                    }
                    else if (twitchResult.ShouldShowToast) {
                        YeahToast.show({ title: "Jesse Cox is live on Twitch!", launchString: twitchResult.LaunchUrl, imgsrc: twitchResult.ToastThumbnail });
                    }
                    else if (youtubeResult.ShouldShowToast) {
                        YeahToast.show({ title: "Jesse Cox has uploaded a new video!", launchString: youtubeResult.LaunchUrl, imgsrc: youtubeResult.ToastThumbnail });
                    }
                    ;
                    // Finally, close the task.
                    _this.FinalizeAndCloseTask();
                }
                ;
            };
            var errorHandler = function (data) {
                // Errors can be ignored in the background task.
                // Always invoke the doneHandler to clear the overlay
                doneHandler(data);
            };
            this.CheckYouTubeVideos().done(doneHandler, errorHandler);
            this.CheckTwitch().done(doneHandler, errorHandler);
            this.CheckCooptional().done(doneHandler, errorHandler);
        };
        return TimerTaskController;
    })();
    App.TimerTaskController = TimerTaskController;
})(App || (App = {}));
//# sourceMappingURL=Timer.js.map