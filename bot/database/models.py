"""
SQLAlchemy 2.0 ORM Models for PostgreSQL Database.
Tailored for restaurant ordering, multi-language catalog, cart & checkout.
"""

from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    """Telegram customer user model"""
    __tablename__ = "users"

    telegram_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    username: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    language: Mapped[str] = mapped_column(String(5), default="uz")  # 'uz', 'ru', 'en'
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    """Menu category supporting 3 languages (UZ, RU, EN)"""
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name_uz: Mapped[str] = mapped_column(String(100), nullable=False)
    name_ru: Mapped[str] = mapped_column(String(100), nullable=False)
    name_en: Mapped[str] = mapped_column(String(100), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    products: Mapped[List["Product"]] = relationship("Product", back_populates="category", cascade="all, delete-orphan")

    def get_name(self, lang: str) -> str:
        if lang == "ru":
            return self.name_ru
        elif lang == "en":
            return self.name_en
        return self.name_uz


class Product(Base):
    """Menu dish / beverage product model"""
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)
    name_uz: Mapped[str] = mapped_column(String(150), nullable=False)
    name_ru: Mapped[str] = mapped_column(String(150), nullable=False)
    name_en: Mapped[str] = mapped_column(String(150), nullable=False)
    description_uz: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description_ru: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[int] = mapped_column(Integer, nullable=False)  # Price in Uzbek UZS (sum)
    image_file_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    category: Mapped["Category"] = relationship("Category", back_populates="products")
    order_items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="product")

    def get_name(self, lang: str) -> str:
        if lang == "ru":
            return self.name_ru
        elif lang == "en":
            return self.name_en
        return self.name_uz

    def get_description(self, lang: str) -> str:
        if lang == "ru":
            return self.description_ru or ""
        elif lang == "en":
            return self.description_en or ""
        return self.description_uz or ""


class Order(Base):
    """Customer order details and status lifecycle"""
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.telegram_id", ondelete="RESTRICT"), nullable=False, index=True)
    delivery_type: Mapped[str] = mapped_column(String(20), default="delivery")  # 'delivery' or 'pickup'
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    address_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    payment_method: Mapped[str] = mapped_column(String(20), default="cash")  # 'cash', 'click', 'payme'
    total_amount: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Status progression: pending -> accepted -> preparing -> on_way -> delivered | cancelled
    status: Mapped[str] = mapped_column(String(30), default="pending", index=True)
    admin_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    """Line items for an order"""
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[Optional[int]] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    product_name: Mapped[str] = mapped_column(String(150), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    unit_price: Mapped[int] = mapped_column(Integer, nullable=False)
    subtotal: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped[Optional["Product"]] = relationship("Product", back_populates="order_items")
