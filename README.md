Jesse Cox for Windows
=====================

A lightweight XAML Windows app built in a day as an exercise in learning WinRT development basics. It notifies users when Jesse Cox uploads a new video to YouTube, or when he (or the Co-optional Podcast) goes live on Twitch. 

This is a **BETA** release, there will likely be bugs. Additionally, this release has not yet been tested on devices with smaller screens, and there are expected to be display-related issues on these devices.

=====================

To build:

1. Clone this repository.
2. Open the /Jesse Cox for Windows/Package.appxmanifest file.
3. Go to the Packaging tab. 
4. Click the 'Choose Certificate' button.
5. Click the 'Configure Test Certificate' button and create a new test certificate.

=====================

**NB**: This project was created with the Visual Studio 2015 Ultimate preview, and therefore makes use of a few .NET and C# language features that are not currently present in older versions of Visual Studio.

Specifically, the project makes use of the **[null propagating](https://roslyn.codeplex.com/discussions/540883)** language feature. If you're using older versions of Visual Studio you will likely need to remove the null propagating syntax and replace them with standard null checks. 

[An example of null propagation in this project.](https://github.com/asyncwords/Jesse-Cox-for-Windows/blob/master/Background%20Tasks/SourceCheckerTask.cs#L78)

=====================

**TODO**:

1. Notify on new Cox n' Crendor podcast releases by polling the podcast's feedburner URL.
2. Ensure the Co-optional Podcast check only notifies on Co-optional Podcasts and not other random streams.
3. Add a timer to the MainPage.xaml.cs file that will update new videos and display a link to Twitch streams without having to manually press the 'Refresh' button.
4. Clean up the MainPage.xaml.cs file.
5. Clean up the images in /Jesse Cox for Windows/Assets/Cox/ folder.
6. Test on smaller devices.
7. Add a Windows Phone app if there's enough demand (or if I don't have anything better to do).