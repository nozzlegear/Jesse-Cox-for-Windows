var App;
(function (App) {
    var ApplicationEngine = (function () {
        function ApplicationEngine(apiKey) {
            this.Referer = "https://spacebutterfly.nozzlegear.com";
            this.YouTubeUrl = "https://www.googleapis.com/youtube/v3/playlistItems?part=id%2Csnippet&playlistId=UUCbfB3cQtkEAiKfdRQnfQvw";
            this.TwitchUrl = "https://api.twitch.tv/kraken/streams/shaboozey.json";
            this.CooptionalUrl = "https://api.twitch.tv/kraken/streams/totalbiscuit.json";
            this.CoxncrendorUrl = "";
            //#endregion
            //#endregion
            //#region Utility functions
            this.PrepareRequest = function (url) {
                //var request = WinJS.xhr({
                //    url: "",
                //    headers: [],
                //});
            };
            this.ApiKey = apiKey;
        }
        return ApplicationEngine;
    })();
    App.ApplicationEngine = ApplicationEngine;
})(App || (App = {}));
//# sourceMappingURL=ApplicationEngine.js.map