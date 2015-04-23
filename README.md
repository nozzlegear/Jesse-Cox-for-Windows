Jesse Cox for Windows
=====================

A lightweight XAML Windows app built in a day as an exercise in learning WinRT development basics. It notifies users when Jesse Cox uploads a new video to YouTube, or when he (or the Co-optional Podcast) goes live on Twitch. 

[Download this app on the Windows store!](http://apps.microsoft.com/windows/app/jesse-cox-for-windows/3911c24b-4b3b-4247-9932-439b68974b58)

[Download this app on the Windows Phone store!](http://www.windowsphone.com/s?appid=c0562347-055c-4812-a6f7-8f6020f3388c)

This is a **BETA** release, there will likely be bugs. Additionally, this release has not yet been tested on devices with smaller screens, and there are expected to be display-related issues on these devices.

[This is a video of the app in action.](https://www.youtube.com/watch?v=-iNRvat2QBA)

=====================

**NB**: This project was created with the Visual Studio 2015 Ultimate preview, and therefore makes use of a few .NET and C# language features that are not currently present in older versions of Visual Studio.

Specifically, the project makes use of the **[null propagating](https://roslyn.codeplex.com/discussions/540883)** language feature. If you're using older versions of Visual Studio you will likely need to remove the null propagating syntax and replace them with standard null checks. 

[An example of null propagation in this project.](https://github.com/asyncwords/Jesse-Cox-for-Windows/blob/master/Background%20Tasks/SourceCheckerTask.cs#L78)

=====================

**TODO**:

1. Notify on new Cox n' Crendor podcast releases by polling the podcast's feedburner URL.
2. Add a timer to the MainPage.xaml.cs file that will update new videos and display a link to Twitch streams without having to manually press the 'Refresh' button.
3. Test on smaller devices.

