export type Language = 'uz' | 'ru' | 'en';

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'on_way' | 'delivered' | 'cancelled';

export interface CategoryItem {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  sort_order: number;
}

export interface ProductItem {
  id: number;
  category_id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  price: number;
  is_available: boolean;
}

export interface CartItem {
  product_id: number;
  name: string;
  unit_price: number;
  quantity: number;
}

export interface OrderRecord {
  id: number;
  user_id: number;
  customer_name: string;
  customer_username?: string;
  customer_phone: string;
  delivery_type: 'delivery' | 'pickup';
  address_text?: string;
  latitude?: number;
  longitude?: number;
  payment_method: 'cash' | 'click' | 'payme';
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  items: CartItem[];
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  replyMarkup?: {
    type: 'inline' | 'reply';
    buttons: Array<Array<{
      text: string;
      action?: string;
      url?: string;
    }>>;
  };
}
