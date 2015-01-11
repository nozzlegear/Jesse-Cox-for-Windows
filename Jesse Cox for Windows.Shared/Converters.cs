using System;
using System.Collections.Generic;
using System.Text;
using Windows.UI.Xaml.Data;

namespace Space_Butterfly.Converters
{
    public class DateConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, string language)
        {
            DateTime d = new DateTime();

            try
            {
                d = DateTime.Parse(value as string);
            }
            catch (Exception e)
            {
                //Do nothing
            }

            return d.ToString("MMM dd, yyyy");
        }

        public object ConvertBack(object value, Type targetType, object parameter, string language)
        {
            throw new NotImplementedException();
        }
    }
}
