"""
Reply Keyboards for Telegram Bot.
Includes language picker, contact sharing button, main menu, and location sender.
"""

from aiogram.types import ReplyKeyboardMarkup, KeyboardButton
from bot.locales.messages import get_text


def get_language_reply_keyboard() -> ReplyKeyboardMarkup:
    """Language selection keyboard on initial start or settings change"""
    keyboard = [
        [
            KeyboardButton(text="🇺🇿 O'zbekcha"),
            KeyboardButton(text="🇷🇺 Русский"),
            KeyboardButton(text="🇬🇧 English")
        ]
    ]
    return ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True,
        one_time_keyboard=True
    )


def get_contact_reply_keyboard(lang: str) -> ReplyKeyboardMarkup:
    """Sends native Telegram contact request button"""
    btn_text = get_text(lang, "btn_send_contact")
    keyboard = [
        [KeyboardButton(text=btn_text, request_contact=True)]
    ]
    return ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True,
        one_time_keyboard=True
    )


def get_main_menu_reply_keyboard(lang: str, is_admin: bool = False) -> ReplyKeyboardMarkup:
    """Main persistent navigation keyboard"""
    btn_menu = get_text(lang, "btn_menu")
    btn_cart = get_text(lang, "btn_cart")
    btn_orders = get_text(lang, "btn_orders")
    btn_contact = get_text(lang, "btn_contact")
    btn_settings = get_text(lang, "btn_settings")

    keyboard = [
        [KeyboardButton(text=btn_menu), KeyboardButton(text=btn_cart)],
        [KeyboardButton(text=btn_orders), KeyboardButton(text=btn_contact)],
        [KeyboardButton(text=btn_settings)]
    ]

    if is_admin:
        keyboard.append([KeyboardButton(text="⚡ Admin Panel")])

    return ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True,
        is_persistent=True
    )


def get_location_reply_keyboard(lang: str) -> ReplyKeyboardMarkup:
    """Sends native Telegram geolocation request button for delivery"""
    btn_location = get_text(lang, "btn_send_location")
    btn_cancel = get_text(lang, "btn_cancel")

    keyboard = [
        [KeyboardButton(text=btn_location, request_location=True)],
        [KeyboardButton(text=btn_cancel)]
    ]
    return ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True,
        one_time_keyboard=True
    )


def get_cancel_reply_keyboard(lang: str) -> ReplyKeyboardMarkup:
    """Single cancel button reply keyboard"""
    btn_cancel = get_text(lang, "btn_cancel")
    keyboard = [[KeyboardButton(text=btn_cancel)]]
    return ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True,
        one_time_keyboard=True
    )
