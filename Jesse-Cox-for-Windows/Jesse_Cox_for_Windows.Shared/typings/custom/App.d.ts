declare module App
{
    export interface GetTwitchResponse
    {
        IsLive: boolean;
        StreamId: string | number;
    }

    export interface NotificationSettings
    {
        NotifyYouTube: boolean;
        NotifyTwitch: boolean;
        NotifyCooptional: boolean;
    }

    export interface ObservableNotificationSettings
    {
        NotifyYouTube: KnockoutObservable<boolean>;
        NotifyTwitch: KnockoutObservable<boolean>;
        NotifyCooptional: KnockoutObservable<boolean>;
    }
} 