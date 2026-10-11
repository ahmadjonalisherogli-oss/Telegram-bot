import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  MapPin, 
  Phone, 
  ShoppingBag, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  Trash2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Language, CategoryItem, ProductItem, CartItem, OrderRecord, ChatMessage } from '../types';

interface TelegramSimulatorProps {
  categories: CategoryItem[];
  products: ProductItem[];
  orders: OrderRecord[];
  onNewOrder: (order: OrderRecord) => void;
  externalNotification?: { orderId: number; statusText: string; timestamp: number } | null;
}

export const TelegramSimulator: React.FC<TelegramSimulatorProps> = ({
  categories,
  products,
  orders,
  onNewOrder,
  externalNotification
}) => {
  const [lang, setLang] = useState<Language>('uz');
  const [userPhone, setUserPhone] = useState<string>('+998 90 123 45 67');
  const [userName] = useState<string>('Azizbek Rahimov');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [productQty, setProductQty] = useState<number>(1);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'delivery_type' | 'location' | 'payment' | 'confirm'>('idle');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'click' | 'payme'>('cash');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Chilonzor 9-mavze, 14-uy');
  const [activeTab, setActiveTab] = useState<'chat' | 'cart_view'>('chat');

  // Messages in simulation
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: "Assalomu alaykum! Xush kelibsiz! Osh & Kabob Express yetkazib berish xizmati rasmiy boti. Iltimos, xizmat ko'rsatish tilini tanlang:",
      time: '12:00',
      replyMarkup: {
        type: 'inline',
        buttons: [
          [
            { text: "🇺🇿 O'zbekcha", action: 'lang:uz' },
            { text: '🇷🇺 Русский', action: 'lang:ru' },
            { text: '🇬🇧 English', action: 'lang:en' }
          ]
        ]
      }
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle external notifications from Admin status changes
  useEffect(() => {
    if (externalNotification) {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const statusTitle = lang === 'ru' 
        ? 'Статус вашего заказа обновлен!' 
        : lang === 'en' 
        ? 'Order status updated!' 
        : "Buyurtmangiz holati yangilandi!";

      setMessages(prev => [
        ...prev,
        {
          id: `notif-${Date.now()}`,
          sender: 'bot',
          text: `🔔 <b>${statusTitle}</b>\n\nBuyurtma: <b>#ORDER_${externalNotification.orderId}</b>\nYangi holat: <b>${externalNotification.statusText}</b>`,
          time: timeStr
        }
      ]);
    }
  }, [externalNotification, lang]);

  const addBotMessage = (text: string, replyMarkup?: ChatMessage['replyMarkup']) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text,
        time: timeStr,
        replyMarkup
      }
    ]);
  };

  const addUserMessage = (text: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'user',
        text,
        time: timeStr
      }
    ]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  // Handle inline clicks
  const handleAction = (action: string) => {
    if (action.startsWith('lang:')) {
      const selected = action.split(':')[1] as Language;
      setLang(selected);
      const label = selected === 'uz' ? "O'zbek tili tanlandi! 🇺🇿" : selected === 'ru' ? "Выбран русский язык! 🇷🇺" : "English selected! 🇬🇧";
      addUserMessage(label);
      setTimeout(() => {
        addBotMessage(
          `✅ ${label}\n\nQuyidagi menyu bo'limlaridan birini tanlang yoki savatingizni ko'ring:`,
          {
            type: 'inline',
            buttons: [
              [{ text: '🍕 Menyu', action: 'open_menu' }, { text: `🛒 Savat (${cart.length})`, action: 'open_cart' }],
              [{ text: '📦 Buyurtmalarim', action: 'my_orders' }, { text: '📞 Aloqa', action: 'contact_info' }]
            ]
          }
        );
      }, 300);
    } else if (action === 'open_menu') {
      addUserMessage('🍕 Menyu');
      setTimeout(() => {
        addBotMessage(
          "Kerakli kategoriyani tanlang:",
          {
            type: 'inline',
            buttons: categories.map(c => [
              { text: lang === 'ru' ? c.name_ru : lang === 'en' ? c.name_en : c.name_uz, action: `cat:${c.id}` }
            ])
          }
        );
      }, 300);
    } else if (action.startsWith('cat:')) {
      const catId = parseInt(action.split(':')[1]);
      setActiveCategoryId(catId);
      const cat = categories.find(c => c.id === catId);
      const catName = cat ? (lang === 'ru' ? cat.name_ru : lang === 'en' ? cat.name_en : cat.name_uz) : 'Kategoriya';
      addUserMessage(catName);
      
      const prods = products.filter(p => p.category_id === catId);
      setTimeout(() => {
        addBotMessage(
          `📂 <b>${catName}</b>\n\nTaom yoki ichimlikni tanlang:`,
          {
            type: 'inline',
            buttons: [
              ...prods.map(p => [
                {
                  text: `${p.name_uz} — ${p.price.toLocaleString()} so'm`,
                  action: `prod:${p.id}`
                }
              ]),
              [{ text: '⬅️ Kategoriyalar', action: 'open_menu' }, { text: `🛒 Savat (${cart.length})`, action: 'open_cart' }]
            ]
          }
        );
      }, 300);
    } else if (action.startsWith('prod:')) {
      const prodId = parseInt(action.split(':')[1]);
      const prod = products.find(p => p.id === prodId);
      if (prod) {
        setActiveProductId(prod.id);
        setProductQty(1);
        addUserMessage(prod.name_uz);
        setTimeout(() => {
          addBotMessage(
            `🍴 <b>${prod.name_uz}</b>\n\n📝 ${prod.description_uz}\n\n💰 Narxi: <b>${prod.price.toLocaleString()} so'm</b>`,
            {
              type: 'inline',
              buttons: [
                [
                  { text: '➖', action: `qty:dec:${prod.id}` },
                  { text: '1 dona', action: 'noop' },
                  { text: '➕', action: `qty:inc:${prod.id}` }
                ],
                [{ text: `🛒 Savatga qo'shish (1 ta)`, action: `add_cart:${prod.id}:1` }],
                [{ text: '⬅️ Orqaga', action: `cat:${prod.category_id}` }]
              ]
            }
          );
        }, 300);
      }
    } else if (action.startsWith('qty:inc:') || action.startsWith('qty:dec:')) {
      const parts = action.split(':');
      const isInc = parts[1] === 'inc';
      const prodId = parseInt(parts[2]);
      const prod = products.find(p => p.id === prodId);
      if (prod) {
        const newQty = isInc ? productQty + 1 : Math.max(1, productQty - 1);
        setProductQty(newQty);
        addBotMessage(
          `🍴 <b>${prod.name_uz}</b>\n\n💰 Narxi: <b>${prod.price.toLocaleString()} so'm</b>\n💵 Jami: <b>${(prod.price * newQty).toLocaleString()} so'm</b>`,
          {
            type: 'inline',
            buttons: [
              [
                { text: '➖', action: `qty:dec:${prod.id}` },
                { text: `${newQty} dona`, action: 'noop' },
                { text: '➕', action: `qty:inc:${prod.id}` }
              ],
              [{ text: `🛒 Savatga qo'shish (${newQty} ta)`, action: `add_cart:${prod.id}:${newQty}` }],
              [{ text: '⬅️ Orqaga', action: `cat:${prod.category_id}` }]
            ]
          }
        );
      }
    } else if (action.startsWith('add_cart:')) {
      const parts = action.split(':');
      const prodId = parseInt(parts[1]);
      const qty = parseInt(parts[2]);
      const prod = products.find(p => p.id === prodId);
      if (prod) {
        setCart(prev => {
          const existing = prev.find(item => item.product_id === prodId);
          if (existing) {
            return prev.map(item => item.product_id === prodId ? { ...item, quantity: item.quantity + qty } : item);
          }
          return [...prev, { product_id: prod.id, name: prod.name_uz, unit_price: prod.price, quantity: qty }];
        });
        addUserMessage(`🛒 ${prod.name_uz} (${qty} dona) savatga qo'shildi`);
        setTimeout(() => {
          addBotMessage(
            `✅ <b>${prod.name_uz}</b> savatga qo'shildi!\n\nBuyurtmani rasmiylashtirishga o'tamizmi yoki yana taom tanlaysizmi?`,
            {
              type: 'inline',
              buttons: [
                [{ text: '✅ Buyurtmani rasmiylashtirish', action: 'checkout_start' }],
                [{ text: '🍕 Yana taom tanlash', action: 'open_menu' }, { text: '🛒 Savatni ko\'rish', action: 'open_cart' }]
              ]
            }
          );
        }, 300);
      }
    } else if (action === 'open_cart') {
      addUserMessage('🛒 Savat');
      setTimeout(() => {
        if (cart.length === 0) {
          addBotMessage("Savatingiz hozircha bo'sh. Marhamat, menyudan taom tanlang! 🍕", {
            type: 'inline',
            buttons: [[{ text: '🍕 Menyu', action: 'open_menu' }]]
          });
        } else {
          const itemsList = cart.map(i => `• ${i.name} x ${i.quantity} = ${(i.unit_price * i.quantity).toLocaleString()} so'm`).join('\n');
          addBotMessage(
            `🛒 <b>Sizning savatingiz:</b>\n\n${itemsList}\n\n💵 Jami: <b>${cartTotal.toLocaleString()} so'm</b>`,
            {
              type: 'inline',
              buttons: [
                [{ text: '✅ Buyurtma berish', action: 'checkout_start' }],
                [{ text: '🗑 Savatni tozalash', action: 'clear_cart' }, { text: '🍕 Menyu', action: 'open_menu' }]
              ]
            }
          );
        }
      }, 300);
    } else if (action === 'clear_cart') {
      setCart([]);
      addUserMessage('🗑 Savatni tozalash');
      setTimeout(() => {
        addBotMessage("Savatingiz tozalandi.", {
          type: 'inline',
          buttons: [[{ text: '🍕 Menyu', action: 'open_menu' }]]
        });
      }, 300);
    } else if (action === 'checkout_start') {
      if (cart.length === 0) {
        addBotMessage("Savatingiz bo'sh. Iltimos oldin taom qo'shing.");
        return;
      }
      setCheckoutStep('delivery_type');
      addUserMessage('✅ Rasmiylashtirish');
      setTimeout(() => {
        addBotMessage(
          "Buyurtmani qabul qilish usulini tanlang:",
          {
            type: 'inline',
            buttons: [
              [
                { text: '🛵 Yetkazib berish', action: 'choose_delivery' },
                { text: '🏃 Olib ketish (Samovivoz)', action: 'choose_pickup' }
              ],
              [{ text: '❌ Bekor qilish', action: 'cancel_order' }]
            ]
          }
        );
      }, 300);
    } else if (action === 'choose_delivery') {
      setDeliveryType('delivery');
      setCheckoutStep('location');
      addUserMessage('🛵 Yetkazib berish');
      setTimeout(() => {
        addBotMessage(
          "📍 Yetkazib berish manzilini yuboring. Quyidagi tezkor tugmani bosing yoki manzilni tasdiqlang:",
          {
            type: 'inline',
            buttons: [
              [{ text: '📍 Joriy GPS manzilimni yuborish (Toshkent)', action: 'send_gps' }],
              [{ text: `🏠 ${deliveryAddress}`, action: 'confirm_address' }]
            ]
          }
        );
      }, 300);
    } else if (action === 'choose_pickup') {
      setDeliveryType('pickup');
      setCheckoutStep('payment');
      addUserMessage('🏃 Olib ketish (Samovivoz)');
      setTimeout(() => {
        addBotMessage(
          "📍 <b>Restoran manzili:</b> Toshkent sh., Chilonzor 9-mavze, 21-uy\n⏰ Ish vaqti: 10:00 - 23:00\n\nTo'lov turini tanlang:",
          {
            type: 'inline',
            buttons: [
              [
                { text: '💵 Naqd pul', action: 'pay_cash' },
                { text: '🔵 Click', action: 'pay_click' },
                { text: '🟢 Payme', action: 'pay_payme' }
              ]
            ]
          }
        );
      }, 300);
    } else if (action === 'send_gps' || action === 'confirm_address') {
      addUserMessage('📍 Manzil yuborildi: Chilonzor 9-mavze (GPS: 41.2785, 69.2154)');
      setCheckoutStep('payment');
      setTimeout(() => {
        addBotMessage(
          "To'lov turini tanlang:",
          {
            type: 'inline',
            buttons: [
              [
                { text: '💵 Naqd pul', action: 'pay_cash' },
                { text: '🔵 Click', action: 'pay_click' },
                { text: '🟢 Payme', action: 'pay_payme' }
              ]
            ]
          }
        );
      }, 300);
    } else if (action === 'pay_cash' || action === 'pay_click' || action === 'pay_payme') {
      const method = action === 'pay_cash' ? 'cash' : action === 'pay_click' ? 'click' : 'payme';
      setPaymentMethod(method);
      setCheckoutStep('confirm');
      const methodLabel = method === 'cash' ? '💵 Naqd pul' : method === 'click' ? '🔵 Click' : '🟢 Payme';
      addUserMessage(`To'lov: ${methodLabel}`);

      setTimeout(() => {
        const itemsList = cart.map(i => `• ${i.name} x ${i.quantity} = ${(i.unit_price * i.quantity).toLocaleString()} so'm`).join('\n');
        addBotMessage(
          `📋 <b>BUYURTMANI TASDIQLASH:</b>\n\n` +
          `🛵 Usul: <b>${deliveryType === 'delivery' ? 'Yetkazib berish' : 'Olib ketish'}</b>\n` +
          `📍 Manzil: ${deliveryType === 'delivery' ? deliveryAddress : 'Restorandan olib ketish'}\n` +
          `💳 To'lov: <b>${methodLabel}</b>\n\n` +
          `<b>Tarkibi:</b>\n${itemsList}\n\n` +
          `💰 JAMI: <b>${cartTotal.toLocaleString()} so'm</b>\n\n` +
          `Buyurtmani oshxonaga yuborasizmi?`,
          {
            type: 'inline',
            buttons: [
              [{ text: '🚀 Buyurtmani tasdiqlash', action: 'final_confirm' }],
              [{ text: '❌ Bekor qilish', action: 'cancel_order' }]
            ]
          }
        );
      }, 300);
    } else if (action === 'final_confirm') {
      addUserMessage('🚀 Buyurtmani tasdiqlash');
      const newOrderId = Math.floor(1000 + Math.random() * 9000);
      
      const newOrder: OrderRecord = {
        id: newOrderId,
        user_id: 8714951833,
        customer_name: userName,
        customer_username: 'aziz_r99',
        customer_phone: userPhone,
        delivery_type: deliveryType,
        address_text: deliveryType === 'delivery' ? deliveryAddress : 'Restoran (Samovivoz)',
        latitude: 41.2785,
        longitude: 69.2154,
        payment_method: paymentMethod,
        total_amount: cartTotal,
        status: 'pending',
        created_at: 'Hozirgina',
        items: [...cart]
      };

      onNewOrder(newOrder);
      setCart([]);
      setCheckoutStep('idle');

      setTimeout(() => {
        addBotMessage(
          `🎉 <b>Buyurtmangiz #ORDER_${newOrderId} qabul qilindi!</b>\n\n` +
          `Xodimlarimiz buyurtmani ko'rib chiqmoqda. Oshxona holati o'zgarganda sizga xabar beramiz.`,
          {
            type: 'inline',
            buttons: [
              [{ text: '📦 Buyurtmalarimni ko\'rish', action: 'my_orders' }],
              [{ text: '🍕 Yangi buyurtma', action: 'open_menu' }]
            ]
          }
        );
      }, 500);
    } else if (action === 'cancel_order') {
      setCheckoutStep('idle');
      addUserMessage('❌ Bekor qilish');
      setTimeout(() => {
        addBotMessage("Buyurtma bekor qilindi.", {
          type: 'inline',
          buttons: [[{ text: '🍕 Menyu', action: 'open_menu' }]]
        });
      }, 300);
    } else if (action === 'my_orders') {
      addUserMessage('📦 Buyurtmalarim');
      setTimeout(() => {
        const orderTexts = orders.slice(0, 3).map(o => (
          `🆔 <b>#ORDER_${o.id}</b>\n💰 Summa: ${o.total_amount.toLocaleString()} so'm\n📌 Holat: <b>${o.status.toUpperCase()}</b>`
        )).join('\n\n');
        addBotMessage(`📦 <b>Oxirgi buyurtmalaringiz:</b>\n\n${orderTexts || 'Buyurtmalar mavjud emas.'}`, {
          type: 'inline',
          buttons: [[{ text: '🍕 Menyu', action: 'open_menu' }]]
        });
      }, 300);
    } else if (action === 'contact_info') {
      addUserMessage('📞 Aloqa');
      setTimeout(() => {
        addBotMessage(
          `📞 <b>Osh & Kabob Express</b>\n\nTelefon: +998 71 200 00 00\nOperator: @restaurant_support\nIsh vaqti: 10:00 - 23:00\nManzil: Toshkent sh., Chilonzor tumani.`,
          {
            type: 'inline',
            buttons: [[{ text: '🍕 Menyu', action: 'open_menu' }]]
          }
        );
      }, 300);
    }
  };

  const resetChat = () => {
    setCart([]);
    setCheckoutStep('idle');
    setMessages([
      {
        id: 'm1',
        sender: 'bot',
        text: "Assalomu alaykum! Xush kelibsiz! Osh & Kabob Express yetkazib berish xizmati rasmiy boti. Iltimos, xizmat ko'rsatish tilini tanlang:",
        time: '12:00',
        replyMarkup: {
          type: 'inline',
          buttons: [
            [
              { text: "🇺🇿 O'zbekcha", action: 'lang:uz' },
              { text: '🇷🇺 Русский', action: 'lang:ru' },
              { text: '🇬🇧 English', action: 'lang:en' }
            ]
          ]
        }
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Telegram Header */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700/80">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-base shadow-inner">
              🍲
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-800" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white text-sm">Osh & Kabob Express</span>
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-xs text-slate-400 font-normal">@osh_kabob_bot · bot</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language indicator */}
          <div className="flex items-center gap-1 bg-slate-700/60 p-1 rounded-md text-xs font-mono">
            <button
              onClick={() => handleAction('lang:uz')}
              className={`px-2 py-0.5 rounded ${lang === 'uz' ? 'bg-sky-500 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              UZ
            </button>
            <button
              onClick={() => handleAction('lang:ru')}
              className={`px-2 py-0.5 rounded ${lang === 'ru' ? 'bg-sky-500 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              RU
            </button>
            <button
              onClick={() => handleAction('lang:en')}
              className={`px-2 py-0.5 rounded ${lang === 'en' ? 'bg-sky-500 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              EN
            </button>
          </div>

          <button
            onClick={resetChat}
            title="Qayta boshlash (/start)"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
              }`}
            >
              <div
                className="whitespace-pre-line leading-relaxed"
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-slate-300/80 font-mono tabular-nums">{msg.time}</span>
              </div>
            </div>

            {/* Inline keyboard attachments */}
            {msg.replyMarkup?.type === 'inline' && (
              <div className="mt-1.5 flex flex-col gap-1 w-full max-w-[85%]">
                {msg.replyMarkup.buttons.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-flow-col auto-cols-fr gap-1">
                    {row.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => btn.action && handleAction(btn.action)}
                        className="bg-slate-800/95 hover:bg-slate-700 active:bg-slate-600 text-sky-400 hover:text-sky-300 font-medium text-xs py-2 px-2.5 rounded-lg border border-slate-700/80 transition-all text-center truncate shadow-sm cursor-pointer"
                      >
                        {btn.text}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Persistent Reply Keyboard Bar */}
      <div className="bg-slate-800/95 border-t border-slate-700/80 p-2.5">
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <button
            onClick={() => handleAction('open_menu')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            🍕 Menyu
          </button>
          <button
            onClick={() => handleAction('open_cart')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer relative"
          >
            🛒 Savat
            {cart.length > 0 && (
              <span className="ml-1 bg-amber-500 text-slate-900 font-bold px-1.5 py-0.2 rounded-full text-[10px] tabular-nums">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => handleAction('my_orders')}
            className="py-1.5 px-2 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer text-center truncate"
          >
            📦 Buyurtmalar
          </button>
          <button
            onClick={() => handleAction('contact_info')}
            className="py-1.5 px-2 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer text-center truncate"
          >
            📞 Aloqa
          </button>
          <button
            onClick={() => handleAction('lang:uz')}
            className="py-1.5 px-2 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer text-center truncate"
          >
            ⚙️ Sozlamalar
          </button>
        </div>
      </div>
    </div>
  );
};
