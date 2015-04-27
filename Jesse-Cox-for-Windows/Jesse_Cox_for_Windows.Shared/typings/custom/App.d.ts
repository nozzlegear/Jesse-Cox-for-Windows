declare module App
{
    export interface GetTwitchResponse
    {
        IsLive: boolean;
        StreamId: string | number;
    }
} 