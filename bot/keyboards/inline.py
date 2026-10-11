"""
Inline Keyboards for Telegram Bot.
Includes dynamic menu navigation, +/- quantity picker, cart management,
checkout options (Delivery/Pickup, Cash/Click/Payme), and kitchen order controls.
"""

from typing import List, Dict, Any
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

from bot.database.models import Category, Product
from bot.locales.messages import get_text


def get_categories_inline_keyboard(categories: List[Category], lang: str) -> InlineKeyboardMarkup:
    """Builds interactive category buttons grid"""
    builder = InlineKeyboardBuilder()
    for cat in categories:
        builder.button(
            text=cat.get_name(lang),
            callback_data=f"cat:{cat.id}"
        )
    builder.adjust(2)  # 2 columns for clean mobile UX
    return builder.as_markup()


def get_products_inline_keyboard(products: List[Product], category_id: int, lang: str) -> InlineKeyboardMarkup:
    """Builds product list for a selected category"""
    builder = InlineKeyboardBuilder()
    for prod in products:
        builder.button(
            text=f"{prod.get_name(lang)} — {prod.price:,} so'm",
            callback_data=f"prod:{prod.id}:{category_id}"
        )
    builder.adjust(1)
    # Navigation row
    builder.row(
        InlineKeyboardButton(
            text=get_text(lang, "btn_back"),
            callback_data="menu:categories"
        ),
        InlineKeyboardButton(
            text=get_text(lang, "btn_cart"),
            callback_data="cart:view"
        )
    )
    return builder.as_markup()


def get_product_detail_inline_keyboard(
    product_id: int,
    category_id: int,
    quantity: int,
    lang: str
) -> InlineKeyboardMarkup:
    """
    Inline Quantity Picker with -, current quantity, and + buttons.
    Allows seamless increments/decrements before adding to cart.
    """
    builder = InlineKeyboardBuilder()

    # Row 1: Quantity counter with minus / display / plus
    builder.row(
        InlineKeyboardButton(text="➖", callback_data=f"qty:dec:{product_id}:{category_id}:{quantity}"),
        InlineKeyboardButton(text=f"{quantity} dona", callback_data="noop"),
        InlineKeyboardButton(text="➕", callback_data=f"qty:inc:{product_id}:{category_id}:{quantity}"),
    )

    # Row 2: Add to cart button
    builder.row(
        InlineKeyboardButton(
            text=f"🛒 {get_text(lang, 'product_added')} ({quantity})",
            callback_data=f"cart:add:{product_id}:{quantity}"
        )
    )

    # Row 3: Back button
    builder.row(
        InlineKeyboardButton(
            text=get_text(lang, "btn_back"),
            callback_data=f"cat:{category_id}"
        )
    )

    return builder.as_markup()


def get_cart_inline_keyboard(cart_items: List[Dict[str, Any]], lang: str) -> InlineKeyboardMarkup:
    """Cart view inline buttons for editing line items, clearing, and checkout"""
    builder = InlineKeyboardBuilder()

    if cart_items:
        # Per-item modification buttons
        for item in cart_items:
            builder.row(
                InlineKeyboardButton(
                    text=f"❌ {item['name'][:18]}",
                    callback_data=f"cart:remove:{item['product_id']}"
                )
            )

        # Action buttons
        builder.row(
            InlineKeyboardButton(
                text=get_text(lang, "btn_clear_cart"),
                callback_data="cart:clear"
            ),
            InlineKeyboardButton(
                text=get_text(lang, "btn_checkout"),
                callback_data="order:checkout"
            )
        )

    # Back to menu
    builder.row(
        InlineKeyboardButton(
            text=get_text(lang, "btn_menu"),
            callback_data="menu:categories"
        )
    )

    return builder.as_markup()


def get_delivery_type_inline_keyboard(lang: str) -> InlineKeyboardMarkup:
    """Choose Delivery (🛵) or Pickup (🏃)"""
    builder = InlineKeyboardBuilder()
    builder.button(
        text=get_text(lang, "btn_delivery"),
        callback_data="deliv:delivery"
    )
    builder.button(
        text=get_text(lang, "btn_pickup"),
        callback_data="deliv:pickup"
    )
    builder.adjust(2)
    builder.row(
        InlineKeyboardButton(
            text=get_text(lang, "btn_cancel"),
            callback_data="order:cancel"
        )
    )
    return builder.as_markup()


def get_payment_method_inline_keyboard(lang: str) -> InlineKeyboardMarkup:
    """Payment methods: Cash, Click, Payme"""
    builder = InlineKeyboardBuilder()
    builder.button(text=get_text(lang, "btn_cash"), callback_data="pay:cash")
    builder.button(text=get_text(lang, "btn_click"), callback_data="pay:click")
    builder.button(text=get_text(lang, "btn_payme"), callback_data="pay:payme")
    builder.adjust(3)
    builder.row(
        InlineKeyboardButton(
            text=get_text(lang, "btn_cancel"),
            callback_data="order:cancel"
        )
    )
    return builder.as_markup()


def get_order_confirmation_inline_keyboard(lang: str) -> InlineKeyboardMarkup:
    """Final order confirmation before database persistence"""
    builder = InlineKeyboardBuilder()
    builder.button(
        text=get_text(lang, "btn_confirm_order"),
        callback_data="order:confirm"
    )
    builder.button(
        text=get_text(lang, "btn_cancel"),
        callback_data="order:cancel"
    )
    builder.adjust(1)
    return builder.as_markup()


def get_admin_order_control_keyboard(order_id: int) -> InlineKeyboardMarkup:
    """
    Kitchen & Admin interactive order status controller.
    Triggers status update in DB and notifies customer automatically.
    """
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="🟡 Qabul qilish", callback_data=f"adm_status:{order_id}:accepted"),
        InlineKeyboardButton(text="🟠 Oshxonada", callback_data=f"adm_status:{order_id}:preparing")
    )
    builder.row(
        InlineKeyboardButton(text="🔵 Kuryer yo'lda", callback_data=f"adm_status:{order_id}:on_way"),
        InlineKeyboardButton(text="🟢 Yetkazildi", callback_data=f"adm_status:{order_id}:delivered")
    )
    builder.row(
        InlineKeyboardButton(text="🔴 Bekor qilish", callback_data=f"adm_status:{order_id}:cancelled")
    )
    return builder.as_markup()


def get_admin_dashboard_inline_keyboard() -> InlineKeyboardMarkup:
    """Main admin options panel"""
    builder = InlineKeyboardBuilder()
    builder.button(text="📊 Kunlik / Oylik Statistika", callback_data="adm_panel:analytics")
    builder.button(text="➕ Kategoriya qo'shish", callback_data="adm_panel:add_cat")
    builder.button(text="🍲 Mahsulot qo'shish", callback_data="adm_panel:add_prod")
    builder.adjust(1)
    return builder.as_markup()


def get_settings_inline_keyboard(lang: str) -> InlineKeyboardMarkup:
    """Settings menu inline buttons"""
    builder = InlineKeyboardBuilder()
    builder.button(text="🇺🇿 O'zbekcha", callback_data="set_lang:uz")
    builder.button(text="🇷🇺 Русский", callback_data="set_lang:ru")
    builder.button(text="🇬🇧 English", callback_data="set_lang:en")
    builder.adjust(3)
    return builder.as_markup()
