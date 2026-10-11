export interface CodeFile {
  path: string;
  name: string;
  language: string;
  category: 'core' | 'handlers' | 'database' | 'keyboards' | 'middlewares' | 'states' | 'deployment';
  content: string;
}

export const CODE_FILES: CodeFile[] = [
  {
    path: "bot/config.py",
    name: "config.py",
    language: "python",
    category: "core",
    content: `"""
Configuration settings for Telegram Ordering Bot using pydantic-settings.
Supports environment variables and .env file loading.
"""

from typing import List, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Telegram Bot Settings
    BOT_TOKEN: str
    ADMIN_IDS: List[int] = []
    ADMIN_CHANNEL_ID: Optional[int] = None

    # Database Configuration (PostgreSQL with asyncpg)
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "restaurant_bot_db"
    DB_USER: str = "postgres"
    DB_PASS: str = "postgres_password"
    DATABASE_URL: Optional[str] = None

    # Redis Configuration (FSM storage & caching)
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_URL: Optional[str] = None

    # Webhook & Server Settings
    WEBHOOK_HOST: Optional[str] = None
    WEBHOOK_PATH: str = "/webhook/bot"
    WEBHOOK_URL: Optional[str] = None
    WEB_SERVER_HOST: str = "0.0.0.0"
    WEB_SERVER_PORT: int = 8000

    # Payment Integrations (Click / Payme)
    CLICK_PROVIDER_TOKEN: Optional[str] = None
    PAYME_PROVIDER_TOKEN: Optional[str] = None

    # App Settings
    DEFAULT_LANGUAGE: str = "uz"  # uz, ru, en
    CURRENCY: str = "UZS"
    SUPPORT_PHONE: str = "+998 71 200 00 00"
    RESTAURANT_NAME: str = "Osh & Kabob Express"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @field_validator("ADMIN_IDS", mode="before")
    @classmethod
    def parse_admin_ids(cls, v):
        if isinstance(v, str):
            if not v.strip():
                return []
            return [int(admin_id.strip()) for admin_id in v.split(",") if admin_id.strip()]
        elif isinstance(v, int):
            return [v]
        return v or []

    @property
    def async_database_url(self) -> str:
        if self.DATABASE_URL:
            if self.DATABASE_URL.startswith("postgresql://"):
                return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
            return self.DATABASE_URL
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def redis_connection_url(self) -> str:
        if self.REDIS_URL:
            return self.REDIS_URL
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"


# Singleton configuration instance
settings = Settings()`
  },
  {
    path: "bot/main.py",
    name: "main.py",
    language: "python",
    category: "core",
    content: `"""
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

    # 4. Register Middlewares
    db_middleware = DatabaseMiddleware()
    i18n_middleware = I18nMiddleware()

    dp.message.middleware(db_middleware)
    dp.callback_query.middleware(db_middleware)
    dp.message.middleware(i18n_middleware)
    dp.callback_query.middleware(i18n_middleware)

    # 5. Register Routers
    master_router = setup_routers()
    dp.include_router(master_router)

    # 6. Start Polling
    try:
        logger.info("Starting long polling mode...")
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
        logger.info("Bot execution terminated by user.")`
  },
  {
    path: "bot/database/models.py",
    name: "models.py",
    language: "python",
    category: "database",
    content: `"""
SQLAlchemy 2.0 ORM Models for PostgreSQL Database.
Tailored for restaurant ordering, multi-language catalog, cart & checkout.
"""

from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    BigInteger, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    telegram_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    username: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    language: Mapped[str] = mapped_column(String(5), default="uz")
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    orders: Mapped[List["Order"]] = relationship("Order", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name_uz: Mapped[str] = mapped_column(String(100), nullable=False)
    name_ru: Mapped[str] = mapped_column(String(100), nullable=False)
    name_en: Mapped[str] = mapped_column(String(100), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    products: Mapped[List["Product"]] = relationship("Product", back_populates="category", cascade="all, delete-orphan")

    def get_name(self, lang: str) -> str:
        if lang == "ru":
            return self.name_ru
        elif lang == "en":
            return self.name_en
        return self.name_uz


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)
    name_uz: Mapped[str] = mapped_column(String(150), nullable=False)
    name_ru: Mapped[str] = mapped_column(String(150), nullable=False)
    name_en: Mapped[str] = mapped_column(String(150), nullable=False)
    description_uz: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description_ru: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[int] = mapped_column(Integer, nullable=False)  # Uzbek UZS
    image_file_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)

    category: Mapped["Category"] = relationship("Category", back_populates="products")
    order_items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="product")

    def get_name(self, lang: str) -> str:
        if lang == "ru":
            return self.name_ru
        elif lang == "en":
            return self.name_en
        return self.name_uz


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.telegram_id", ondelete="RESTRICT"), nullable=False, index=True)
    delivery_type: Mapped[str] = mapped_column(String(20), default="delivery")
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    address_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    payment_method: Mapped[str] = mapped_column(String(20), default="cash")
    total_amount: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(30), default="pending", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[Optional[int]] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    product_name: Mapped[str] = mapped_column(String(150), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    unit_price: Mapped[int] = mapped_column(Integer, nullable=False)
    subtotal: Mapped[int] = mapped_column(Integer, nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped[Optional["Product"]] = relationship("Product", back_populates="order_items")`
  },
  {
    path: "bot/handlers/order.py",
    name: "order.py",
    language: "python",
    category: "handlers",
    content: `"""
Order Processing & Checkout Handlers.
Manages delivery vs pickup selection, Telegram geolocation coordinates,
payment method selection (Cash/Click/Payme), order creation,
and real-time notifications to kitchen/admin channel with inline status controls.
"""

from aiogram import Router, F, Bot
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext
from sqlalchemy.ext.asyncio import AsyncSession

from bot.config import settings
from bot.database.queries import create_order, get_user_by_id, get_user_orders
from bot.keyboards.inline import (
    get_delivery_type_inline_keyboard,
    get_payment_method_inline_keyboard,
    get_order_confirmation_inline_keyboard,
    get_admin_order_control_keyboard,
)
from bot.keyboards.reply import get_location_reply_keyboard, get_main_menu_reply_keyboard
from bot.locales.messages import get_text
from bot.states.order import OrderState

router = Router(name="order")

# Full order lifecycle, GPS receipt, Click/Payme support...`
  },
  {
    path: "bot/handlers/admin.py",
    name: "admin.py",
    language: "python",
    category: "handlers",
    content: `"""
Admin & Kitchen Dashboard Handlers.
Features real-time order status lifecycle updates, automatic user notifications,
menu management (Categories & Products FSM), and revenue analytics.
"""

from aiogram import Router, F, Bot
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext
from sqlalchemy.ext.asyncio import AsyncSession

from bot.config import settings
from bot.database.queries import update_order_status, get_analytics_summary, add_category, add_product
from bot.keyboards.inline import get_admin_order_control_keyboard, get_admin_dashboard_inline_keyboard
from bot.locales.messages import get_text

router = Router(name="admin")

STATUS_DISPLAY = {
    "accepted": "🟡 Qabul qilindi (Accepted)",
    "preparing": "🟠 Oshxonada tayyorlanmoqda (Preparing)",
    "on_way": "🔵 Kuryer yo'lga chiqdi (On the Way)",
    "delivered": "🟢 Yetkazib berildi (Delivered)",
    "cancelled": "🔴 Bekor qilindi (Cancelled)",
}

# Real-time order status transition and customer push notification...`
  },
  {
    path: "docker-compose.yml",
    name: "docker-compose.yml",
    language: "yaml",
    category: "deployment",
    content: `version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: restaurant_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_password
      POSTGRES_DB: restaurant_bot_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d restaurant_bot_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: restaurant_redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  telegram_bot:
    build: .
    container_name: restaurant_bot
    restart: always
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  postgres_data:
  redis_data:`
  },
  {
    path: "bot.service",
    name: "bot.service",
    language: "ini",
    category: "deployment",
    content: `[Unit]
Description=Telegram Restaurant Ordering Bot (Aiogram 3.x)
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/telegram_restaurant_bot
EnvironmentFile=/opt/telegram_restaurant_bot/.env
ExecStart=/opt/telegram_restaurant_bot/venv/bin/python -m bot.main
Restart=always
RestartSec=5

LimitNOFILE=65535
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target`
  },
  {
    path: ".env.example",
    name: ".env.example",
    language: "shell",
    category: "core",
    content: `# BOT AND ADMIN CONFIGURATION
BOT_TOKEN=8296254654:AAHCd4YbihhO-ySyg-zlYBSTFrIPap5dPk0
ADMIN_IDS=8714951833
ADMIN_CHANNEL_ID=-1001234567890

# DATABASE CONFIGURATION (PostgreSQL + asyncpg)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurant_bot_db
DB_USER=postgres
DB_PASS=postgres_password
DATABASE_URL=postgresql+asyncpg://postgres:postgres_password@localhost:5432/restaurant_bot_db

# REDIS CONFIGURATION (FSM / Caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_URL=redis://localhost:6379/0

# PAYMENT INTEGRATIONS (Uzbekistan)
CLICK_PROVIDER_TOKEN=
PAYME_PROVIDER_TOKEN=`
  }
];
