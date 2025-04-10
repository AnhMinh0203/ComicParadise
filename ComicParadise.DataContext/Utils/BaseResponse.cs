using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Utils
{
    public class BaseResponse <T>
    {
        public bool IsSuccess { get; set; } 
        public string Message { get; set; }
        public T? Data { get; set; }

        public BaseResponse(bool isSuccess, T? data)
        {
            IsSuccess = isSuccess;
            Data = data;
        }

        public BaseResponse(bool isSuccess)
        {
            IsSuccess = isSuccess;
        }

        /*        public BaseResponse(bool isSuccess, string message, T data)
        {
            IsSuccess = isSuccess;
            Message = message;
            Data = data;
        }*/
    }
}
