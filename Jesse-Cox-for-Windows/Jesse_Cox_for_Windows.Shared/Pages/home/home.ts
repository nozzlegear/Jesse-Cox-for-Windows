/// <reference path="../../typings/custom/youtube.playlist.video.d.ts" />
module App {
    export class HomeController implements App.IPage {

        static ProcessPage = (resolve: (pageController: App.IPage) => void, reject: (reason: string) => void, context: App.Context) => {
            // Using promises (resolve and reject) gives us a chance to asynchronously load any dependencies via requirejs, 
            // or even make a webrequest before loading the page.
            resolve(new HomeController(context));
        }

        constructor(context: App.Context) {
            // TODO: Request videos
        }

        public HandlePageReady = () => {
            this.PageIsReady(true);
        }

        public HandlePageUnload = (args: any) => {
            this.Videos(null);
        }

        public HandlePageUpdateLayout = (element: any, args: any) => {

        }

        //#region Variables

        //#region Objects and array

        public Context: App.Context;

        public Videos = ko.observableArray<YouTube.Playlist.Item[]>([]);

        //#endregion

        //#region Booleans

        public PageIsReady = ko.observable(false);

        //#endregion

        //#endregion
    }
}