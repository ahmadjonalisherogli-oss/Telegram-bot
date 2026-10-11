"""
Main Application Entry Point for Telegram Ordering Bot.
Initializes Aiogram 3.x Dispatcher, Asyncpg Database tables,
Redis FSM Storage, Middlewares, and Router Handlers.
"""

import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.redis import RedisStorage
from aiogram.fsm.storage.memory import MemoryStorage

from bot.config import settings
from bot.database.session import init_db, engine
from bot.handlers import setup_routers
from bot.middlewares.db import DatabaseMiddleware
from bot.middlewares.i18n import I18nMiddleware

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("bot.main")


async def main():
    logger.info("Initializing Telegram Ordering Bot for Uzbekistan...")

    # 1. Initialize PostgreSQL Database & default menu seed
    try:
        logger.info("Connecting to PostgreSQL and running migrations...")
        await init_db()
        logger.info("Database schema initialized and ready.")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        # Proceed or raise depending on deployment environment

    # 2. Initialize Redis FSM storage
    storage = None
    try:
        logger.info(f"Connecting to Redis at {settings.redis_connection_url}...")
        storage = RedisStorage.from_url(settings.redis_connection_url)
        logger.info("Redis FSM Storage connected successfully.")
    except Exception as e:
        logger.warning(f"Could not connect to Redis ({e}). Falling back to MemoryStorage.")
        storage = MemoryStorage()

    # 3. Create Bot and Dispatcher instances
    bot = Bot(
        token=settings.BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )
    dp = Dispatcher(storage=storage)

    # 4. Register Middlewares (applied to both messages and callback queries)
    db_middleware = DatabaseMiddleware()
    i18n_middleware = I18nMiddleware()

    dp.message.middleware(db_middleware)
    dp.callback_query.middleware(db_middleware)

    dp.message.middleware(i18n_middleware)
    dp.callback_query.middleware(i18n_middleware)

    # 5. Register Routers
    master_router = setup_routers()
    dp.include_router(master_router)

    # 6. Startup notification to admins
    for admin_id in settings.ADMIN_IDS:
        try:
            await bot.send_message(
                chat_id=admin_id,
                text="🚀 <b>Restoran Telegram Boti ishga tushirildi!</b>\n"
                     f"Restoran: {settings.RESTAURANT_NAME}\n"
                     "Tizim tayyor.",
                parse_mode="HTML"
            )
        except Exception:
            pass

    # 7. Start Polling
    try:
        logger.info("Starting long polling mode...")
        # Drop pending updates so old messages don't spam upon restart
        await bot.delete_webhook(drop_pending_updates=True)
        await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())
    finally:
        logger.info("Shutting down bot session and closing database connections...")
        await bot.session.close()
        await engine.dispose()
        logger.info("Bot stopped cleanly.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot execution terminated by user.")
