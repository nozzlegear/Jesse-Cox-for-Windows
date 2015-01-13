using System;
using System.Collections.Generic;
using System.Text;
using Windows.ApplicationModel;
using Windows.ApplicationModel.Background;
using System.Linq;
using Windows.Storage;

namespace Space_Butterfly
{
    internal class TaskHelper
    {
        private readonly string TaskName = "SBSourceCheckingTask";

        // Check for app updates. If an update occurred, we must remove background access and request it again
        /// <summary>
        /// Checks if the app has been updated since the last run. If so, we must remove background access and request it again,
        /// then re-register all background tasks.
        /// </summary>
        /// <returns>A boolean indicating background access revokation. True if revoked, false if not.</returns>
        public bool CheckAppVersion()
        {
            string appVersion = string.Format("{0}.{1}.{2}.{3}",
                    Package.Current.Id.Version.Build,
                    Package.Current.Id.Version.Major,
                    Package.Current.Id.Version.Minor,
                    Package.Current.Id.Version.Revision);

            if (ApplicationData.Current.LocalSettings.Values["AppVersion"] as string != appVersion)
            {
                // Our app has been updated
                ApplicationData.Current.LocalSettings.Values["AppVersion"] = appVersion;

                // Call RemoveAccess
                BackgroundExecutionManager.RemoveAccess();

                return true;
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// Registers background tasks if they aren't already registered, or if the app was recently updated (and therefore needs to re-register tasks).
        /// </summary>
        /// <param name="forceRegister">A boolean indicating that we should disregard whether the task already exists and instead force register a new one. Desirable if the app has been updated or background access was initially denied but is not granted.</param>
        public void RegisterTasks(bool forceRegister = false)
        {
            //Try to find task
            var task = BackgroundTaskRegistration.AllTasks.FirstOrDefault(x => x.Value?.Name == TaskName);

            if (task.Value == null || forceRegister)
            {
                if (forceRegister)
                {
                    //Unregister last task.
                    task.Value?.Unregister(true);
                }

                //Register task
                var taskBuilder = new BackgroundTaskBuilder()
                {
                    Name = TaskName,
                    TaskEntryPoint = "Background_Tasks.SourceCheckerTask"
                };

                taskBuilder.SetTrigger(new TimeTrigger(30, false));
                taskBuilder.AddCondition(new SystemCondition(SystemConditionType.InternetAvailable));

                var registration = taskBuilder.Register();
            }
        }
    }
}
