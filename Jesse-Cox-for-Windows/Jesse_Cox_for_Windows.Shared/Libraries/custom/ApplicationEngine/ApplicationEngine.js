/// <reference path="../../../typings/winrt/winrt.d.ts" />

var App;
(function (App) {
    var ApplicationEngine = (function () {
        function ApplicationEngine(youtubeApiKey) {
            var _this = this;
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
                if (typeof count === "undefined") { count = 10; }
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
            this.YouTubeApiKey = youtubeApiKey;
            this.YouTubeUrl = this.YouTubeUrl += this.YouTubeApiKey;
        }
        return ApplicationEngine;
    })();
    App.ApplicationEngine = ApplicationEngine;
})(App || (App = {}));
