"""
Internationalization and Role Middleware.
Detects user language and admin privileges, injecting `lang` and `is_admin` into handler kwargs.
"""

from typing import Callable, Dict, Any, Awaitable
from aiogram import BaseMiddleware
from aiogram.types import TelegramObject, User as TgUser
from sqlalchemy.ext.asyncio import AsyncSession

from bot.config import settings
from bot.database.queries import get_user_by_id


class I18nMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any]
    ) -> Any:
        # Extract telegram user from event
        tg_user: TgUser = data.get("event_from_user")
        lang = settings.DEFAULT_LANGUAGE
        is_admin = False

        if tg_user:
            # Check admin status
            if tg_user.id in settings.ADMIN_IDS:
                is_admin = True

            # Retrieve user language from database if session is present
            session: AsyncSession = data.get("session")
            if session:
                db_user = await get_user_by_id(session, tg_user.id)
                if db_user and db_user.language:
                    lang = db_user.language

        data["lang"] = lang
        data["is_admin"] = is_admin
        return await handler(event, data)
