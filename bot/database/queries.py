"""
Database CRUD query helpers for users, categories, products, orders, and analytics.
All operations execute asynchronously using SQLAlchemy 2.0.
"""

from datetime import datetime, date, timedelta
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, desc, and_
from sqlalchemy.orm import selectinload

from bot.database.models import User, Category, Product, Order, OrderItem


# ---------------- USER QUERIES ---------------- #

async def get_or_create_user(
    session: AsyncSession,
    telegram_id: int,
    full_name: str,
    username: Optional[str] = None
) -> Tuple[User, bool]:
    """Get existing user or create a new user profile"""
    query = select(User).where(User.telegram_id == telegram_id)
    result = await session.execute(query)
    user = result.scalar_one_or_none()

    if user:
        # Update name or username if changed
        if user.full_name != full_name or user.username != username:
            user.full_name = full_name
            user.username = username
            await session.commit()
        return user, False

    user = User(
        telegram_id=telegram_id,
        full_name=full_name,
        username=username,
        language="uz"  # Default to Uzbek
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user, True


async def get_user_by_id(session: AsyncSession, telegram_id: int) -> Optional[User]:
    query = select(User).where(User.telegram_id == telegram_id)
    result = await session.execute(query)
    return result.scalar_one_or_none()


async def update_user_language(session: AsyncSession, telegram_id: int, language: str) -> None:
    stmt = (
        update(User)
        .where(User.telegram_id == telegram_id)
        .values(language=language, updated_at=datetime.utcnow())
    )
    await session.execute(stmt)
    await session.commit()


async def update_user_phone(session: AsyncSession, telegram_id: int, phone_number: str) -> None:
    stmt = (
        update(User)
        .where(User.telegram_id == telegram_id)
        .values(phone_number=phone_number, updated_at=datetime.utcnow())
    )
    await session.execute(stmt)
    await session.commit()


# ---------------- CATEGORY & PRODUCT QUERIES ---------------- #

async def get_all_categories(session: AsyncSession) -> List[Category]:
    query = (
        select(Category)
        .where(Category.is_active == True)
        .order_by(Category.sort_order.asc(), Category.id.asc())
    )
    result = await session.execute(query)
    return list(result.scalars().all())


async def get_category_by_id(session: AsyncSession, category_id: int) -> Optional[Category]:
    query = select(Category).where(Category.id == category_id)
    result = await session.execute(query)
    return result.scalar_one_or_none()


async def get_products_by_category(session: AsyncSession, category_id: int) -> List[Product]:
    query = (
        select(Product)
        .where(Product.category_id == category_id, Product.is_available == True)
        .order_by(Product.id.asc())
    )
    result = await session.execute(query)
    return list(result.scalars().all())


async def get_product_by_id(session: AsyncSession, product_id: int) -> Optional[Product]:
    query = select(Product).where(Product.id == product_id)
    result = await session.execute(query)
    return result.scalar_one_or_none()


async def add_category(
    session: AsyncSession,
    name_uz: str,
    name_ru: str,
    name_en: str
) -> Category:
    category = Category(
        name_uz=name_uz,
        name_ru=name_ru,
        name_en=name_en
    )
    session.add(category)
    await session.commit()
    await session.refresh(category)
    return category


async def add_product(
    session: AsyncSession,
    category_id: int,
    name_uz: str,
    name_ru: str,
    name_en: str,
    price: int,
    description_uz: Optional[str] = None,
    image_file_id: Optional[str] = None
) -> Product:
    product = Product(
        category_id=category_id,
        name_uz=name_uz,
        name_ru=name_ru,
        name_en=name_en,
        description_uz=description_uz,
        description_ru=description_uz,
        description_en=description_uz,
        price=price,
        image_file_id=image_file_id
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product


# ---------------- ORDER QUERIES ---------------- #

async def create_order(
    session: AsyncSession,
    user_id: int,
    delivery_type: str,
    latitude: Optional[float],
    longitude: Optional[float],
    address_text: Optional[str],
    payment_method: str,
    items: List[Dict[str, Any]]
) -> Order:
    """Create a new order and save each line item"""
    total_amount = sum(item["unit_price"] * item["quantity"] for item in items)

    order = Order(
        user_id=user_id,
        delivery_type=delivery_type,
        latitude=latitude,
        longitude=longitude,
        address_text=address_text,
        payment_method=payment_method,
        total_amount=total_amount,
        status="pending"
    )
    session.add(order)
    await session.flush()

    for item in items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.get("product_id"),
            product_name=item["name"],
            quantity=item["quantity"],
            unit_price=item["unit_price"],
            subtotal=item["unit_price"] * item["quantity"]
        )
        session.add(order_item)

    await session.commit()
    await session.refresh(order)
    return order


async def get_order_with_details(session: AsyncSession, order_id: int) -> Optional[Order]:
    query = (
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.user))
        .where(Order.id == order_id)
    )
    result = await session.execute(query)
    return result.scalar_one_or_none()


async def get_user_orders(session: AsyncSession, user_id: int, limit: int = 5) -> List[Order]:
    query = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == user_id)
        .order_by(desc(Order.created_at))
        .limit(limit)
    )
    result = await session.execute(query)
    return list(result.scalars().all())


async def update_order_status(session: AsyncSession, order_id: int, status: str) -> Optional[Order]:
    query = (
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.user))
        .where(Order.id == order_id)
    )
    result = await session.execute(query)
    order = result.scalar_one_or_none()
    if order:
        order.status = status
        order.updated_at = datetime.utcnow()
        await session.commit()
        await session.refresh(order)
    return order


# ---------------- ANALYTICS QUERIES ---------------- #

async def get_analytics_summary(session: AsyncSession) -> Dict[str, Any]:
    """Returns today's revenue, order count, monthly total, and active users"""
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    month_start = datetime(now.year, now.month, 1)

    # Today's completed orders
    today_stmt = select(
        func.count(Order.id),
        func.coalesce(func.sum(Order.total_amount), 0)
    ).where(
        Order.created_at >= today_start,
        Order.status != "cancelled"
    )
    today_res = await session.execute(today_stmt)
    today_count, today_revenue = today_res.one()

    # Month's completed orders
    month_stmt = select(
        func.count(Order.id),
        func.coalesce(func.sum(Order.total_amount), 0)
    ).where(
        Order.created_at >= month_start,
        Order.status != "cancelled"
    )
    month_res = await session.execute(month_stmt)
    month_count, month_revenue = month_res.one()

    # Total users
    users_count = await session.scalar(select(func.count(User.telegram_id)))

    # Orders count by status
    status_query = select(Order.status, func.count(Order.id)).group_by(Order.status)
    status_res = await session.execute(status_query)
    status_breakdown = dict(status_res.all())

    return {
        "today_count": today_count or 0,
        "today_revenue": int(today_revenue or 0),
        "month_count": month_count or 0,
        "month_revenue": int(month_revenue or 0),
        "total_users": users_count or 0,
        "status_breakdown": status_breakdown
    }
