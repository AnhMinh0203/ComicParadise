using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.DataContext.Dto
{
    public class CreateNotificationDto
    {
        public int SenderId { get; set; }
        public int? ReceiverId { get; set; }
        public string Content { get; set; }
        public string Type { get; set; }
        public string? Link { get; set; }
        public int? TargetID { get; set; }

        // Constructor để gán giá trị mặc định
        public CreateNotificationDto()
        {
            Link = null;
            TargetID = null;
        }
    }
}
