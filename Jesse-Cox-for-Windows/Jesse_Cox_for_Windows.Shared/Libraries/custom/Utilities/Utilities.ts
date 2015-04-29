/// <reference path="../../../typings/winrt/winrt.d.ts" />
/// <reference path="../../../typings/winjs/winjs.d.ts" />

// # # #
// ȗțӻ⁸ Marker - DO NOT REMOVE - forces TypeScript to output files as UTF-8.
// # # #

declare var IsPhone: boolean;

module App
{
    export enum Source
    {
        YouTube,
        Twitch,
        Cooptional
    }

    export class Utilities
    {
        //#region Storage 

        static RoamingStorage = {
            Save: (key: string, value: any) =>
            {
                Windows.Storage.ApplicationData.current.roamingSettings.values[key] = value;

                //Signal a data change
                Windows.Storage.ApplicationData.current.signalDataChanged();
            },
            Retrieve: (key: string) =>
            {
                return Windows.Storage.ApplicationData.current.roamingSettings.values[key];
            },
            Delete: (key: string) =>
            {
                Windows.Storage.ApplicationData.current.roamingSettings.values.remove(key);
            },
        };

        static LocalStorage = {
            Save: (key: string, value: any) =>
            {
                Windows.Storage.ApplicationData.current.localSettings.values[key] = value;

                //Signal a data change
                Windows.Storage.ApplicationData.current.signalDataChanged();
            },
            Retrieve: (key: string) =>
            {
                return Windows.Storage.ApplicationData.current.localSettings.values[key];
            },
            Delete: (key: string) =>
            {
                Windows.Storage.ApplicationData.current.localSettings.values.remove(key);
            },
            SubscribeToChanges: (handler: (args: any) => void) =>
            {
                Windows.Storage.ApplicationData.current.ondatachanged = handler;
            }
        };

        static SessionStorage = {
            Save: (key: string, value: any) =>
            {
                sessionStorage.setItem(key, value);
            },
            Retrieve: (key: string) =>
            {
                return sessionStorage.getItem(key);
            },
            Delete: (key: string) =>
            {
                sessionStorage.removeItem(key);
            }
        };

        //#endregion

        //#region Notification Settings

        static GetNotificationSettings: () => NotificationSettings = () =>
        {
            var youtube = Utilities.LocalStorage.Retrieve("NotifyYouTube");
            var twitch = Utilities.LocalStorage.Retrieve("NotifyTwitch");
            var cooptional = Utilities.LocalStorage.Retrieve("NotifyCooptional");
            var isBoolean = (val: boolean) => typeof (val) === "boolean";
            var output: NotificationSettings = {
                NotifyYouTube: isBoolean(youtube) ? youtube : true,
                NotifyTwitch: isBoolean(twitch) ? twitch : true,
                NotifyCooptional: isBoolean(cooptional) ? cooptional : true,
            };
            
            return output;
        };

        //#endregion

        static GetAppSetting = (key: string) =>
        {
            return WinJS.Resources.getString("AppSettings.private/" + key).value;
        }

        static IsPhone = IsPhone || false;
    }
}