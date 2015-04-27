declare module Twitch
{

    export interface Links
    {
        self: string;
        channel: string;
    }

    export interface Links2
    {
        self: string;
    }

    export interface Preview
    {
        small: string;
        medium: string;
        large: string;
        template: string;
    }

    export interface Links3
    {
        self: string;
        follows: string;
        commercial: string;
        stream_key: string;
        chat: string;
        features: string;
        subscriptions: string;
        editors: string;
        videos: string;
        teams: string;
    }

    export interface Channel
    {
        _links: Links3;
        background?: any;
        banner?: any;
        broadcaster_language: string;
        display_name: string;
        game: string;
        logo: string;
        mature: boolean;
        status: string;
        partner: boolean;
        url: string;
        video_banner: string;
        _id: number;
        name: string;
        created_at: Date;
        updated_at: Date;
        delay: number;
        followers: number;
        profile_banner?: any;
        profile_banner_background_color?: any;
        views: number;
        language: string;
    }

    export interface Stream
    {
        _id: number;
        game: string;
        viewers: number;
        created_at: Date;
        video_height: number;
        average_fps: number;
        _links: Links2;
        preview: Preview;
        channel: Channel;
    }

    export interface Response
    {
        _links: Links;
        stream: Stream;
    }

}

