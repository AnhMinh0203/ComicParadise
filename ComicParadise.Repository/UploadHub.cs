using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ComicParadise.Repository
{
    public class UploadHub: Hub
    {
        public string GetConnectionId()
        {
            return Context.ConnectionId;
        }
    }
}
