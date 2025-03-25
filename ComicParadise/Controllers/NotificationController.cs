using ComicParadise.DataContext.Models;
using ComicParadise.DataContext.Utils;
using ComicParadise.Repository;
using ComicParadise.Repository.Common;
using Microsoft.AspNetCore.Mvc;

namespace ComicParadise.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationRepository _notificationRepository;

        public NotificationController(INotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        [HttpGet("Get-notifications")]
        public async Task<ActionResult> GetNotifications(int userID)
        {
            var result = await _notificationRepository.GetNotificationsAsync(userID);
            return Ok(new BaseResponse<List<Notification>>(true, result));
        }
    }
}
