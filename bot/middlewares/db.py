"""
Database session injection middleware for Aiogram 3.
Ensures a scoped AsyncSession is available in handler kwargs and properly closed/committed.
"""

from typing import Callable, Dict, Any, Awaitable
from aiogram import BaseMiddleware
from aiogram.types import TelegramObject
from bot.database.session import async_session_maker


class DatabaseMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any]
    ) -> Any:
        async with async_session_maker() as session:
            data["session"] = session
            try:
                result = await handler(event, data)
                return result
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
