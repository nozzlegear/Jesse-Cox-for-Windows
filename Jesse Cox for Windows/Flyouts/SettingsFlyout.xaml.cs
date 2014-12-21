using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.Storage;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// The Settings Flyout item template is documented at http://go.microsoft.com/fwlink/?LinkId=273769

namespace Space_Butterfly
{
    public sealed partial class GeneralSettingsFlyout : SettingsFlyout
    {
        private ApplicationDataContainer LocalSettings = ApplicationData.Current.LocalSettings;

        public GeneralSettingsFlyout()
        {
            this.InitializeComponent();

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

            //Set togglers
            this.YTToggler.IsOn = NotifyYouTube.Value;
            this.StreamToggler.IsOn = NotifyStream.Value;
            this.PodcastToggler.IsOn = NotifyPodcast.Value;
        }

        private void PodcastToggler_Toggled(object sender, RoutedEventArgs e)
        {
            LocalSettings.Values["NotifyPodcast"] = (sender as ToggleSwitch).IsOn;
        }

        private void StreamToggler_Toggled(object sender, RoutedEventArgs e)
        {
            LocalSettings.Values["NotifyStream"] = (sender as ToggleSwitch).IsOn;
        }

        private void YTToggler_Toggled(object sender, RoutedEventArgs e)
        {
            LocalSettings.Values["NotifyYouTube"] = (sender as ToggleSwitch).IsOn;
        }
    }
}
