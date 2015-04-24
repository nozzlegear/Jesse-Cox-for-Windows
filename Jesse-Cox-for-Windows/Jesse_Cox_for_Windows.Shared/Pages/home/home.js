/// <reference path="../../typings/custom/youtube.playlist.video.d.ts" />
var App;
(function (App) {
    var HomeController = (function () {
        function HomeController(context) {
            var _this = this;
            this.HandlePageReady = function () {
                _this.PageIsReady(true);
            };
            this.HandlePageUnload = function (args) {
                _this.Videos(null);
            };
            this.HandlePageUpdateLayout = function (element, args) {
            };
            this.Videos = ko.observableArray([]);
            //#endregion
            //#region Booleans
            this.PageIsReady = ko.observable(false);
            // TODO: Request videos
        }
        HomeController.ProcessPage = function (resolve, reject, context) {
            // Using promises (resolve and reject) gives us a chance to asynchronously load any dependencies via requirejs, 
            // or even make a webrequest before loading the page.
            resolve(new HomeController(context));
        };
        return HomeController;
    })();
    App.HomeController = HomeController;
})(App || (App = {}));
//# sourceMappingURL=home.js.map