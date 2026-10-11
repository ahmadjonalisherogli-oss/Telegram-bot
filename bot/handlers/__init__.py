from aiogram import Router
from .start import router as start_router
from .menu import router as menu_router
from .cart import router as cart_router
from .order import router as order_router
from .admin import router as admin_router


def setup_routers() -> Router:
    """Master router registering all modular sub-routers"""
    master_router = Router()
    master_router.include_router(admin_router)
    master_router.include_router(start_router)
    master_router.include_router(menu_router)
    master_router.include_router(cart_router)
    master_router.include_router(order_router)
    return master_router
