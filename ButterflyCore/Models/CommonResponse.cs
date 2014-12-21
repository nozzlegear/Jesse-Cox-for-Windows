using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ButterflyCore.Models
{
    public class CommonResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }

    public class CommonWebResponse : CommonResponse
    {
        public bool IsUnauthorized { get; set; }
    }

    public class CommonResponse<t> : CommonResponse
    {
        public t Data { get; set; }
    }

    public class CommonWebResponse<t> : CommonWebResponse
    {
        public t Data { get; set; }
    }
}
