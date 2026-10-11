"""
FSM States for the Admin Menu Management flow.
"""

from aiogram.fsm.state import State, StatesGroup


class AdminCategoryState(StatesGroup):
    waiting_for_name_uz = State()
    waiting_for_name_ru = State()
    waiting_for_name_en = State()


class AdminProductState(StatesGroup):
    waiting_for_category = State()
    waiting_for_name_uz = State()
    waiting_for_name_ru = State()
    waiting_for_name_en = State()
    waiting_for_description_uz = State()
    waiting_for_price = State()
    waiting_for_photo = State()
