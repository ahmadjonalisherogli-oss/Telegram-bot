"""
Menu Browsing & Product Selection Handlers.
Features dynamic category exploration, item details, and inline +/- quantity counter.
"""

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext
from sqlalchemy.ext.asyncio import AsyncSession

from bot.database.queries import (
    get_all_categories,
    get_products_by_category,
    get_product_by_id,
    get_category_by_id,
)
from bot.keyboards.inline import (
    get_categories_inline_keyboard,
    get_products_inline_keyboard,
    get_product_detail_inline_keyboard,
)
from bot.locales.messages import get_text

router = Router(name="menu")


@router.message(F.text.in_(["🍕 Menyu", "🍕 Меню", "🍕 Menu"]))
async def handle_open_menu(message: Message, session: AsyncSession, lang: str):
    """Opens main category selection"""
    categories = await get_all_categories(session)
    if not categories:
        await message.answer("Katalog hozirda yangilanmoqda. Birozdan so'ng qayta urinib ko'ring.")
        return

    await message.answer(
        text=get_text(lang, "choose_category"),
        reply_markup=get_categories_inline_keyboard(categories, lang)
    )


@router.callback_query(F.data == "menu:categories")
async def handle_back_to_categories(callback: CallbackQuery, session: AsyncSession, lang: str):
    """Returns to category list from product list or cart"""
    categories = await get_all_categories(session)
    await callback.message.edit_text(
        text=get_text(lang, "choose_category"),
        reply_markup=get_categories_inline_keyboard(categories, lang)
    )
    await callback.answer()


@router.callback_query(F.data.startswith("cat:"))
async def handle_select_category(callback: CallbackQuery, session: AsyncSession, lang: str):
    """Displays products within chosen category"""
    category_id = int(callback.data.split(":")[1])
    products = await get_products_by_category(session, category_id)
    category = await get_category_by_id(session, category_id)

    if not products:
        await callback.answer("Ushbu bo'limda hozircha mahsulotlar mavjud emas", show_alert=True)
        return

    cat_name = category.get_name(lang) if category else ""
    await callback.message.edit_text(
        text=f"📂 <b>{cat_name}</b>\n\n{get_text(lang, 'choose_product')}",
        parse_mode="HTML",
        reply_markup=get_products_inline_keyboard(products, category_id, lang)
    )
    await callback.answer()


@router.callback_query(F.data.startswith("prod:"))
async def handle_product_details(callback: CallbackQuery, session: AsyncSession, lang: str):
    """Displays detailed product card with initial quantity = 1"""
    _, prod_id_str, cat_id_str = callback.data.split(":")
    product_id = int(prod_id_str)
    category_id = int(cat_id_str)

    product = await get_product_by_id(session, product_id)
    if not product:
        await callback.answer("Mahsulot topilmadi", show_alert=True)
        return

    text = (
        f"🍴 <b>{product.get_name(lang)}</b>\n\n"
        f"📝 {product.get_description(lang)}\n\n"
        f"💰 Narxi: <b>{product.price:,} so'm</b>"
    )

    await callback.message.edit_text(
        text=text,
        parse_mode="HTML",
        reply_markup=get_product_detail_inline_keyboard(product_id, category_id, quantity=1, lang=lang)
    )
    await callback.answer()


@router.callback_query(F.data.startswith("qty:inc:"))
async def handle_quantity_increment(callback: CallbackQuery, session: AsyncSession, lang: str):
    """Increments product quantity picker (+ 1)"""
    _, _, prod_id_str, cat_id_str, qty_str = callback.data.split(":")
    product_id = int(prod_id_str)
    category_id = int(cat_id_str)
    quantity = min(int(qty_str) + 1, 99)

    product = await get_product_by_id(session, product_id)
    if not product:
        await callback.answer()
        return

    subtotal = product.price * quantity
    text = (
        f"🍴 <b>{product.get_name(lang)}</b>\n\n"
        f"📝 {product.get_description(lang)}\n\n"
        f"💰 Narxi: <b>{product.price:,} so'm</b>\n"
        f"💵 Jami: <b>{subtotal:,} so'm</b>"
    )

    await callback.message.edit_text(
        text=text,
        parse_mode="HTML",
        reply_markup=get_product_detail_inline_keyboard(product_id, category_id, quantity, lang=lang)
    )
    await callback.answer()


@router.callback_query(F.data.startswith("qty:dec:"))
async def handle_quantity_decrement(callback: CallbackQuery, session: AsyncSession, lang: str):
    """Decrements product quantity picker (- 1, min 1)"""
    _, _, prod_id_str, cat_id_str, qty_str = callback.data.split(":")
    product_id = int(prod_id_str)
    category_id = int(cat_id_str)
    quantity = max(int(qty_str) - 1, 1)

    product = await get_product_by_id(session, product_id)
    if not product:
        await callback.answer()
        return

    subtotal = product.price * quantity
    text = (
        f"🍴 <b>{product.get_name(lang)}</b>\n\n"
        f"📝 {product.get_description(lang)}\n\n"
        f"💰 Narxi: <b>{product.price:,} so'm</b>\n"
        f"💵 Jami: <b>{subtotal:,} so'm</b>"
    )

    await callback.message.edit_text(
        text=text,
        parse_mode="HTML",
        reply_markup=get_product_detail_inline_keyboard(product_id, category_id, quantity, lang=lang)
    )
    await callback.answer()


@router.callback_query(F.data == "noop")
async def handle_noop(callback: CallbackQuery):
    """No-op for quantity display button click"""
    await callback.answer()
