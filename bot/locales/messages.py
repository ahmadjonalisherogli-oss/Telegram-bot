"""
Multi-language translation strings for Uzbek, Russian, and English.
"""

MESSAGES = {
    "uz": {
        # Buttons
        "btn_menu": "🍕 Menyu",
        "btn_cart": "🛒 Savat",
        "btn_orders": "📦 Buyurtmalarim",
        "btn_contact": "📞 Biz bilan aloqa",
        "btn_settings": "⚙️ Sozlamalar",
        "btn_send_contact": "📲 Telefon raqamni yuborish",
        "btn_send_location": "📍 Manzilni yuborish (GPS)",
        "btn_back": "⬅️ Orqaga",
        "btn_main_menu": "🏠 Asosiy menyu",
        "btn_clear_cart": "🗑 Savatni tozalash",
        "btn_checkout": "✅ Rasmiylashtirish",
        "btn_delivery": "🛵 Yetkazib berish",
        "btn_pickup": "🏃 Olib ketish (Samovivoz)",
        "btn_cash": "💵 Naqd pul",
        "btn_click": "🔵 Click",
        "btn_payme": "🟢 Payme",
        "btn_confirm_order": "🚀 Buyurtmani tasdiqlash",
        "btn_cancel": "❌ Bekor qilish",
        "btn_change_lang": "🌐 Tilni o'zgartirish",

        # Greetings & Prompts
        "choose_language": "Assalomu alaykum! Iltimos, xizmat ko'rsatish tilini tanlang:\nЗдравствуйте! Пожалуйста, выберите язык обслуживания:\nHello! Please select your language:",
        "lang_selected": "O'zbek tili tanlandi! 🇺🇿",
        "request_contact": "Buyurtmalarni qabul qilish va siz bilan bog'lanish uchun telefon raqamingizni pastdagi tugma orqali yuboring:",
        "contact_saved": "Rahmat! Telefon raqamingiz muvaffaqiyatli saqlandi. Buyurtma berishga tayyormiz!",
        "welcome_back": "Xush kelibsiz! Marhamat, quyidagi bo'limlardan birini tanlang:",
        "main_menu_prompt": "Kerakli bo'limni tanlang:",

        # Menu & Cart
        "choose_category": "Marhamat, kategoriyani tanlang:",
        "choose_product": "Mahsulotni tanlang:",
        "product_added": "Savatchaga qo'shildi!",
        "cart_empty": "Savatingiz hozircha bo'sh. Mazali taomlarimizdan buyurtma bering! 🍕",
        "cart_title": "🛒 Sizning savatingiz:",
        "cart_item_format": "• {name} x {qty} = {subtotal:,} so'm",
        "cart_total": "\nJami to'lov: <b>{total:,} so'm</b>",
        "cart_cleared": "Savatchangiz tozalandi.",

        # Checkout & Delivery
        "choose_delivery_type": "Buyurtmani qanday qabul qilasiz?",
        "send_delivery_location": "Iltimos, yetkazib berish manzilini aniqlash uchun geolokatsiyangizni yuboring (pastdagi tugma orqali) yoki bekor qiling:",
        "pickup_info": "Buyurtmangizni restoranimizdan olib ketishingiz mumkin:\n📍 Manzil: Toshkent sh., Chilonzor 9-mavze, 21-uy\n⏰ Ish vaqti: 10:00 - 23:00",
        "choose_payment_method": "To'lov turini tanlang:",
        "order_confirm_prompt": "📋 <b>Buyurtmani tasdiqlash:</b>\n\nYetkazib berish: {delivery}\nManzil/Izoh: {address}\nTo'lov turi: {payment}\nJami: <b>{total:,} so'm</b>\n\nBuyurtmani yuborasizmi?",
        "order_success": "🎉 <b>Buyurtmangiz #ORDER_{order_id} qabul qilindi!</b>\n\nTez orada operatorimiz siz bilan bog'lanadi yoki buyurtma holati yangilanadi.",
        "order_cancelled": "Buyurtma bekor qilindi.",

        # Orders list
        "no_orders": "Sizda hali buyurtmalar mavjud emas.",
        "my_orders_title": "📦 <b>Oxirgi buyurtmalaringiz:</b>\n",

        # Contact info
        "contact_info": "📞 <b>Restoran aloqa markazi:</b>\n\nTelefon: +998 71 200 00 00\nTelegram admin: @restaurant_support\nIsh vaqti: Har kuni 10:00 dan 23:00 gacha\nManzil: Toshkent sh., Chilonzor tumani.",

        # Order Statuses
        "status_pending": "Kutilmoqda ⚪",
        "status_accepted": "Qabul qilindi 🟡",
        "status_preparing": "Tayyorlanmoqda 🟠",
        "status_on_way": "Kuryer yo'lda 🔵",
        "status_delivered": "Yetkazildi 🟢",
        "status_cancelled": "Bekor qilindi 🔴",

        # Notifications
        "status_update_notification": "🔔 <b>Buyurtmangiz holati o'zgardi!</b>\n\nBuyurtma #{order_id}\nYangi holat: <b>{status}</b>"
    },

    "ru": {
        # Buttons
        "btn_menu": "🍕 Меню",
        "btn_cart": "🛒 Корзина",
        "btn_orders": "📦 Мои заказы",
        "btn_contact": "📞 Контакты",
        "btn_settings": "⚙️ Настройки",
        "btn_send_contact": "📲 Отправить номер телефона",
        "btn_send_location": "📍 Отправить локацию (GPS)",
        "btn_back": "⬅️ Назад",
        "btn_main_menu": "🏠 Главное меню",
        "btn_clear_cart": "🗑 Очистить корзину",
        "btn_checkout": "✅ Оформить заказ",
        "btn_delivery": "🛵 Доставка",
        "btn_pickup": "🏃 Самовывоз",
        "btn_cash": "💵 Наличные",
        "btn_click": "🔵 Click",
        "btn_payme": "🟢 Payme",
        "btn_confirm_order": "🚀 Подтвердить заказ",
        "btn_cancel": "❌ Отмена",
        "btn_change_lang": "🌐 Изменить язык",

        # Greetings & Prompts
        "choose_language": "Пожалуйста, выберите язык обслуживания:",
        "lang_selected": "Выбран русский язык! 🇷🇺",
        "request_contact": "Для подтверждения заказов отправьте ваш контактный номер с помощью кнопки ниже:",
        "contact_saved": "Спасибо! Ваш контакт успешно сохранен. Приятных заказов!",
        "welcome_back": "Добро пожаловать! Выберите интересующий раздел:",
        "main_menu_prompt": "Выберите раздел меню:",

        # Menu & Cart
        "choose_category": "Пожалуйста, выберите категорию:",
        "choose_product": "Выберите блюдо или напиток:",
        "product_added": "Добавлено в корзину!",
        "cart_empty": "Ваша корзина пуста. Закажите вкусные блюда прямо сейчас! 🍕",
        "cart_title": "🛒 Ваша корзина:",
        "cart_item_format": "• {name} x {qty} = {subtotal:,} сум",
        "cart_total": "\nИтого к оплате: <b>{total:,} сум</b>",
        "cart_cleared": "Корзина очищена.",

        # Checkout & Delivery
        "choose_delivery_type": "Выберите способ получения заказа:",
        "send_delivery_location": "Пожалуйста, отправьте вашу геолокацию с помощью кнопки ниже для точной доставки:",
        "pickup_info": "Вы можете забрать заказ самостоятельно:\n📍 Адрес: г. Ташкент, Чиланзар, квартал 9, дом 21\n⏰ Время работы: 10:00 - 23:00",
        "choose_payment_method": "Выберите удобный способ оплаты:",
        "order_confirm_prompt": "📋 <b>Подтверждение заказа:</b>\n\nСпособ: {delivery}\nАдрес: {address}\nОплата: {payment}\nСумма: <b>{total:,} сум</b>\n\nОтправить заказ в ресторан?",
        "order_success": "🎉 <b>Ваш заказ #ORDER_{order_id} принят!</b>\n\nСкоро с вами свяжется оператор или статус заказа обновится автоматически.",
        "order_cancelled": "Заказ отменен.",

        # Orders list
        "no_orders": "У вас пока нет активных или прошлых заказов.",
        "my_orders_title": "📦 <b>История ваших заказов:</b>\n",

        # Contact info
        "contact_info": "📞 <b>Контакты службы поддержки:</b>\n\nТелефон: +998 71 200 00 00\nTelegram оператор: @restaurant_support\nГрафик: ежедневно с 10:00 до 23:00\nг. Ташкент, Чиланзарский район.",

        # Order Statuses
        "status_pending": "Ожидает ⚪",
        "status_accepted": "Принят 🟡",
        "status_preparing": "Готовится 🟠",
        "status_on_way": "В пути 🔵",
        "status_delivered": "Доставлен 🟢",
        "status_cancelled": "Отменен 🔴",

        # Notifications
        "status_update_notification": "🔔 <b>Статус вашего заказа изменился!</b>\n\nЗаказ #{order_id}\nНовый статус: <b>{status}</b>"
    },

    "en": {
        # Buttons
        "btn_menu": "🍕 Menu",
        "btn_cart": "🛒 Cart",
        "btn_orders": "📦 My Orders",
        "btn_contact": "📞 Contact Us",
        "btn_settings": "⚙️ Settings",
        "btn_send_contact": "📲 Share Phone Number",
        "btn_send_location": "📍 Share Location (GPS)",
        "btn_back": "⬅️ Back",
        "btn_main_menu": "🏠 Main Menu",
        "btn_clear_cart": "🗑 Clear Cart",
        "btn_checkout": "✅ Checkout",
        "btn_delivery": "🛵 Delivery",
        "btn_pickup": "🏃 Self-Pickup",
        "btn_cash": "💵 Cash",
        "btn_click": "🔵 Click",
        "btn_payme": "🟢 Payme",
        "btn_confirm_order": "🚀 Confirm Order",
        "btn_cancel": "❌ Cancel",
        "btn_change_lang": "🌐 Change Language",

        # Greetings & Prompts
        "choose_language": "Please select your preferred language:",
        "lang_selected": "English selected! 🇬🇧",
        "request_contact": "To coordinate order confirmations, please share your phone number using the button below:",
        "contact_saved": "Thank you! Your phone number has been saved successfully.",
        "welcome_back": "Welcome back! Please select an option below:",
        "main_menu_prompt": "Select an option from the menu:",

        # Menu & Cart
        "choose_category": "Please select a category:",
        "choose_product": "Select a product:",
        "product_added": "Added to cart!",
        "cart_empty": "Your cart is currently empty. Explore our delicious menu! 🍕",
        "cart_title": "🛒 Your Shopping Cart:",
        "cart_item_format": "• {name} x {qty} = {subtotal:,} UZS",
        "cart_total": "\nTotal Amount: <b>{total:,} UZS</b>",
        "cart_cleared": "Your cart has been emptied.",

        # Checkout & Delivery
        "choose_delivery_type": "How would you like to receive your order?",
        "send_delivery_location": "Please share your current GPS location using the button below:",
        "pickup_info": "You can pick up your order directly from our location:\n📍 Address: 21, Block 9, Chilanzar district, Tashkent\n⏰ Working hours: 10:00 - 23:00",
        "choose_payment_method": "Choose your payment method:",
        "order_confirm_prompt": "📋 <b>Order Summary:</b>\n\nMethod: {delivery}\nAddress/Details: {address}\nPayment: {payment}\nTotal: <b>{total:,} UZS</b>\n\nPlace this order now?",
        "order_success": "🎉 <b>Your order #ORDER_{order_id} has been placed!</b>\n\nWe are preparing it now. You will receive updates as the kitchen progresses.",
        "order_cancelled": "Order was cancelled.",

        # Orders list
        "no_orders": "You do not have any past orders yet.",
        "my_orders_title": "📦 <b>Your recent orders:</b>\n",

        # Contact info
        "contact_info": "📞 <b>Customer Support:</b>\n\nPhone: +998 71 200 00 00\nTelegram: @restaurant_support\nHours: 10:00 AM - 11:00 PM Daily\nTashkent, Uzbekistan.",

        # Order Statuses
        "status_pending": "Pending ⚪",
        "status_accepted": "Accepted 🟡",
        "status_preparing": "Preparing 🟠",
        "status_on_way": "On the Way 🔵",
        "status_delivered": "Delivered 🟢",
        "status_cancelled": "Cancelled 🔴",

        # Notifications
        "status_update_notification": "🔔 <b>Order Status Update!</b>\n\nOrder #{order_id}\nNew status: <b>{status}</b>"
    }
}


def get_text(lang: str, key: str, **kwargs) -> str:
    """Retrieve localized message formatted with keyword arguments"""
    language_dict = MESSAGES.get(lang, MESSAGES["uz"])
    template = language_dict.get(key, MESSAGES["uz"].get(key, key))
    if kwargs:
        try:
            return template.format(**kwargs)
        except Exception:
            return template
    return template
