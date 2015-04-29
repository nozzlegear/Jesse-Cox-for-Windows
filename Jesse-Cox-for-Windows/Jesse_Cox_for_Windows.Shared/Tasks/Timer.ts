/// <reference path="../libraries/custom/applicationengine/applicationengine.ts" />

// # # #
// ȗțӻ⁸ Marker - DO NOT REMOVE - forces TypeScript to output files as UTF-8.
// # # #

declare var Context: App.Context;
declare var YeahToast: any;

module App
{
    class SourceCheckResult
    {
        constructor(public Type: Source)
        {

        }

        public ShouldShowToast: boolean = false;
        public LaunchUrl: string;
        public ToastThumbnail: string;
    }

    export class TimerTaskController
    {
        constructor(private FinalizeAndCloseTask: () => void)
        {
            this.ImportScripts();
            this.ConfigureVariables();
            this.CheckSources();
        }

        //#region Utility functions

        private ImportScripts()
        {
            //Import App Utilities first, so we can check which version of WinJS to import
            importScripts("ms-appx:///libraries/custom/utilities/utilities.js");

            if (!App.Utilities.IsPhone)
            {
                importScripts("//Microsoft.WinJS.2.0/js/base.js");
            }
            else
            {
                importScripts("//Microsoft.Phone.WinJS.2.1/js/base.js");
            };

            importScripts(
                "ms-appx:///libraries/custom/applicationengine/applicationengine.js",
                "ms-appx:///libraries/yeahtoast/yeahtoast.js");
        }

        private ConfigureVariables()
        {
            this.Engine = new App.ApplicationEngine(App.Utilities.GetAppSetting("YouTubeApiKey"));
        }

        //#endregion

        //#region Variables

        //#region Objects and arrays

        private Engine: App.ApplicationEngine;

        //#endregion

        //#endregion

        //#region Task functions

        private CheckSources()
        {
            // Create a generic 'done' handler for the three sources.
            // Once they all report done we can close the task.
            var settings = App.Utilities.GetNotificationSettings();
            var youtubeResult: SourceCheckResult;
            var twitchResult: SourceCheckResult;
            var cooptionalResult: SourceCheckResult;
            var doneHandler = (data: SourceCheckResult) =>
            {
                switch (data.Type)
                {
                    case App.Source.YouTube:
                        youtubeResult = data;
                        break;

                    case App.Source.Twitch:
                        twitchResult = data;
                        break;

                    case App.Source.Cooptional:
                        cooptionalResult = data;
                        break;
                }

                if (youtubeResult && twitchResult && cooptionalResult)
                {
                    //Check if we need to show a toast. Twitch > Cooptional > Youtube. Cannot show images in toasts on WP.
                    if (cooptionalResult.ShouldShowToast && settings.NotifyCooptional)
                    {
                        YeahToast.show({
                            title: "The Co-Optional Podcast is live on Twitch!",
                            launchString: cooptionalResult.LaunchUrl,
                            imgsrc: App.Utilities.IsPhone ? null : cooptionalResult.ToastThumbnail
                        });
                    }
                    else if (twitchResult.ShouldShowToast && settings.NotifyTwitch)
                    {
                        YeahToast.show({
                            title: "Jesse Cox is live on Twitch!",
                            launchString: twitchResult.LaunchUrl,
                            imgsrc: App.Utilities.IsPhone ? null : twitchResult.ToastThumbnail
                        });
                    }
                    else if (youtubeResult.ShouldShowToast && settings.NotifyYouTube)
                    {
                        YeahToast.show({
                            title: "Jesse Cox has uploaded a new video!",
                            launchString: youtubeResult.LaunchUrl,
                            imgsrc: App.Utilities.IsPhone ? null : youtubeResult.ToastThumbnail
                        });
                    };

                    // Finally, close the task.
                    this.FinalizeAndCloseTask();
                };
            };
            var errorHandler = (data: SourceCheckResult) =>
            {
                // Errors can be ignored in the background task.
                // Always invoke the doneHandler to clear the overlay
                doneHandler(data);
            };

            this.CheckYouTubeVideos().done(doneHandler, errorHandler);
            this.CheckTwitch().done(doneHandler, errorHandler);
            this.CheckCooptional().done(doneHandler, errorHandler);
        }

        private CheckYouTubeVideos = () =>
        {
            var promise = new WinJS.Promise<SourceCheckResult>((resolve, reject) =>
            {
                var output = new SourceCheckResult(App.Source.YouTube);
                var success = (playlist: YouTube.Playlist) =>
                {
                    var video = playlist.items && playlist.items[0];
                    var storageKey = "LastYouTubeId";

                    if (video)
                    {
                        // Check if we've seen this video before.
                        if (App.Utilities.LocalStorage.Retrieve(storageKey) !== video.id)
                        {
                            output.ShouldShowToast = true;
                            output.LaunchUrl = "https://www.youtube.com/watch?v=" + video.snippet.resourceId.videoId
                            output.ToastThumbnail = video.snippet.thumbnails.default.url;

                            //Save the video's id so we don't show more toasts for it in the future. 
                            App.Utilities.LocalStorage.Save(storageKey, video.id);
                        }
                    }

                    resolve(output);
                };
                var error = (reason: string) =>
                {
                    console.log("Failed to retrieve YouTube videos. Reason: ", reason)
                    reject(output);
                };

                this.Engine.GetYouTubeVideos(1).done(success, error);
            });

            return promise;
        };

        private CheckTwitch = () =>
        {
            var promise = new WinJS.Promise<SourceCheckResult>((resolve, reject) =>
            {
                var output = new SourceCheckResult(App.Source.Twitch);
                var success = (data: App.GetTwitchResponse) =>
                {
                    var storageKey = "LastTwitchId";

                    if (data.IsLive)
                    {
                        console.log("Twitch stream", data.StreamId);

                        // Check if we've seen this video before.
                        if (App.Utilities.LocalStorage.Retrieve(storageKey) !== data.StreamId)
                        {
                            output.ShouldShowToast = true;
                            output.LaunchUrl = "https://twitch.tv/shaboozey";
                            output.ToastThumbnail = "/images/live-now.png";

                            //Save the video's id so we don't show more toasts for it in the future. 
                            App.Utilities.LocalStorage.Save(storageKey, data.StreamId);
                        }
                    }

                    resolve(output);
                };
                var error = (reason: string) =>
                {
                    console.log("Failed to retrieve Twitch status. Reason: ", reason);
                    reject(output);
                };

                this.Engine.GetTwitchIsLive().done(success, error);
            });

            return promise;
        };

        private CheckCooptional = () =>
        {
            var promise = new WinJS.Promise<SourceCheckResult>((resolve, reject) =>
            {
                var output = new SourceCheckResult(App.Source.Cooptional)
                var success = (data: App.GetTwitchResponse) =>
                {
                    var storageKey = "LastCooptionalId";

                    if (data.IsLive)
                    {
                        console.log("Cooptional stream", data.StreamId);

                        // Check if we've seen this video before.
                        if (App.Utilities.LocalStorage.Retrieve(storageKey) !== data.StreamId)
                        {
                            output.ShouldShowToast = true;
                            output.LaunchUrl = "https://twitch.tv/totalbiscuit";
                            output.ToastThumbnail = "/images/live-now.png";

                            //Save the video's id so we don't show more toasts for it in the future. 
                            App.Utilities.LocalStorage.Save(storageKey, data.StreamId);
                        }
                    }

                    resolve(output);
                };
                var error = (reason: string) =>
                {
                    console.log("Failed to retrieve Cooptional status. Reason: ", reason);
                    reject(output);
                };

                this.Engine.GetCooptionalIsLive().done(success, error);
            });

            return promise;
        };

        //#endregion
    }
}