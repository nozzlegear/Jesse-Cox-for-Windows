Jesse Cox for Windows
=====================

A lightweight Windows and Windows Phone app built with native TypeScript, WinJS and HTML. It notifies users when Jesse Cox uploads a new video to YouTube, or when he (or the Co-optional Podcast) goes live on Twitch. 

[Download this app on the Windows store!](http://apps.microsoft.com/windows/app/jesse-cox-for-windows/3911c24b-4b3b-4247-9932-439b68974b58)

[Download this app on the Windows Phone store!](http://www.windowsphone.com/s?appid=c0562347-055c-4812-a6f7-8f6020f3388c)

[This is a video of the app in action.](https://www.youtube.com/watch?v=-iNRvat2QBA)

=====================

**JavaScript? What the heck?**

This project has been rewritten from XAML and C# to HTML and JavaScript using WinJS. "But wait,"  you might say, "isn't javascript slow, bad and stupid?". Nope! Personally, I'm a big fan of using JavaScript when it's written with type safety using TypeScript. On top of that, WinJS apps (those written in HTML and JavaScript) are supported natively on the Windows, Windows Phone and Xbox platforms. These apps aren't web wrappers, which means they are just as performant as C# and XAML apps. 

=====================

**Building and compiling the project.**

If you want to compile this project, you'll need to install NPM, Bower, Grunt and TypeScript@1.4.1. If you have NPM installed, just change directory to this project in your terminal and install all of the required tools with `npm install`.

Once you've installed the tools, you'll need to create the `AppSettings.private.resjson` file inside `Jesse-Cox-for-Windows/Jesse_Cox_for_Windows.Shared/`. This file holds private app settings and API keys which should not and are not stored in source control. Right now the only app setting you'll need is a YouTube API V3 key, which you can get from [your Google developer console](https://console.developers.google.com).

Here's what your `AppSettings.private.resjson` file should look like:

```
{
  "YouTubeApiKey" : "myApiKey"
}
```

=====================

**TODO**:

1. Notify on new Cox n' Crendor podcast releases by polling the podcast's feedburner URL.
2. Notify when Stellar Lotus is streaming?

