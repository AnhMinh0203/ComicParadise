using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Utils
{
    public class BaseResponse_V2<T>
    {
        public bool IsSuccess { get; set; }         
        public int Status { get; set; }              
        public string Message { get; set; } = "";    
        public T? Data { get; set; }                  

        public BaseResponse_V2() { }

        public BaseResponse_V2(bool isSuccess, int status, string message, T? data = default)
        {
            IsSuccess = isSuccess;
            Status = status;
            Message = message;
            Data = data;
        }

        public BaseResponse_V2(bool isSuccess, int status, string message)
        {
            IsSuccess = isSuccess;
            Status = status;
            Message = message;
        }

        public static BaseResponse_V2<T> Success(string message, T? data = default)
            => new(true, 200, message, data);

        public static BaseResponse_V2<T> Fail(string message, T? data = default)
            => new(false, 500, message, data);

        public static BaseResponse_V2<T> BadRequest(string message, T? data = default)
            => new(false, 400, message, data);

        public static BaseResponse_V2<T> NotFound(string message, T? data = default)
            => new(false, 404, message, data);

        public static BaseResponse_V2<T> Forbidden(string message, T? data = default)
            => new(false, 403, message, data);

        public static BaseResponse_V2<T> Created(string message, T? data = default)
            => new(true, 201, message, data);

    }
}
