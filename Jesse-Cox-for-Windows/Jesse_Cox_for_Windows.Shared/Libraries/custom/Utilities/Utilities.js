var App;
(function (App) {
    (function (Source) {
        Source[Source["YouTube"] = 0] = "YouTube";
        Source[Source["Twitch"] = 1] = "Twitch";
        Source[Source["Cooptional"] = 2] = "Cooptional";
    })(App.Source || (App.Source = {}));
    var Source = App.Source;
    var Utilities = (function () {
        function Utilities() {
        }
        //#region Storage 
        Utilities.RoamingStorage = {
            Save: function (key, value) {
                Windows.Storage.ApplicationData.current.roamingSettings.values[key] = value;
            },
            Retrieve: function (key) {
                return Windows.Storage.ApplicationData.current.roamingSettings.values[key];
            },
            Delete: function (key) {
                Windows.Storage.ApplicationData.current.roamingSettings.values.remove(key);
            },
        };
        Utilities.LocalStorage = {
            Save: function (key, value) {
                Windows.Storage.ApplicationData.current.localSettings.values[key] = value;
            },
            Retrieve: function (key) {
                return Windows.Storage.ApplicationData.current.localSettings.values[key];
            },
            Delete: function (key) {
                Windows.Storage.ApplicationData.current.localSettings.values.remove(key);
            },
        };
        Utilities.SessionStorage = {
            Save: function (key, value) {
                sessionStorage.setItem(key, value);
            },
            Retrieve: function (key) {
                return sessionStorage.getItem(key);
            },
            Delete: function (key) {
                sessionStorage.removeItem(key);
            }
        };
        //#endregion
        Utilities.GetAppSetting = function (key) {
            return WinJS.Resources.getString("AppSettings.private/" + key).value;
        };
        return Utilities;
    })();
    App.Utilities = Utilities;
})(App || (App = {}));
