using Space_Butterfly.Common;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using Windows.ApplicationModel.Background;
using Windows.System;
using Windows.UI.Popups;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media.Imaging;
using Windows.UI.Xaml.Navigation;
using ButterflyCore;
using ButterflyCore.Models;

namespace Space_Butterfly
{
    public sealed partial class MainPage : Page
    {
        #region Initialization

        private NavigationHelper navigationHelper;
        private ObservableCollection<Item> items = new ObservableCollection<Item>();
        private Client core = new Client();
        private Popup popup = new Popup();

        public NavigationHelper NavigationHelper
        {
            get { return this.navigationHelper; }
        }

        public ObservableCollection<Item> Items
        {
            get { return this.items; }
        }

        public MainPage()
        {
            this.InitializeComponent();
            this.navigationHelper = new NavigationHelper(this);
            this.navigationHelper.LoadState += navigationHelper_LoadState;
        }
        private void navigationHelper_LoadState(object sender, LoadStateEventArgs e)
        {
            CheckSources();
            CheckTaskRegistration();
        }

        #endregion

        #region Background Task Registration

        private readonly string TaskName = "SBSourceCheckingTask";

        private async void CheckTaskRegistration()
        {
            //Try to find task
            var task = BackgroundTaskRegistration.AllTasks.FirstOrDefault(x => x.Value?.Name == TaskName);

            if (task.Value == null)
            {
                //Register task
                var taskBuilder = new BackgroundTaskBuilder()
                {
                    Name = TaskName,
                    TaskEntryPoint = "Background_Tasks.SourceCheckerTask"
                };

                taskBuilder.SetTrigger(new TimeTrigger(30, false));
                taskBuilder.AddCondition(new SystemCondition(SystemConditionType.InternetAvailable));

                //App needs to be added to lock screen to run background tasks. Request permission.
                await BackgroundExecutionManager.RequestAccessAsync(); //NOTE: App can only ask permission once. User will need to manually place app on lock screen if declined.

                var registration = taskBuilder.Register();

                string breaker = null;
            }
        }

        #endregion 

        #region NavigationHelper registration

        /// The methods provided in this section are simply used to allow
        /// NavigationHelper to respond to the page's navigation methods.
        /// 
        /// Page specific logic should be placed in event handlers for the  
        /// <see cref="Common.NavigationHelper.LoadState"/>
        /// and <see cref="Common.NavigationHelper.SaveState"/>.
        /// The navigation parameter is available in the LoadState method 
        /// in addition to page state preserved during an earlier session.

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            navigationHelper.OnNavigatedTo(e);
        }

        protected override void OnNavigatedFrom(NavigationEventArgs e)
        {
            navigationHelper.OnNavigatedFrom(e);
        }

        #endregion

        #region Launch handlers

        private Uri LiveChannelUrl;

        private async void ItemView_ItemClick(object sender, ItemClickEventArgs e)
        {
            //Get item's url
            var url = ((Item)e.ClickedItem).player.@default;

            await Launcher.LaunchUriAsync(new Uri(url));
        }

        private async void TwitchLink_Click(Windows.UI.Xaml.Documents.Hyperlink sender, Windows.UI.Xaml.Documents.HyperlinkClickEventArgs args)
        {
            if (LiveChannelUrl != null)
            {
                await Launcher.LaunchUriAsync(LiveChannelUrl);
            }
        }

        private async void HeaderImage_Tapped(object sender, TappedRoutedEventArgs e)
        {
            if (LiveChannelUrl != null)
            {
                await Launcher.LaunchUriAsync(LiveChannelUrl);
            }
        }

        #endregion

        #region Popup

        private void ShowPopup()
        {
            this.pageRoot.Opacity = .2;

            //Create overlay and add it to popup
            var overlay = new ProgressOverlay();
            this.popup.Child = overlay;
            this.popup.IsOpen = true;
        }

        private void HidePopup()
        {
            this.pageRoot.Opacity = 1;
            this.popup.IsOpen = false;
        }

        #endregion

        #region Utilities

        private async void CheckSources()
        {
            ShowPopup();

            //Disable channel url
            LiveChannelUrl = null;

            // Use ButterflyCore to load data
            var items = await core.GetYouTubeUploads();

            var dialog = new MessageDialog("", "Something went wrong with YouTube.");

            if (!items.Success)
            {
                dialog.Content = items.Message;
                await dialog.ShowAsync();
            }
            else if (items.Data?.data?.items == null || items.Data.data.items.Count == 0)
            {
                dialog.Content = "An error prevented the app from downloading the latest YouTube videos.";
                await dialog.ShowAsync();
            }
            else
            {
                //Clear items
                this.items.Clear();

                //Add items to collection
                foreach (var item in items.Data?.data?.items)
                {
                    this.Items.Add(item);
                }

                //Further dialog errors will be due to Twitch
                dialog.Title = "Something went wrong with Twitch.";

                //Grab Twitch status
                var twitchStatus = await core.GetTwitchStatus();

                if (!twitchStatus.Success)
                {
                    dialog.Content = twitchStatus.Message;
                    await dialog.ShowAsync();
                }
                else
                {
                    // Check if live. If not, check cooptional status
                    if (twitchStatus.Data?.stream != null)
                    {
                        //The Cox is live
                        //SetHeaderImage(twitchStatus.Data?.stream.preview.medium);
                        LiveChannelUrl = new Uri(twitchStatus.Data.stream.channel.url);
                    }
                    else
                    {
                        var coopStatus = await core.GetCooptionalStatus();

                        if (!coopStatus.Success)
                        {
                            dialog.Content = coopStatus.Message;
                            await dialog.ShowAsync();
                        }
                        else
                        {
                            if (coopStatus.Data?.stream != null && coopStatus.Data.stream.channel.status.ToLower().Contains("optional"))
                            {
                                //Podcast is live
                                //SetHeaderImage(coopStatus.Data?.stream.preview.medium);
                                LiveChannelUrl = new Uri(coopStatus.Data.stream.channel.url);
                            }
                        }
                    }
                }
            }

            HidePopup();
        }

        #endregion

        #region Click handlers

        private void RefreshButton_Click(object sender, RoutedEventArgs e)
        {
            CheckSources();
            BottomBar.IsOpen = false;
        }

        private void SettingsButton_Click(object sender, RoutedEventArgs e)
        {
            //var flyout = new GeneralSettingsFlyout();
            //flyout.Show();

            BottomBar.IsOpen = false;
        }

        #endregion
    }
}
