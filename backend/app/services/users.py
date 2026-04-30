from app.tables import Users
from app.classes.apiresponse import APIResponse

async def get_users_list_page(current_user, cursor: str | None = None):
    page = await Users.getUserPagination(current_user.tenant_id, cursor)

    return APIResponse.ok("Users fetched", {
        "items": [
            {
                "id": u.id,
                "email": u.email,
                "user_id": u.user_id,
                "is_enabled": u.is_enabled,
            }
            for u in page.items
        ],
        "next_cursor": page.next_cursor,
        "has_more": page.has_more,
    })