"""
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
from bot.database.queries import (
    update_order_status,
    get_order_with_details,
    get_analytics_summary,
    get_all_categories,
    add_category,
    add_product,
)
from bot.keyboards.inline import (
    get_admin_order_control_keyboard,
    get_admin_dashboard_inline_keyboard,
)
from bot.locales.messages import get_text
from bot.states.admin import AdminCategoryState, AdminProductState

router = Router(name="admin")


# Filter to restrict handlers to configured administrators
def is_admin_filter(user_id: int) -> bool:
    return user_id in settings.ADMIN_IDS


@router.message(Command("admin"))
@router.message(F.text == "⚡ Admin Panel")
async def handle_admin_panel(message: Message):
    """Admin dashboard entry point"""
    if not is_admin_filter(message.from_user.id):
        return

    await message.answer(
        text="👨‍🍳 <b>Oshxona & Administrator Boshqaruv Paneli</b>\n\n"
             "Quyidagi amallardan birini tanlang:",
        parse_mode="HTML",
        reply_markup=get_admin_dashboard_inline_keyboard()
    )


# ---------------- ORDER STATUS LIFECYCLE ---------------- #

STATUS_DISPLAY = {
    "accepted": "🟡 Qabul qilindi (Accepted)",
    "preparing": "🟠 Oshxonada tayyorlanmoqda (Preparing)",
    "on_way": "🔵 Kuryer yo'lga chiqdi (On the Way)",
    "delivered": "🟢 Yetkazib berildi (Delivered)",
    "cancelled": "🔴 Bekor qilindi (Cancelled)",
}


@router.callback_query(F.data.startswith("adm_status:"))
async def handle_admin_status_change(callback: CallbackQuery, session: AsyncSession, bot: Bot):
    """
    Updates order status and sends automated alert to the customer.
    """
    if not is_admin_filter(callback.from_user.id):
        await callback.answer("Ruxsat berilmagan!", show_alert=True)
        return

    _, order_id_str, new_status = callback.data.split(":")
    order_id = int(order_id_str)

    order = await update_order_status(session, order_id, new_status)
    if not order:
        await callback.answer("Buyurtma topilmadi!", show_alert=True)
        return

    status_label = STATUS_DISPLAY.get(new_status, new_status)
    await callback.answer(f"Holat o'zgardi: {status_label}")

    # Update admin message text with new status
    original_text = callback.message.text or callback.message.caption or ""
    # Strip previous status line if present
    if "Holat:" in original_text:
        base_text = original_text.split("Holat:")[0].strip()
    else:
        base_text = original_text

    updated_text = f"{base_text}\n━━━━━━━━━━━━━━━━━━\nHolat: <b>{status_label}</b>"

    try:
        await callback.message.edit_text(
            text=updated_text,
            parse_mode="HTML",
            reply_markup=get_admin_order_control_keyboard(order_id)
        )
    except Exception:
        pass

    # Notify customer automatically in their native language
    try:
        user_lang = order.user.language if order.user else "uz"
        cust_status_text = get_text(user_lang, f"status_{new_status}")
        notification_text = get_text(
            user_lang,
            "status_update_notification",
            order_id=order.id,
            status=cust_status_text
        )

        await bot.send_message(
            chat_id=order.user_id,
            text=notification_text,
            parse_mode="HTML"
        )
    except Exception:
        # Ignore if user blocked the bot or chat error
        pass


# ---------------- ANALYTICS DASHBOARD ---------------- #

@router.callback_query(F.data == "adm_panel:analytics")
async def handle_admin_analytics(callback: CallbackQuery, session: AsyncSession):
    """Displays real-time revenue and order metrics"""
    if not is_admin_filter(callback.from_user.id):
        return

    data = await get_analytics_summary(session)

    stats_text = (
        "📊 <b>RESTORAN DAROMAD VA BUYURTMA ANALITIKASI</b>\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        f"📅 <b>Bugungi kun:</b>\n"
        f"• Buyurtmalar soni: <b>{data['today_count']} ta</b>\n"
        f"• Jami tushum: <b>{data['today_revenue']:,} so'm</b>\n\n"
        f"📆 <b>Joriy oy:</b>\n"
        f"• Buyurtmalar soni: <b>{data['month_count']} ta</b>\n"
        f"• Jami oylik tushum: <b>{data['month_revenue']:,} so'm</b>\n\n"
        f"👥 <b>Ro'yxatdan o'tgan mijozlar:</b> <b>{data['total_users']} ta</b>\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        "⚡ <i>Ma'lumotlar real vaqt rejimida hisoblanadi.</i>"
    )

    await callback.message.answer(text=stats_text, parse_mode="HTML")
    await callback.answer()


# ---------------- FSM: ADD CATEGORY ---------------- #

@router.callback_query(F.data == "adm_panel:add_cat")
async def handle_start_add_category(callback: CallbackQuery, state: FSMContext):
    """Starts category creation wizard"""
    if not is_admin_filter(callback.from_user.id):
        return

    await state.set_state(AdminCategoryState.waiting_for_name_uz)
    await callback.message.answer(
        "Kategoriya nomini O'zbek tilida kiriting (masalan: 🍕 Pitsalar):"
    )
    await callback.answer()


@router.message(AdminCategoryState.waiting_for_name_uz)
async def process_cat_name_uz(message: Message, state: FSMContext):
    await state.update_data(name_uz=message.text)
    await state.set_state(AdminCategoryState.waiting_for_name_ru)
    await message.answer("Endi kategoriya nomini Rus tilida kiriting (masalan: 🍕 Пиццы):")


@router.message(AdminCategoryState.waiting_for_name_ru)
async def process_cat_name_ru(message: Message, state: FSMContext):
    await state.update_data(name_ru=message.text)
    await state.set_state(AdminCategoryState.waiting_for_name_en)
    await message.answer("Endi kategoriya nomini Ingliz tilida kiriting (masalan: 🍕 Pizzas):")


@router.message(AdminCategoryState.waiting_for_name_en)
async def process_cat_name_en(message: Message, state: FSMContext, session: AsyncSession):
    data = await state.get_data()
    category = await add_category(
        session=session,
        name_uz=data["name_uz"],
        name_ru=data["name_ru"],
        name_en=message.text
    )
    await state.clear()
    await message.answer(
        f"✅ Yangi kategoriya muvaffaqiyatli qo'shildi: <b>{category.name_uz}</b> (ID: {category.id})",
        parse_mode="HTML"
    )


# ---------------- FSM: ADD PRODUCT ---------------- #

@router.callback_query(F.data == "adm_panel:add_prod")
async def handle_start_add_product(callback: CallbackQuery, session: AsyncSession, state: FSMContext):
    """Starts product creation wizard"""
    if not is_admin_filter(callback.from_user.id):
        return

    categories = await get_all_categories(session)
    if not categories:
        await callback.answer("Oldin kategoriya yarating!", show_alert=True)
        return

    cat_list = "\n".join([f"ID: <code>{c.id}</code> — {c.name_uz}" for c in categories])
    await state.set_state(AdminProductState.waiting_for_category)
    await callback.message.answer(
        f"Mahsulot qo'shmoqchi bo'lgan kategoriya ID sini kiriting:\n\n{cat_list}",
        parse_mode="HTML"
    )
    await callback.answer()


@router.message(AdminProductState.waiting_for_category)
async def process_prod_category(message: Message, state: FSMContext):
    if not message.text.isdigit():
        await message.answer("Iltimos, faqat raqam (kategoriya ID) kiriting:")
        return

    await state.update_data(category_id=int(message.text))
    await state.set_state(AdminProductState.waiting_for_name_uz)
    await message.answer("Mahsulot nomini O'zbek tilida kiriting (masalan: Pepperoni Pizza):")


@router.message(AdminProductState.waiting_for_name_uz)
async def process_prod_name_uz(message: Message, state: FSMContext):
    await state.update_data(name_uz=message.text)
    await state.set_state(AdminProductState.waiting_for_name_ru)
    await message.answer("Mahsulot nomini Rus tilida kiriting:")


@router.message(AdminProductState.waiting_for_name_ru)
async def process_prod_name_ru(message: Message, state: FSMContext):
    await state.update_data(name_ru=message.text)
    await state.set_state(AdminProductState.waiting_for_name_en)
    await message.answer("Mahsulot nomini Ingliz tilida kiriting:")


@router.message(AdminProductState.waiting_for_name_en)
async def process_prod_name_en(message: Message, state: FSMContext):
    await state.update_data(name_en=message.text)
    await state.set_state(AdminProductState.waiting_for_price)
    await message.answer("Mahsulot narxini so'mda kiriting (masalan: 65000):")


@router.message(AdminProductState.waiting_for_price)
async def process_prod_price(message: Message, state: FSMContext, session: AsyncSession):
    clean_price = message.text.replace(" ", "").replace(",", "").replace(".", "")
    if not clean_price.isdigit():
        await message.answer("Iltimos, haqiqiy narx raqamini kiriting:")
        return

    price = int(clean_price)
    data = await state.get_data()

    product = await add_product(
        session=session,
        category_id=data["category_id"],
        name_uz=data["name_uz"],
        name_ru=data["name_ru"],
        name_en=data["name_en"],
        price=price
    )
    await state.clear()
    await message.answer(
        f"✅ Mahsulot qo'shildi:\n"
        f"🍲 <b>{product.name_uz}</b>\n"
        f"💰 Narxi: {product.price:,} so'm",
        parse_mode="HTML"
    )
