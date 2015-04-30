/// <reference path="../../default.ts" />
/// <reference path="../../typings/custom/ipage.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/winjs/winjs.d.ts" />
/// <reference path="../../typings/custom/youtube.playlist.video.d.ts" />
// # # #
// ȗțӻ⁸ Marker - DO NOT REMOVE - forces TypeScript to output files as UTF-8.
// # # #
var App;
(function (App) {
    var SettingsController = (function () {
        function SettingsController(Context) {
            var _this = this;
            this.Context = Context;
            this.HandlePageReady = function () {
                _this.PageIsReady(true);
            };
            this.HandlePageUnload = function (args) {
            };
            this.HandlePageUpdateLayout = function (element, args) {
                console.log("Updating");
                _this.Context.IsNarrowViewport(_this.Context.CheckIfNarrowViewport());
            };
            //#region Variables
            this.PageIsReady = ko.observable(false);
        }
        SettingsController.ProcessPage = function (resolve, reject, context) {
            // Using promises (resolve and reject) gives us a chance to asynchronously load any dependencies via requirejs, 
            // or even make a webrequest before loading the page.
            resolve(new SettingsController(context));
        };
        return SettingsController;
    })();
    App.SettingsController = SettingsController;
})(App || (App = {}));
//# sourceMappingURL=settings.js.map