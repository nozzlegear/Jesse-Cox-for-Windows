using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ButterflyCore.Models
{
    public class ToastLaunch
    {
        public ToastLaunch() { }

        public ToastLaunch(string source, string url)
        {
            this.Source = source;
            this.Url = url;
        }

        public string Source { get; set; }
        public string Url { get; set; }
    }
}
