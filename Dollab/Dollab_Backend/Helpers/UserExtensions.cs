using System.Security.Claims;

namespace Dollab_Backend.Helpers
{
    public static class UserExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            return int.Parse(user.FindFirst(ClaimTypes.NameIdentifier).Value);
        }
    }
}
