using ComicParadise.DataContext.Dto;
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
        public async Task<ActionResult> GetNewNotifications(int userID)
        {
            var result = await _notificationRepository.GetNotificationsAsync(userID);
            return Ok(new BaseResponse<dynamic>(true, result));
        }

        [HttpPost("Turn-off-notifications")]
        public async Task<ActionResult> TurnOffNotification(int notificationID)
        {
            var result = await _notificationRepository.TurnOffNotificationAsync(notificationID);
            return Ok(new BaseResponse<string>(true, result));
        }

        [HttpPost("Update-is-read-status")]
        public async Task<ActionResult> UpdateIsReadStatus(List<int> newNotifications)
        {
            var result = await _notificationRepository.UpdateIsReadStatusAsync(newNotifications);
            return Ok(new BaseResponse<bool>(true, result));
        }

        [HttpPost("Create-notification")]
        public async Task<ActionResult> CreateNotification(CreateNotificationDto notificationDto)
        {
            var result = await _notificationRepository.CreateNotificationAsync(notificationDto);
            return Ok(new BaseResponse<string>(true, result));
        }
    }
}
