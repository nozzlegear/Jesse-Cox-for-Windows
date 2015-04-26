/// <reference path="../../../typings/winrt/winrt.d.ts" />
declare module Windows
{
    export module Web
    {
        export var Http;
    }
}

module App
{
    export class ApplicationEngine
    {
        constructor(youtubeApiKey: string)
        {
            this.YouTubeApiKey = youtubeApiKey;
            this.YouTubeUrl = this.YouTubeUrl += this.YouTubeApiKey;
        }

        //#region Variables

        //#region Strings

        private YouTubeApiKey: string;

        private Referer: string = "https://spacebutterfly.nozzlegear.com";

        private YouTubeUrl: string = "https://www.googleapis.com/youtube/v3/playlistItems?part=id,snippet&playlistId=UUCbfB3cQtkEAiKfdRQnfQvw&key=";

        private TwitchUrl: string = "https://api.twitch.tv/kraken/streams/shaboozey.json";

        private CooptionalUrl: string = "https://api.twitch.tv/kraken/streams/totalbiscuit.json";

        private CoxncrendorUrl: string = "";

        //#endregion

        //#endregion

        //#region Utility functions

        private PrepareRequest = (url: string) =>
        {
            var client = new Windows.Web.Http.HttpClient();
            var headers = client.defaultRequestHeaders;
            //Referer must be a URI
            headers.referer = new Windows.Foundation.Uri(this.Referer);

            return client.getStringAsync(new Windows.Foundation.Uri(url));
        }

        //#endregion

        //#region Core functions

        public GetYouTubeVideos = (count: number = 10) =>
        {
            var output = new WinJS.Promise<Object>((resolve, reject) =>
            {
                var success = (response: string) =>
                {
                    resolve(JSON.parse(response));
                };
                var error = (response: any) =>
                {
                    console.log("Error retrieving videos", response);
                    reject("Response from YouTube did not indicate success.");
                };

                this.PrepareRequest(this.YouTubeUrl + "&maxResults=" + count).done(success, error);
            });

            return output;
        };

        //#endregion
    }
}