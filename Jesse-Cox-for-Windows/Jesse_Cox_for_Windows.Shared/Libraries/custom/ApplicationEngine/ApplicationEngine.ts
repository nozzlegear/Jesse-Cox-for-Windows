/// <reference path="../../../typings/custom/app.d.ts" />
/// <reference path="../../../typings/custom/twitch.response.d.ts" />
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
        constructor(private YouTubeApiKey: string)
        {
            this.YouTubeUrl = this.YouTubeUrl += this.YouTubeApiKey;
        }

        //#region Variables

        //#region Strings

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

        public GetTwitchIsLive: () => WinJS.Promise<App.GetTwitchResponse> = () =>
        {
            var output = new WinJS.Promise<App.GetTwitchResponse>((resolve, reject) =>
            {
                var success = (json: string) =>
                {
                    var response: Twitch.Response = JSON.parse(json);
                    var promiseResponse: App.GetTwitchResponse = { IsLive: false, StreamId: null };

                    if(response.stream)
                    {
                        promiseResponse.IsLive = true;
                        promiseResponse.StreamId = response.stream._id;  
                    };

                    resolve(promiseResponse);
                };
                var error = (response: any) =>
                {
                    console.log("Error retrieving Twitch status", response);
                    reject("Response from Twitch did not indicate success.");
                };

                this.PrepareRequest(this.TwitchUrl).done(success, error);
            });

            return output;
        };

        public GetCooptionalIsLive: () => WinJS.Promise<App.GetTwitchResponse> = () =>
        {
            var output = new WinJS.Promise<App.GetTwitchResponse>((resolve, reject) =>
            {
                var success = (json: string) =>
                {
                    var response: Twitch.Response = JSON.parse(json);
                    var promiseResponse: App.GetTwitchResponse = { IsLive: false, StreamId: null };

                    if (response.stream)
                    {
                        var streamName = response.stream.channel.status;

                        //We don't want to notify on TB's stream unless it's the podcast or lounge.
                        if (streamName && streamName.toLowerCase().indexOf("optional") !== -1)
                        {
                            promiseResponse.IsLive = true;
                            promiseResponse.StreamId = response.stream._id;
                        };
                    };

                    resolve(promiseResponse);
                };
                var error = (response: any) =>
                {
                    console.log("Error retrieving Cooptional status", response);
                    reject("Response from Twitch did not indicate success.");
                };

                this.PrepareRequest(this.CooptionalUrl).done(success, error);
            });

            return output;
        };

        //#endregion
    }
}