using Newtonsoft.Json.Linq;
using ButterflyCore.Models;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.Storage;

namespace Space_Butterfly.Data
{
    public sealed class SampleYTSource
    {
        private static SampleYTSource _sampleAccountsSource = new SampleYTSource();

        private ObservableCollection<Item> _items = new ObservableCollection<Item>();
        public ObservableCollection<Item> Items
        {
            get { return this._items; }
        }

        public static async Task<ObservableCollection<Item>> GetItemsAsync()
        {
            await _sampleAccountsSource.GetSampleItemsAsync();

            return _sampleAccountsSource.Items;
        }

        private async Task GetSampleItemsAsync()
        {
            if (this._items.Count != 0) return;

            //Read json file
            var dataUri = new Uri("ms-appx:///DataModel/SampleData.json");
            var file = await StorageFile.GetFileFromApplicationUriAsync(dataUri);
            var jsonText = await FileIO.ReadTextAsync(file);

            //Decode json and add each account to the collection
            var decodedAccounts = JObject.Parse(jsonText)?.GetValue("Items")?.ToObject<IEnumerable<Item>>();

            foreach (var acc in decodedAccounts)
            {
                this.Items.Add(acc);
            }
        }
    }
}
