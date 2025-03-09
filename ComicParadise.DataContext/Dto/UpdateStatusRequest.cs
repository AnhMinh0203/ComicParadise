using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class UpdateStatusRequest
    {
        public int CommentID { get; set; }
        public string Status { get; set; }
    }
}
