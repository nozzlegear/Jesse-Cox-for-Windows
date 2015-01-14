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
using Space_Butterfly.Extra_Pages;
using Windows.ApplicationModel;
using Windows.Storage;

namespace Space_Butterfly
{
    public sealed partial class MainPage : Page
    {
        #region Initialization

        private NavigationHelper navigationHelper;
        private ObservableCollection<Item> items = new ObservableCollection<Item>();
        private Client core = new Client();
        private Popup popup = new Popup();
        private ApplicationDataContainer localSettings = ApplicationData.Current.LocalSettings;

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

        private async void navigationHelper_LoadState(object sender, LoadStateEventArgs e)
        {
            CheckSources();

            var taskHelper = new TaskHelper();
            string backgroundAccessStorageKey = "LastBackgroundAccessStatus";

            //App must revoke background access, then reregister tasks if it was updated
            var appUpdated = taskHelper.CheckAppVersion();

            //Check/Request background access
            var request = await BackgroundExecutionManager.RequestAccessAsync();

            if (request.ToString() == "Denied")
            {
                await new MessageDialog("Your phone has disabled background tasks for this app. Without background tasks, the app cannot notify you of new videos or current Twitch streams. Please enable background access for this application by going to Settings => Battery Saver => Usage => Jesse Cox for Windows.", "Background Access").ShowAsync();
            }
            else
            {
                //Force register a new task if last background access check was not granted, or if the app was updated
                var forceRegister = localSettings.Values[backgroundAccessStorageKey] as string != request.ToString() || appUpdated;

                taskHelper.RegisterTasks(30, forceRegister); //Lowest possible timer for Windows Phone is 30 min
            }

            //Save the new background access status
            localSettings.Values[backgroundAccessStorageKey] = request.ToString();
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
            this.Frame.Navigate(typeof(SettingsPage));
        }

        private void AboutButton_Click(object sender, RoutedEventArgs e)
        {
            this.Frame.Navigate(typeof(AboutPage));
        }

        private void PrivacyButton_Click(object sender, RoutedEventArgs e)
        {
            this.Frame.Navigate(typeof(PrivacyPage));
        }

        #endregion
    }
}
