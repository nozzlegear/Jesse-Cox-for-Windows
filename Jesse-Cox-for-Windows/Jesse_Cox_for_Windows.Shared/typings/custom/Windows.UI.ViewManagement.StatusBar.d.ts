declare module Windows
{
    export module UI
    {
        export module ViewManagement
        {
            export class StatusBarProgressIndicator
            {
                hideAsync: () => void;
                showAsync: () => void;

                progressValue: Windows.Foundation.IReference<number>;
                text: string;
            }

            export class StatusBar
            {
                static getForCurrentView: () => StatusBar;

                hideAsync: () => void;
                showAsync: () => void;

                backgroundColor: Windows.Foundation.IReference<Color> | Color;
                backgroundOpacity: number;
                foregroundColor: Windows.Foundation.IReference<Color> | Color;
                occludedRect: Windows.Foundation.Rect;
                progressIndicator: StatusBarProgressIndicator;
            }
        }
    }
}