/// <reference path="../../../typings/custom/app.d.ts" />
/// <reference path="../../../typings/custom/twitch.response.d.ts" />
/// <reference path="../../../typings/winrt/winrt.d.ts" />
var App;
(function (App) {
    var ApplicationEngine = (function () {
        function ApplicationEngine(YouTubeApiKey) {
            var _this = this;
            this.YouTubeApiKey = YouTubeApiKey;
            //#region Variables
            //#region Strings
            this.Referer = "https://spacebutterfly.nozzlegear.com";
            this.YouTubeUrl = "https://www.googleapis.com/youtube/v3/playlistItems?part=id,snippet&playlistId=UUCbfB3cQtkEAiKfdRQnfQvw&key=";
            this.TwitchUrl = "https://api.twitch.tv/kraken/streams/shaboozey.json";
            this.CooptionalUrl = "https://api.twitch.tv/kraken/streams/totalbiscuit.json";
            this.CoxncrendorUrl = "";
            //#endregion
            //#endregion
            //#region Utility functions
            this.PrepareRequest = function (url) {
                var client = new Windows.Web.Http.HttpClient();
                var headers = client.defaultRequestHeaders;
                //Referer must be a URI
                headers.referer = new Windows.Foundation.Uri(_this.Referer);
                return client.getStringAsync(new Windows.Foundation.Uri(url));
            };
            //#endregion
            //#region Core functions
            this.GetYouTubeVideos = function (count) {
                if (count === void 0) { count = 10; }
                var output = new WinJS.Promise(function (resolve, reject) {
                    var success = function (response) {
                        resolve(JSON.parse(response));
                    };
                    var error = function (response) {
                        console.log("Error retrieving videos", response);
                        reject("Response from YouTube did not indicate success.");
                    };
                    _this.PrepareRequest(_this.YouTubeUrl + "&maxResults=" + count).done(success, error);
                });
                return output;
            };
            this.GetTwitchIsLive = function () {
                var output = new WinJS.Promise(function (resolve, reject) {
                    var success = function (json) {
                        var response = JSON.parse(json);
                        var promiseResponse = { IsLive: false, StreamId: null };
                        if (response.stream) {
                            promiseResponse.IsLive = true;
                            promiseResponse.StreamId = response.stream._id;
                        }
                        ;
                        resolve(promiseResponse);
                    };
                    var error = function (response) {
                        console.log("Error retrieving Twitch status", response);
                        reject("Response from Twitch did not indicate success.");
                    };
                    _this.PrepareRequest(_this.TwitchUrl).done(success, error);
                });
                return output;
            };
            this.GetCooptionalIsLive = function () {
                var output = new WinJS.Promise(function (resolve, reject) {
                    var success = function (json) {
                        var response = JSON.parse(json);
                        var promiseResponse = { IsLive: false, StreamId: null };
                        if (response.stream) {
                            var streamName = response.stream.channel.status;
                            //We don't want to notify on TB's stream unless it's the podcast or lounge.
                            if (streamName && streamName.toLowerCase().indexOf("optional") !== -1) {
                                promiseResponse.IsLive = true;
                                promiseResponse.StreamId = response.stream._id;
                            }
                            ;
                        }
                        ;
                        resolve(promiseResponse);
                    };
                    var error = function (response) {
                        console.log("Error retrieving Cooptional status", response);
                        reject("Response from Twitch did not indicate success.");
                    };
                    _this.PrepareRequest(_this.CooptionalUrl).done(success, error);
                });
                return output;
            };
            this.YouTubeUrl = this.YouTubeUrl += this.YouTubeApiKey;
        }
        return ApplicationEngine;
    })();
    App.ApplicationEngine = ApplicationEngine;
})(App || (App = {}));
//# sourceMappingURL=applicationengine.js.map