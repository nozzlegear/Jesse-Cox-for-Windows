declare module YouTube {

    export interface Playlist {
        kind: string;
        etag: string;
        nextPageToken: string;
        pageInfo: Playlist.PageInfo;
        items: Playlist.Item[];
    }

    export module Playlist {

        export interface PageInfo {
            totalResults: number;
            resultsPerPage: number;
        }

        export interface Default {
            url: string;
            width: number;
            height: number;
        }

        export interface Medium {
            url: string;
            width: number;
            height: number;
        }

        export interface High {
            url: string;
            width: number;
            height: number;
        }

        export interface Standard {
            url: string;
            width: number;
            height: number;
        }

        export interface Maxres {
            url: string;
            width: number;
            height: number;
        }

        export interface Thumbnails {
            default: Default;
            medium: Medium;
            high: High;
            standard: Standard;
            maxres: Maxres;
        }

        export interface ResourceId {
            kind: string;
            videoId: string;
        }

        export interface Snippet {
            publishedAt: Date;
            channelId: string;
            title: string;
            description: string;
            thumbnails: Thumbnails;
            channelTitle: string;
            playlistId: string;
            position: number;
            resourceId: ResourceId;
        }

        export interface Item {
            kind: string;
            etag: string;
            id: string;
            snippet: Snippet;
        }

    }

}