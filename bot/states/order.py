"""
FSM States for the Customer Order flow.
"""

from aiogram.fsm.state import State, StatesGroup


class OrderState(StatesGroup):
    choosing_delivery_type = State()    # Delivery (Yetkazib berish) or Pickup (Olib ketish)
    sending_location = State()          # Sending GPS coordinates or choosing saved address
    sending_address_text = State()      # Apartment/floor/landmark details if needed
    choosing_payment = State()          # Cash, Click, Payme
    confirming = State()                # Final review and submission
