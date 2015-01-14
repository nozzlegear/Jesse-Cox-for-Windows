using ButterflyCore;
using ButterflyCore.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.ApplicationModel.Background;
using Windows.Data.Xml.Dom;
using Windows.Storage;
using Windows.UI.Notifications;

namespace Background_Tasks
{
    public sealed class SourceCheckerTask : IBackgroundTask
    {
        private Client core = new Client();
        private ApplicationDataContainer LocalSettings = ApplicationData.Current.LocalSettings;

        public SourceCheckerTask()
        {

        }

        public async void Run(IBackgroundTaskInstance taskInstance)
        {
            //Async background tasks must use deferrals on the task instance
            var deferal = taskInstance.GetDeferral();

#if DEBUG
            CreateAndShowToast("http://placehold.it/300x300", "Checked at \{DateTime.Now}.", null);
#endif

            //Get settings
            var NotifyYouTube = LocalSettings.Values["NotifyYouTube"] as bool?;
            var NotifyStream = LocalSettings.Values["NotifyStream"] as bool?;
            var NotifyPodcast = LocalSettings.Values["NotifyPodcast"] as bool?;

            //Default all notification settings to true if they don't have a value
            if (!NotifyYouTube.HasValue)
            {
                NotifyYouTube = true;
                LocalSettings.Values["NotifyYouTube"] = true;
            }
            if (!NotifyStream.HasValue)
            {
                NotifyStream = true;
                LocalSettings.Values["NotifyStream"] = true;
            }
            if (!NotifyPodcast.HasValue)
            {
                NotifyPodcast = true;
                LocalSettings.Values["NotifyPodcast"] = true;
            }

            //Check sources according to settings
            if (NotifyYouTube.Value == true) await CheckYouTube();
            if (NotifyStream.Value == true) await CheckStream();
            if (NotifyPodcast.Value == true) await CheckPodcast();

            deferal.Complete();
        }

        private async Task CheckYouTube()
        {
            var youtubeCheck = await core.GetYouTubeUploads(1); //Only get latest video

            if (youtubeCheck.Success && youtubeCheck.Data != null)
            {
                //Get id of last video to check if there are any new videos
                var lastVideoId = LocalSettings.Values["LastVideoId"] as string;

                //Get the latest video 
                var latestVideo = youtubeCheck.Data.data?.items?.OrderByDescending(x => x.uploaded)?.FirstOrDefault();

                if (string.IsNullOrEmpty(lastVideoId) || (latestVideo != null && latestVideo.id?.ToLower() != lastVideoId?.ToLower()))
                {
                    //Show notification
                    CreateAndShowToast(latestVideo.thumbnail.sqDefault, "Jesse Cox has uploaded a new video!", latestVideo.player.@default);

                    //Store new video id
                    LocalSettings.Values["LastVideoId"] = latestVideo.id;
                }
            }
        }

        private async Task CheckStream()
        {
            var streamCheck = await core.GetTwitchStatus();

            if (streamCheck.Success && streamCheck.Data != null && streamCheck.Data.stream != null)
            {
                //Get id of last stream
                var lastStreamId = LocalSettings.Values["LastStreamId"] as string;

                if (lastStreamId?.ToLower() != streamCheck.Data.stream?._id?.ToLower())
                {
                    //Show notification
                    CreateAndShowToast(streamCheck.Data.stream.channel?.video_banner, "Jesse Cox just went live on Twitch!", streamCheck.Data.stream.channel.url);

                    //Save stream id to prevent multiple notifications
                    LocalSettings.Values["LastStreamId"] = streamCheck.Data.stream._id;
                }
            }
        }

        private async Task CheckPodcast()
        {
            var podcastCheck = await core.GetCooptionalStatus();

            if (podcastCheck.Success && podcastCheck.Data?.stream != null)
            {
                //Get id of last podcast stream
                var lastPodcastStreamId = LocalSettings.Values["LastPodcastStreamId"] as string;

                // Check for an instance of 'Optional' in the stream's channel status description. 
                if (lastPodcastStreamId?.ToLower() != podcastCheck.Data.stream?._id?.ToLower() && podcastCheck.Data.stream.channel.status.ToLower().Contains("optional"))
                {
                    //Show notification
                    CreateAndShowToast(podcastCheck.Data.stream.channel?.video_banner, "The Co-Optional Podcast just went live on Twitch!", podcastCheck.Data.stream.channel.url);

                    //Save podcast stream id to prevent multiple notifications
                    LocalSettings.Values["LastPodcastStreamId"] = podcastCheck.Data.stream._id;
                }
            }
        }

        private void CreateAndShowToast(string imageSource, string text, string launchUrl)
        {
            try
            {
                var xml = ToastNotificationManager.GetTemplateContent(ToastTemplateType.ToastImageAndText01);

                //Set toast image
                ((XmlElement)xml.GetElementsByTagName("image")[0]).SetAttribute("src", imageSource);

                //Get xml text
                xml.GetElementsByTagName("text")[0].AppendChild(xml.CreateTextNode(text));

                if (!string.IsNullOrEmpty(launchUrl))
                {
                    ((XmlElement)xml.SelectSingleNode("/toast")).SetAttribute("launch", JsonConvert.SerializeObject(new ToastLaunch("SourceCheckerTask", launchUrl)));
                }

                ToastNotificationManager.CreateToastNotifier().Show(new ToastNotification(xml));
            }
            catch (Exception e)
            {
                //Do nothing. No way to warn user
            }
        }
    }
}
