"""
Shopping Cart Handlers.
Stores temporary cart items in FSM Context (backed by Redis),
allowing item modifications, price recalculations, and checkout handoff.
"""

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext
from sqlalchemy.ext.asyncio import AsyncSession

from bot.database.queries import get_product_by_id
from bot.keyboards.inline import get_cart_inline_keyboard
from bot.locales.messages import get_text

router = Router(name="cart")


@router.callback_query(F.data.startswith("cart:add:"))
async def handle_add_to_cart(
    callback: CallbackQuery,
    session: AsyncSession,
    state: FSMContext,
    lang: str
):
    """Adds specified item and quantity to customer's FSM cart"""
    _, _, prod_id_str, qty_str = callback.data.split(":")
    product_id = int(prod_id_str)
    quantity = int(qty_str)

    product = await get_product_by_id(session, product_id)
    if not product:
        await callback.answer("Mahsulot topilmadi", show_alert=True)
        return

    # Retrieve current cart from FSM state
    data = await state.get_data()
    cart = data.get("cart", {})

    # Update item count
    if str(product_id) in cart:
        cart[str(product_id)]["quantity"] += quantity
    else:
        cart[str(product_id)] = {
            "product_id": product.id,
            "name": product.get_name(lang),
            "unit_price": product.price,
            "quantity": quantity
        }

    await state.update_data(cart=cart)
    await callback.answer(f"{product.get_name(lang)} {get_text(lang, 'product_added')}")


@router.message(F.text.in_(["🛒 Savat", "🛒 Корзина", "🛒 Cart"]))
async def handle_show_cart_message(message: Message, state: FSMContext, lang: str):
    """Displays shopping cart via reply menu button"""
    await render_cart_view(message, state, lang, is_callback=False)


@router.callback_query(F.data == "cart:view")
async def handle_show_cart_callback(callback: CallbackQuery, state: FSMContext, lang: str):
    """Displays shopping cart via inline back button"""
    await render_cart_view(callback.message, state, lang, is_callback=True)
    await callback.answer()


@router.callback_query(F.data.startswith("cart:remove:"))
async def handle_remove_from_cart(callback: CallbackQuery, state: FSMContext, lang: str):
    """Removes single line item from cart"""
    product_id = callback.data.split(":")[2]
    data = await state.get_data()
    cart = data.get("cart", {})

    if str(product_id) in cart:
        del cart[str(product_id)]
        await state.update_data(cart=cart)

    await render_cart_view(callback.message, state, lang, is_callback=True)
    await callback.answer("Olib tashlandi")


@router.callback_query(F.data == "cart:clear")
async def handle_clear_cart(callback: CallbackQuery, state: FSMContext, lang: str):
    """Empties all items from the current cart"""
    await state.update_data(cart={})
    await callback.message.edit_text(
        text=get_text(lang, "cart_empty"),
        reply_markup=get_cart_inline_keyboard([], lang)
    )
    await callback.answer(get_text(lang, "cart_cleared"))


async def render_cart_view(message: Message, state: FSMContext, lang: str, is_callback: bool = False):
    """Helper to format and display current cart receipt"""
    data = await state.get_data()
    cart = data.get("cart", {})

    if not cart:
        empty_text = get_text(lang, "cart_empty")
        if is_callback:
            await message.edit_text(text=empty_text, reply_markup=get_cart_inline_keyboard([], lang))
        else:
            await message.answer(text=empty_text, reply_markup=get_cart_inline_keyboard([], lang))
        return

    items_list = list(cart.values())
    total = sum(item["unit_price"] * item["quantity"] for item in items_list)

    lines = [f"<b>{get_text(lang, 'cart_title')}</b>\n"]
    for item in items_list:
        subtotal = item["unit_price"] * item["quantity"]
        lines.append(f"• <b>{item['name']}</b> x {item['quantity']} = {subtotal:,} so'm")

    lines.append(f"\n💵 Jami: <b>{total:,} so'm</b>")
    content = "\n".join(lines)

    keyboard = get_cart_inline_keyboard(items_list, lang)

    if is_callback:
        await message.edit_text(text=content, parse_mode="HTML", reply_markup=keyboard)
    else:
        await message.answer(text=content, parse_mode="HTML", reply_markup=keyboard)
