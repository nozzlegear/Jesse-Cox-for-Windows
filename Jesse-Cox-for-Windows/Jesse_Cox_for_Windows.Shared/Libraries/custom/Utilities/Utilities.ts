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

        static GetAppSetting = (key: string) =>
        {
            return WinJS.Resources.getString("AppSettings.private/" + key).value;
        }

        static IsPhone = IsPhone || false;
    }
}