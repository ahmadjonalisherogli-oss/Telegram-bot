# 🍽️ Uzbekistan Restaurant & Food Delivery Telegram Bot

A clean, modular, and production-ready Telegram Ordering Bot tailored for restaurants, cafes, fast-food chains, and delivery services in Uzbekistan.

Built with **Python 3.11+**, **Aiogram 3.x (Asyncio)**, **PostgreSQL (SQLAlchemy 2.0 with asyncpg)**, and **Redis (for FSM storage and high-throughput caching)**.

---

## 📁 Architecture & Folder Structure

```
├── .env.example              # Environment variables template
├── Dockerfile                # Production Docker container image
├── docker-compose.yml        # Orchestration for Bot, PostgreSQL 15, and Redis 7
├── requirements.txt          # Python dependencies with pinned versions
├── bot.service               # Systemd unit file for Linux VPS deployment
├── README.md                 # Detailed documentation and deployment guide
└── bot/
    ├── __init__.py           # Bot package definition
    ├── config.py             # Pydantic-settings configuration loader
    ├── main.py               # Dispatcher setup, database migration, long polling runner
    ├── database/
    │   ├── __init__.py       # Database exports
    │   ├── models.py         # SQLAlchemy 2.0 ORM Models (User, Category, Product, Order, OrderItem)
    │   ├── session.py        # Async sessionmaker and automatic menu seed initialization
    │   └── queries.py        # High-performance async CRUD queries
    ├── handlers/
    │   ├── __init__.py       # Master router combining all sub-routers
    │   ├── start.py          # /start, language picker (UZ/RU/EN), contact sharing
    │   ├── menu.py           # Category navigation, product view, inline +/- quantity picker
    │   ├── cart.py           # Shopping cart review, item removal, cart clearing
    │   ├── order.py          # Checkout, Delivery (GPS) / Pickup, Payment (Cash/Click/Payme)
    │   └── admin.py          # Kitchen alert controls, live order updates, analytics, menu FSM
    ├── keyboards/
    │   ├── __init__.py       # Keyboards exports
    │   ├── reply.py          # Native contact/location buttons, main persistent menu
    │   └── inline.py         # Dynamic catalog buttons, +/- counters, admin status toggles
    ├── middlewares/
    │   ├── __init__.py       # Middleware exports
    │   ├── db.py             # AsyncSession scoped injection middleware
    │   └── i18n.py           # Language detector and admin privileges middleware
    ├── locales/
    │   ├── __init__.py       # Locales exports
    │   └── messages.py       # Multi-language translation dictionary (UZ, RU, EN)
    └── states/
        ├── __init__.py       # States exports
        ├── order.py          # Customer checkout FSM (Delivery, Location, Payment)
        └── admin.py          # Admin category & product creation FSM
```

---

## ✨ Features & User Flows

### 1. Customer Experience
- **Multi-Language Support**: Uzbek 🇺🇿, Russian 🇷🇺, and English 🇬🇧 with instant switching.
- **One-Tap Contact Sharing**: Native Telegram contact verification (`request_contact=True`).
- **Dynamic Menu & Visual Navigation**: Categories -> Dishes/Beverages -> Detailed card.
- **Inline Quantity Counter**: Interactive `[-]` `[qty]` `[+]` counter to add multiples directly.
- **Smart Cart Management**: View subtotal, edit quantities, clear cart, and calculate real-time totals in Uzbek Sum (`UZS`).
- **Flexible Order Options**:
  - 🛵 **Delivery**: Prompts for native Telegram GPS Geolocation coordinates with automatic Google Maps link generation.
  - 🏃 **Pickup (Samovivoz)**: Displays restaurant address, working hours, and coordinates.
- **Uzbekistan Payment Methods**: Cash (`Naqd`), Click, and Payme.
- **Order Tracking**: `/orders` or `📦 Buyurtmalarim` shows real-time status history.

### 2. Admin & Kitchen Dashboard (Directly in Telegram)
- **Instant Kitchen Notifications**: Order alerts dispatched to `ADMIN_CHANNEL_ID` and all `ADMIN_IDS`.
- **Complete Order Dossier**: Customer name, phone, itemized receipt, delivery type, location map link, payment type, and total sum.
- **One-Click Status Transitions**:
  - `🟡 Qabul qilish (Accepted)`
  - `🟠 Oshxonada tayyorlanmoqda (Preparing)`
  - `🔵 Kuryer yo'lga chiqdi (On the Way)`
  - `🟢 Yetkazib berildi (Delivered)`
  - `🔴 Bekor qilish (Cancelled)`
- **Auto-Notifications**: The customer receives an immediate localized notification whenever kitchen staff changes their order status!
- **Real-Time Revenue Analytics**: Run `/admin` to view today's revenue, order count, monthly revenue, and registered customer count.
- **Menu Management via FSM**: Add new categories and dishes interactively through the bot.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Python 3.11+
- PostgreSQL 14+
- Redis 6+

### 2. Clone & Setup Virtual Environment
```bash
git clone https://github.com/your-username/telegram-restaurant-bot.git
cd telegram-restaurant-bot

python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and fill in your Bot Token and database credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```env
BOT_TOKEN=8296254654:AAHCd4YbihhO-ySyg-zlYBSTFrIPap5dPk0
ADMIN_IDS=8714951833
DATABASE_URL=postgresql+asyncpg://postgres:postgres_password@localhost:5432/restaurant_bot_db
REDIS_URL=redis://localhost:6379/0
```

### 4. Run the Bot
```bash
python -m bot.main
```
The bot will automatically create all PostgreSQL tables and seed the initial menu (Fast Food, Milliy Taomlar, Shashlik, Drinks).

---

## 🐳 Deployment with Docker Compose (Recommended)

To run the entire stack (PostgreSQL, Redis, and Bot) in isolated containers:

```bash
# 1. Ensure .env is populated with your BOT_TOKEN
nano .env

# 2. Build and start containers in the background
docker compose up -d --build

# 3. View live logs
docker compose logs -f telegram_bot
```

To stop:
```bash
docker compose down
```

---

## 🐧 Linux VPS Deployment via Systemd

1. Copy the project to `/opt/telegram_restaurant_bot`.
2. Set up the virtual environment:
   ```bash
   cd /opt/telegram_restaurant_bot
   python3 -m venv venv
   ./venv/bin/pip install -r requirements.txt
   ```
3. Copy the systemd unit file:
   ```bash
   sudo cp bot.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable bot
   sudo systemctl start bot
   ```
4. Check bot status:
   ```bash
   sudo systemctl status bot
   journalctl -u bot -f
   ```
