import { CategoryItem, ProductItem, OrderRecord } from '../types';

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 1, name_uz: "🍔 Fast Food & Lavash", name_ru: "🍔 Фастфуд и Лаваш", name_en: "🍔 Fast Food & Wraps", sort_order: 1 },
  { id: 2, name_uz: "🍲 Milliy Taomlar", name_ru: "🍲 Национальные Блюда", name_en: "🍲 National Dishes", sort_order: 2 },
  { id: 3, name_uz: "🍢 Shashliklar", name_ru: "🍢 Шашлыки", name_en: "🍢 Kebabs & BBQ", sort_order: 3 },
  { id: 4, name_uz: "🥤 Ichimliklar", name_ru: "🥤 Напитки", name_en: "🥤 Beverages", sort_order: 4 },
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  // Fast Food
  {
    id: 1,
    category_id: 1,
    name_uz: "Mol go'shtli Lavash (Katta)",
    name_ru: "Лаваш с говядиной (Большой)",
    name_en: "Beef Lavash Wrap (Large)",
    description_uz: "Shirali mol go'shti, pomidor, bodring, maxsus qizil sous va pishloq",
    description_ru: "Сочная говядина, томаты, огурцы, фирменный соус и сыр",
    description_en: "Juicy tender beef, tomatoes, pickles, house sauce and cheese",
    price: 38000,
    is_available: true
  },
  {
    id: 2,
    category_id: 1,
    name_uz: "Tovuqli Burger Cheese",
    name_ru: "Куриный Чизбургер",
    name_en: "Chicken Cheeseburger",
    description_uz: "Qarsildoq tovuq kotleti, erigan cheddor pishlog'i, aysberg va sous",
    description_ru: "Хрустящая куриная котлета, тающий чеддер, айсберг и соус",
    description_en: "Crispy chicken patty, cheddar cheese, crisp lettuce, burger sauce",
    price: 32000,
    is_available: true
  },
  {
    id: 3,
    category_id: 1,
    name_uz: "Kartoshka Fri",
    name_ru: "Картофель Фри",
    name_en: "French Fries",
    description_uz: "Oltin rang, qarsildoq kartoshka fri ketchup bilan",
    description_ru: "Золотистый хрустящий картофель фри с кетчупом",
    description_en: "Crispy golden fries served with ketchup dip",
    price: 18000,
    is_available: true
  },

  // Milliy Taomlar
  {
    id: 4,
    category_id: 2,
    name_uz: "To'y Oshi (Toshkentcha)",
    name_ru: "Свадебный Плов (Ташкентский)",
    name_en: "Traditional Tashkent Wedding Plov",
    description_uz: "Lazer guruchi, saralangan qo'y va mol go'shti, sariq sabzi, mayiz va no'xat",
    description_ru: "Рис лазер, отборная баранина и говядина, жёлтая морковь, изюм и нут",
    description_en: "Laser rice, selected lamb and beef, yellow carrots, raisins, chickpeas",
    price: 45000,
    is_available: true
  },
  {
    id: 5,
    category_id: 2,
    name_uz: "Tandir Somsa (Go'shtli, 1 dona)",
    name_ru: "Тандырная Самса с мясом (1 шт)",
    name_en: "Tandir Somsa with Beef (1 pc)",
    description_uz: "Qatlama xamir, maydalangan mol go'shti, piyoz va zira",
    description_ru: "Слоеное тесто, рубленая говядина, лук и восточная зира",
    description_en: "Flaky pastry filled with minced beef, onions and fragrant cumin",
    price: 12000,
    is_available: true
  },

  // Shashliklar
  {
    id: 6,
    category_id: 3,
    name_uz: "Qiyma Shashlik (1 six)",
    name_ru: "Люля-Кебаб / Моленый шашлык (1 шт)",
    name_en: "Minced Lamb Kebab (1 skewer)",
    description_uz: "Yumshoq qiyma go'shti, marinadlangan piyoz va lavash noni bilan",
    description_ru: "Нежный фарш из баранины и говядины с маринованным луком",
    description_en: "Tender minced kebab skewers served with sumac-marinated onions",
    price: 22000,
    is_available: true
  },
  {
    id: 7,
    category_id: 3,
    name_uz: "Kuskovoy Mol Go'shti (1 six)",
    name_ru: "Кусковой шашлык из говядины (1 шт)",
    name_en: "Beef Shish Kebab (1 skewer)",
    description_uz: "Maxsus ziravorlar bilan dimlangan saralangan mol go'shti",
    description_ru: "Отборные сочные кусочки говядины в ароматных специях",
    description_en: "Marinated chunks of choice beef flame-grilled over charcoals",
    price: 26000,
    is_available: true
  },

  // Ichimliklar
  {
    id: 8,
    category_id: 4,
    name_uz: "Coca-Cola 0.5L",
    name_ru: "Coca-Cola 0.5L",
    name_en: "Coca-Cola 0.5L",
    description_uz: "Muzdek gazlangan ichimlik",
    description_ru: "Освежающий газированный напиток",
    description_en: "Chilled refreshing soft drink",
    price: 10000,
    is_available: true
  },
  {
    id: 9,
    category_id: 4,
    name_uz: "Muzdek Ayron 0.5L",
    name_ru: "Холодный Айран 0.5L",
    name_en: "Fresh Chilled Ayran 0.5L",
    description_uz: "Uy uslubida tayyorlangan yaxna ayron rayhon va yalpiz bilan",
    description_ru: "Домашний освежающий айран со свежими травами",
    description_en: "Traditional yogurt savory beverage with mint and herbs",
    price: 8000,
    is_available: true
  }
];

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 1041,
    user_id: 8714951833,
    customer_name: "Azizbek Rahimov",
    customer_username: "aziz_r99",
    customer_phone: "+998 90 123 45 67",
    delivery_type: "delivery",
    address_text: "Toshkent sh., Chilonzor 9-mavze, 14-uy, 42-xonadon",
    latitude: 41.2785,
    longitude: 69.2154,
    payment_method: "click",
    total_amount: 114000,
    status: "preparing",
    created_at: "10 daqiqa oldin",
    items: [
      { product_id: 4, name: "To'y Oshi (Toshkentcha)", unit_price: 45000, quantity: 2 },
      { product_id: 5, name: "Tandir Somsa (Go'shtli)", unit_price: 12000, quantity: 2 }
    ]
  },
  {
    id: 1040,
    user_id: 7192841290,
    customer_name: "Dilnoza Karimova",
    customer_username: "dilnoza_k",
    customer_phone: "+998 97 765 43 21",
    delivery_type: "pickup",
    address_text: "Restorandan olib ketish (Samovivoz)",
    payment_method: "payme",
    total_amount: 86000,
    status: "on_way",
    created_at: "25 daqiqa oldin",
    items: [
      { product_id: 1, name: "Mol go'shtli Lavash (Katta)", unit_price: 38000, quantity: 2 },
      { product_id: 8, name: "Coca-Cola 0.5L", unit_price: 10000, quantity: 1 }
    ]
  },
  {
    id: 1039,
    user_id: 6182910394,
    customer_name: "Shavkat Umarov",
    customer_username: "shavkat_u",
    customer_phone: "+998 93 555 12 34",
    delivery_type: "delivery",
    address_text: "Yunusobod 4-mavze, 12-uy",
    latitude: 41.3654,
    longitude: 69.2891,
    payment_method: "cash",
    total_amount: 70000,
    status: "delivered",
    created_at: "45 daqiqa oldin",
    items: [
      { product_id: 6, name: "Qiyma Shashlik (1 six)", unit_price: 22000, quantity: 2 },
      { product_id: 7, name: "Kuskovoy Mol Go'shti (1 six)", unit_price: 26000, quantity: 1 }
    ]
  }
];
