"""
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
from bot.database.queries import (
    create_order,
    get_user_by_id,
    get_user_orders,
)
from bot.keyboards.inline import (
    get_delivery_type_inline_keyboard,
    get_payment_method_inline_keyboard,
    get_order_confirmation_inline_keyboard,
    get_admin_order_control_keyboard,
)
from bot.keyboards.reply import (
    get_location_reply_keyboard,
    get_main_menu_reply_keyboard,
)
from bot.locales.messages import get_text
from bot.states.order import OrderState

router = Router(name="order")


@router.callback_query(F.data == "order:checkout")
async def handle_start_checkout(callback: CallbackQuery, state: FSMContext, lang: str):
    """Initiates checkout process: ask delivery or pickup"""
    data = await state.get_data()
    cart = data.get("cart", {})

    if not cart:
        await callback.answer(get_text(lang, "cart_empty"), show_alert=True)
        return

    await state.set_state(OrderState.choosing_delivery_type)
    await callback.message.edit_text(
        text=get_text(lang, "choose_delivery_type"),
        reply_markup=get_delivery_type_inline_keyboard(lang)
    )
    await callback.answer()


@router.callback_query(F.data.startswith("deliv:"))
async def handle_delivery_type_chosen(
    callback: CallbackQuery,
    state: FSMContext,
    lang: str
):
    """Processes choice between 🛵 Delivery and 🏃 Pickup"""
    delivery_type = callback.data.split(":")[1]
    await state.update_data(delivery_type=delivery_type)

    if delivery_type == "delivery":
        await state.set_state(OrderState.sending_location)
        await callback.message.delete()
        await callback.message.answer(
            text=get_text(lang, "send_delivery_location"),
            reply_markup=get_location_reply_keyboard(lang)
        )
    else:
        # Pickup flow
        await state.update_data(latitude=None, longitude=None, address_text="Restorandan olib ketish (Samovivoz)")
        await state.set_state(OrderState.choosing_payment)
        await callback.message.edit_text(
            text=f"{get_text(lang, 'pickup_info')}\n\n{get_text(lang, 'choose_payment_method')}",
            reply_markup=get_payment_method_inline_keyboard(lang)
        )
    await callback.answer()


@router.message(OrderState.sending_location, F.location)
async def handle_location_received(
    message: Message,
    state: FSMContext,
    lang: str,
    is_admin: bool
):
    """Receives native Telegram GPS coordinates"""
    lat = message.location.latitude
    lon = message.location.longitude

    await state.update_data(
        latitude=lat,
        longitude=lon,
        address_text=f"GPS: {lat:.6f}, {lon:.6f}"
    )
    await state.set_state(OrderState.choosing_payment)

    # Return main keyboard in chat while presenting payment methods
    await message.answer(
        text="📍 Geolokatsiya qabul qilindi!",
        reply_markup=get_main_menu_reply_keyboard(lang, is_admin=is_admin)
    )
    await message.answer(
        text=get_text(lang, "choose_payment_method"),
        reply_markup=get_payment_method_inline_keyboard(lang)
    )


@router.callback_query(F.data.startswith("pay:"))
async def handle_payment_chosen(
    callback: CallbackQuery,
    state: FSMContext,
    lang: str
):
    """Processes Cash / Click / Payme payment option"""
    payment_method = callback.data.split(":")[1]
    await state.update_data(payment_method=payment_method)
    await state.set_state(OrderState.confirming)

    data = await state.get_data()
    cart = data.get("cart", {})
    items_list = list(cart.values())
    total = sum(item["unit_price"] * item["quantity"] for item in items_list)

    delivery_label = get_text(lang, "btn_delivery") if data.get("delivery_type") == "delivery" else get_text(lang, "btn_pickup")
    pay_labels = {"cash": get_text(lang, "btn_cash"), "click": "Click (Online)", "payme": "Payme (Online)"}
    payment_label = pay_labels.get(payment_method, payment_method)

    summary_text = (
        f"📋 <b>Buyurtma ma'lumotlari:</b>\n\n"
        f"🛵 <b>Usul:</b> {delivery_label}\n"
        f"📍 <b>Manzil:</b> {data.get('address_text', 'Mavjud emas')}\n"
        f"💳 <b>To'lov turi:</b> {payment_label}\n\n"
        f"<b>Mahsulotlar:</b>\n"
    )
    for item in items_list:
        summary_text += f"• {item['name']} x {item['quantity']} = {item['unit_price'] * item['quantity']:,} so'm\n"

    summary_text += f"\nJami to'lov: <b>{total:,} so'm</b>\n\nBuyurtmani tasdiqlaysizmi?"

    await callback.message.edit_text(
        text=summary_text,
        parse_mode="HTML",
        reply_markup=get_order_confirmation_inline_keyboard(lang)
    )
    await callback.answer()


@router.callback_query(F.data == "order:confirm")
async def handle_confirm_order(
    callback: CallbackQuery,
    session: AsyncSession,
    state: FSMContext,
    bot: Bot,
    lang: str,
    is_admin: bool
):
    """
    Persists order in PostgreSQL and notifies kitchen admin channel
    with customer details, location map link, and live status buttons.
    """
    data = await state.get_data()
    cart = data.get("cart", {})

    if not cart:
        await callback.answer(get_text(lang, "cart_empty"), show_alert=True)
        return

    items_list = list(cart.values())
    user_id = callback.from_user.id
    user = await get_user_by_id(session, user_id)

    # Create order in database
    order = await create_order(
        session=session,
        user_id=user_id,
        delivery_type=data.get("delivery_type", "delivery"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        address_text=data.get("address_text"),
        payment_method=data.get("payment_method", "cash"),
        items=items_list
    )

    # Clear customer cart and state
    await state.clear()

    # Confirm to customer
    await callback.message.edit_text(
        text=get_text(lang, "order_success", order_id=order.id),
        parse_mode="HTML"
    )
    await callback.answer("Buyurtmangiz qabul qilindi!")

    # Format Admin / Kitchen notification alert
    cust_phone = user.phone_number if user else "Mavjud emas"
    cust_name = callback.from_user.full_name
    username_str = f"@{callback.from_user.username}" if callback.from_user.username else "—"

    map_link = ""
    if order.latitude and order.longitude:
        map_link = f"\n🗺 <a href='https://maps.google.com/?q={order.latitude},{order.longitude}'>Xaritada ochish (Google Maps)</a>"

    admin_alert_text = (
        f"🚨 <b>YANGI BUYURTMA #{order.id}</b>\n"
        f"━━━━━━━━━━━━━━━━━━\n"
        f"👤 <b>Mijoz:</b> {cust_name} ({username_str})\n"
        f"📞 <b>Telefon:</b> <code>{cust_phone}</code>\n"
        f"🛵 <b>Yetkazish:</b> {order.delivery_type.upper()}\n"
        f"💳 <b>To'lov:</b> {order.payment_method.upper()}\n"
        f"📍 <b>Manzil:</b> {order.address_text or '—'}{map_link}\n\n"
        f"📋 <b>Tarkibi:</b>\n"
    )

    for item in items_list:
        admin_alert_text += f"• {item['name']} x {item['quantity']} = {item['unit_price'] * item['quantity']:,} so'm\n"

    admin_alert_text += (
        f"\n💰 <b>JAMI: {order.total_amount:,} so'm</b>\n"
        f"━━━━━━━━━━━━━━━━━━\n"
        f"Holat: ⚪ Kutilmoqda (Pending)"
    )

    control_keyboard = get_admin_order_control_keyboard(order.id)

    # 1. Send alert to configured ADMIN_CHANNEL_ID if provided
    if settings.ADMIN_CHANNEL_ID:
        try:
            await bot.send_message(
                chat_id=settings.ADMIN_CHANNEL_ID,
                text=admin_alert_text,
                parse_mode="HTML",
                reply_markup=control_keyboard,
                disable_web_page_preview=False
            )
        except Exception:
            pass

    # 2. Also send alert to each admin in ADMIN_IDS
    for admin_id in settings.ADMIN_IDS:
        try:
            await bot.send_message(
                chat_id=admin_id,
                text=admin_alert_text,
                parse_mode="HTML",
                reply_markup=control_keyboard,
                disable_web_page_preview=False
            )
        except Exception:
            pass


@router.callback_query(F.data == "order:cancel")
async def handle_cancel_order_flow(callback: CallbackQuery, state: FSMContext, lang: str):
    """Cancels active ordering process"""
    await state.clear()
    await callback.message.edit_text(text=get_text(lang, "order_cancelled"))
    await callback.answer()


@router.message(F.text.in_(["📦 Buyurtmalarim", "📦 Мои заказы", "📦 My Orders"]))
async def handle_my_orders(message: Message, session: AsyncSession, lang: str):
    """Displays last 5 orders with their live statuses"""
    orders = await get_user_orders(session, message.from_user.id, limit=5)

    if not orders:
        await message.answer(get_text(lang, "no_orders"))
        return

    text_lines = [get_text(lang, "my_orders_title")]
    status_map = {
        "pending": get_text(lang, "status_pending"),
        "accepted": get_text(lang, "status_accepted"),
        "preparing": get_text(lang, "status_preparing"),
        "on_way": get_text(lang, "status_on_way"),
        "delivered": get_text(lang, "status_delivered"),
        "cancelled": get_text(lang, "status_cancelled"),
    }

    for order in orders:
        created_str = order.created_at.strftime("%d.%m.%Y %H:%M")
        status_label = status_map.get(order.status, order.status)
        text_lines.append(
            f"🆔 <b>Buyurtma #{order.id}</b> ({created_str})\n"
            f"💰 Summa: {order.total_amount:,} so'm\n"
            f"📌 Holat: <b>{status_label}</b>\n"
        )

    await message.answer(text="\n".join(text_lines), parse_mode="HTML")
