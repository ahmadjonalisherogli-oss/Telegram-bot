"""
Start and Authentication Handlers.
Manages user onboarding, language selection, contact sharing, and main menu routing.
"""

from aiogram import Router, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext
from sqlalchemy.ext.asyncio import AsyncSession

from bot.database.queries import (
    get_or_create_user,
    update_user_language,
    update_user_phone,
    get_user_by_id,
)
from bot.keyboards.reply import (
    get_language_reply_keyboard,
    get_contact_reply_keyboard,
    get_main_menu_reply_keyboard,
)
from bot.keyboards.inline import get_settings_inline_keyboard
from bot.locales.messages import get_text

router = Router(name="start")


@router.message(CommandStart())
async def handle_start(
    message: Message,
    session: AsyncSession,
    state: FSMContext,
    is_admin: bool
):
    """Entry point when customer taps /start"""
    user, is_new = await get_or_create_user(
        session=session,
        telegram_id=message.from_user.id,
        full_name=message.from_user.full_name,
        username=message.from_user.username
    )

    # If new user or language not set, prompt language selection
    if is_new or not user.language:
        await message.answer(
            text=get_text("uz", "choose_language"),
            reply_markup=get_language_reply_keyboard()
        )
        return

    # If contact phone is missing, prompt to share phone
    if not user.phone_number:
        await message.answer(
            text=get_text(user.language, "request_contact"),
            reply_markup=get_contact_reply_keyboard(user.language)
        )
        return

    # User is ready, show main menu
    await message.answer(
        text=f"{get_text(user.language, 'welcome_back')}\n\n"
             f"🍕 <b>{user.full_name}</b>, xarid qilishni boshlaymizmi?",
        parse_mode="HTML",
        reply_markup=get_main_menu_reply_keyboard(user.language, is_admin=is_admin)
    )


@router.message(F.text.in_(["🇺🇿 O'zbekcha", "🇷🇺 Русский", "🇬🇧 English"]))
async def handle_language_choice(
    message: Message,
    session: AsyncSession,
    is_admin: bool
):
    """Processes language change from reply keyboard"""
    lang_map = {
        "🇺🇿 O'zbekcha": "uz",
        "🇷🇺 Русский": "ru",
        "🇬🇧 English": "en"
    }
    selected_lang = lang_map.get(message.text, "uz")
    await update_user_language(session, message.from_user.id, selected_lang)

    user = await get_user_by_id(session, message.from_user.id)

    # Check if contact is required
    if not user or not user.phone_number:
        await message.answer(
            text=f"{get_text(selected_lang, 'lang_selected')}\n\n"
                 f"{get_text(selected_lang, 'request_contact')}",
            reply_markup=get_contact_reply_keyboard(selected_lang)
        )
    else:
        await message.answer(
            text=f"{get_text(selected_lang, 'lang_selected')}\n\n"
                 f"{get_text(selected_lang, 'main_menu_prompt')}",
            reply_markup=get_main_menu_reply_keyboard(selected_lang, is_admin=is_admin)
        )


@router.message(F.contact)
async def handle_contact_received(
    message: Message,
    session: AsyncSession,
    lang: str,
    is_admin: bool
):
    """Saves shared customer contact phone number"""
    phone_number = message.contact.phone_number
    if not phone_number.startswith("+"):
        phone_number = f"+{phone_number}"

    await update_user_phone(session, message.from_user.id, phone_number)

    await message.answer(
        text=get_text(lang, "contact_saved"),
        reply_markup=get_main_menu_reply_keyboard(lang, is_admin=is_admin)
    )


@router.message(F.text.in_(["⚙️ Sozlamalar", "⚙️ Настройки", "⚙️ Settings"]))
async def handle_settings_menu(message: Message, lang: str):
    """Displays settings and language switcher"""
    await message.answer(
        text=f"{get_text(lang, 'btn_settings')}\n\n{get_text(lang, 'choose_language')}",
        reply_markup=get_settings_inline_keyboard(lang)
    )


@router.callback_query(F.data.startswith("set_lang:"))
async def handle_set_language_callback(
    callback: CallbackQuery,
    session: AsyncSession,
    is_admin: bool
):
    """Inline language switch"""
    new_lang = callback.data.split(":")[1]
    await update_user_language(session, callback.from_user.id, new_lang)
    await callback.answer(get_text(new_lang, "lang_selected"))

    await callback.message.delete()
    await callback.message.answer(
        text=f"{get_text(new_lang, 'lang_selected')}\n{get_text(new_lang, 'main_menu_prompt')}",
        reply_markup=get_main_menu_reply_keyboard(new_lang, is_admin=is_admin)
    )


@router.message(F.text.in_(["📞 Biz bilan aloqa", "📞 Контакты", "📞 Contact Us"]))
async def handle_contact_info(message: Message, lang: str):
    """Returns customer support information"""
    await message.answer(
        text=get_text(lang, "contact_info"),
        parse_mode="HTML"
    )
