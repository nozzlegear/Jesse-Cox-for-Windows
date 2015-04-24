declare module App {
    export interface IPage {
        HandlePageReady: () => void;
        HandlePageUnload: (args: any) => void;
        HandlePageUpdateLayout: (element: any, args: any) => void;
    }
} 