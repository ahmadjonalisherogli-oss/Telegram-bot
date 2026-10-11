"""
Async SQLAlchemy Engine and Session configuration with asyncpg.
Includes automatic table creation and default initial menu seeding.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy import select

from bot.config import settings
from bot.database.models import Base, Category, Product

# Async engine configured for asyncpg
engine = create_async_engine(
    settings.async_database_url,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

# Async session factory
async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency / context session generator"""
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Create all tables and seed sample menu data if database is empty"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed initial menu if no categories exist
    async with async_session_maker() as session:
        result = await session.execute(select(Category))
        categories = result.scalars().all()
        if not categories:
            await seed_default_menu(session)


async def seed_default_menu(session: AsyncSession) -> None:
    """Seeds typical Uzbek restaurant menu items with prices in UZS"""
    # 1. Fast Food
    cat_fastfood = Category(
        name_uz="🍔 Fast Food & Lavash",
        name_ru="🍔 Фастфуд и Лаваш",
        name_en="🍔 Fast Food & Wraps",
        sort_order=1
    )
    # 2. Milliy Taomlar (National Uzbek dishes)
    cat_national = Category(
        name_uz="🍲 Milliy Taomlar",
        name_ru="🍲 Национальные Блюда",
        name_en="🍲 National Dishes",
        sort_order=2
    )
    # 3. Shashlik & Gril
    cat_barbecue = Category(
        name_uz="🍢 Shashliklar",
        name_ru="🍢 Шашлыки",
        name_en="🍢 Barbecue & Kebabs",
        sort_order=3
    )
    # 4. Ichimliklar (Drinks)
    cat_drinks = Category(
        name_uz="🥤 Ichimliklar",
        name_ru="🥤 Напитки",
        name_en="🥤 Beverages",
        sort_order=4
    )

    session.add_all([cat_fastfood, cat_national, cat_barbecue, cat_drinks])
    await session.flush()

    products = [
        # Fast Food
        Product(
            category_id=cat_fastfood.id,
            name_uz="Mol go'shtli Lavash (Katta)",
            name_ru="Лаваш с говядиной (Большой)",
            name_en="Beef Lavash Wrap (Large)",
            description_uz="Shirali mol go'shti, pomidor, bodring, maxsus qizil sous va pishloq",
            description_ru="Сочная говядина, томаты, огурцы, фирменный соус и сыр",
            description_en="Juicy tender beef, tomatoes, pickles, house sauce and cheese",
            price=38000
        ),
        Product(
            category_id=cat_fastfood.id,
            name_uz="Tovuqli Burger Cheese",
            name_ru="Куриный Чизбургер",
            name_en="Chicken Cheeseburger",
            description_uz="Qarsildoq tovuq kotleti, erigan cheddor pishlog'i, aysberg va sous",
            description_ru="Хрустящая куриная котлета, тающий чеддер, айсберг и соус",
            description_en="Crispy chicken patty, cheddar cheese, crisp lettuce, burger sauce",
            price=32000
        ),
        Product(
            category_id=cat_fastfood.id,
            name_uz="Kartoshka Fri",
            name_ru="Картофель Фри",
            name_en="French Fries",
            description_uz="Oltin rang, qarsildoq kartoshka fri ketchup bilan",
            description_ru="Золотистый хрустящий картофель фри с кетчупом",
            description_en="Crispy golden fries served with ketchup dip",
            price=18000
        ),

        # Milliy Taomlar
        Product(
            category_id=cat_national.id,
            name_uz="To'y Oshi (Toshkentcha)",
            name_ru="Свадебный Плов (Ташкентский)",
            name_en="Traditional Tashkent Wedding Plov",
            description_uz="Lazer guruchi, saralangan qo'y va mol go'shti, sariq sabzi, mayiz va no'xat",
            description_ru="Рис лазер, отборная баранина и говядина, жёлтая морковь, изюм и нут",
            description_en="Laser rice, selected lamb and beef, yellow carrots, raisins, chickpeas",
            price=45000
        ),
        Product(
            category_id=cat_national.id,
            name_uz="Tandir Somsa (Go'shtli, 1 dona)",
            name_ru="Тандырная Самса с мясом (1 шт)",
            name_en="Tandir Somsa with Beef (1 pc)",
            description_uz="Qatlama xamir, maydalangan mol go'shti, piyoz va zira",
            description_ru="Слоеное тесто, рубленая говядина, лук и восточная зира",
            description_en="Flaky pastry filled with minced beef, onions and fragrant cumin",
            price=12000
        ),

        # Shashliklar
        Product(
            category_id=cat_barbecue.id,
            name_uz="Qiyma Shashlik (1 six)",
            name_ru="Люля-Кебаб / Моленый шашлык (1 шт)",
            name_en="Minced Lamb Kebab (1 skewer)",
            description_uz="Yumshoq qiyma go'shti, marinadlangan piyoz va lavash noni bilan",
            description_ru="Нежный фарш из баранины и говядины с маринованным луком",
            description_en="Tender minced kebab skewers served with sumac-marinated onions",
            price=22000
        ),
        Product(
            category_id=cat_barbecue.id,
            name_uz="Kuskovoy Mol Go'shti (1 six)",
            name_ru="Кусковой шашлык из говядины (1 шт)",
            name_en="Beef Shish Kebab (1 skewer)",
            description_uz="Maxsus ziravorlar bilan dimlangan saralangan mol go'shti",
            description_ru="Отборные сочные кусочки говядины в ароматных специях",
            description_en="Marinated chunks of choice beef flame-grilled over charcoals",
            price=26000
        ),

        # Ichimliklar
        Product(
            category_id=cat_drinks.id,
            name_uz="Coca-Cola 0.5L",
            name_ru="Coca-Cola 0.5L",
            name_en="Coca-Cola 0.5L",
            description_uz="Muzdek gazlangan ichimlik",
            description_ru="Освежающий газированный напиток",
            description_en="Chilled refreshing soft drink",
            price=10000
        ),
        Product(
            category_id=cat_drinks.id,
            name_uz="Muzdek Ayron 0.5L",
            name_ru="Холодный Айран 0.5L",
            name_en="Fresh Chilled Ayran 0.5L",
            description_uz="Uy uslubida tayyorlangan yaxna ayron rayhon va yalpiz bilan",
            description_ru="Домашний освежающий айран со свежими травами",
            description_en="Traditional yogurt savory beverage with mint and herbs",
            price=8000
        )
    ]

    session.add_all(products)
    await session.commit()
