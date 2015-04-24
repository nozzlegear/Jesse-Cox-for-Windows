module App {

    export class ApplicationEngine {

        constructor(apiKey: string) {
            this.ApiKey = apiKey;
        }

        //#region Variables

        //#region Strings

        private ApiKey: string;

        private Referer: string = "https://spacebutterfly.nozzlegear.com";

        private YouTubeUrl: string = "https://www.googleapis.com/youtube/v3/playlistItems?part=id%2Csnippet&playlistId=UUCbfB3cQtkEAiKfdRQnfQvw";

        private TwitchUrl: string = "https://api.twitch.tv/kraken/streams/shaboozey.json";

        private CooptionalUrl: string = "https://api.twitch.tv/kraken/streams/totalbiscuit.json";

        private CoxncrendorUrl: string = "";

        //#endregion

        //#endregion

        //#region Utility functions

        private PrepareRequest = (url: string) => {
            //var request = WinJS.xhr({
            //    url: "",
            //    headers: [],
            //});
        }

        //#endregion

        //#region Core functions

        //#endregion
    }
}