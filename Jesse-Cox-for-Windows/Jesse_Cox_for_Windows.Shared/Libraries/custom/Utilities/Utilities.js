/// <reference path="../../../typings/winrt/winrt.d.ts" />
/// <reference path="../../../typings/winjs/winjs.d.ts" />
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
                //Signal a data change
                Windows.Storage.ApplicationData.current.signalDataChanged();
            },
            Retrieve: function (key) {
                return Windows.Storage.ApplicationData.current.roamingSettings.values[key];
            },
            Delete: function (key) {
                Windows.Storage.ApplicationData.current.roamingSettings.values.remove(key);
            }
        };
        Utilities.LocalStorage = {
            Save: function (key, value) {
                Windows.Storage.ApplicationData.current.localSettings.values[key] = value;
                //Signal a data change
                Windows.Storage.ApplicationData.current.signalDataChanged();
            },
            Retrieve: function (key) {
                return Windows.Storage.ApplicationData.current.localSettings.values[key];
            },
            Delete: function (key) {
                Windows.Storage.ApplicationData.current.localSettings.values.remove(key);
            },
            SubscribeToChanges: function (handler) {
                Windows.Storage.ApplicationData.current.ondatachanged = handler;
            }
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
        //#region Notification Settings
        Utilities.GetNotificationSettings = function () {
            var youtube = Utilities.LocalStorage.Retrieve("NotifyYouTube");
            var twitch = Utilities.LocalStorage.Retrieve("NotifyTwitch");
            var cooptional = Utilities.LocalStorage.Retrieve("NotifyCooptional");
            var isBoolean = function (val) { return typeof (val) === "boolean"; };
            var output = {
                NotifyYouTube: isBoolean(youtube) ? youtube : true,
                NotifyTwitch: isBoolean(twitch) ? twitch : true,
                NotifyCooptional: isBoolean(cooptional) ? cooptional : true
            };
            return output;
        };
        //#endregion
        Utilities.GetAppSetting = function (key) {
            return WinJS.Resources.getString("AppSettings.private/" + key).value;
        };
        Utilities.IsPhone = IsPhone || false;
        return Utilities;
    })();
    App.Utilities = Utilities;
})(App || (App = {}));
//# sourceMappingURL=utilities.js.map