/// <reference path="../../default.ts" />
/// <reference path="../../typings/custom/ipage.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/winjs/winjs.d.ts" />
/// <reference path="../../typings/custom/youtube.playlist.video.d.ts" />

// # # #
// ȗțӻ⁸ Marker - DO NOT REMOVE - forces TypeScript to output files as UTF-8.
// # # #

module App
{
    export class AboutController implements App.IPage
    {
        static ProcessPage = (resolve: (pageController: App.IPage) => void, reject: (reason: string) => void, context: App.Context) =>
        {
            // Using promises (resolve and reject) gives us a chance to asynchronously load any dependencies via requirejs, 
            // or even make a webrequest before loading the page.
            resolve(new AboutController(context));
        }

        constructor(public Context: App.Context)
        {

        }

        public HandlePageReady = () =>
        {
            this.PageIsReady(true);
        }

        public HandlePageUnload = (args: any) =>
        {
            
        }

        public HandlePageUpdateLayout = (element: any, args: any) =>
        {
            console.log("Updating");

            this.Context.IsNarrowViewport(this.Context.CheckIfNarrowViewport());
        }

        //#region Variables

        public PageIsReady = ko.observable(false);

        //#endregion
    }
}