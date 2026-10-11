import React, { useState } from 'react';
import { 
  Bell, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  ChefHat, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { OrderRecord, OrderStatus } from '../types';

interface KitchenDashboardProps {
  orders: OrderRecord[];
  onUpdateStatus: (orderId: number, newStatus: OrderStatus) => void;
}

export const KitchenDashboard: React.FC<KitchenDashboardProps> = ({
  orders,
  onUpdateStatus
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredOrders = orders.filter(o => {
    if (filter === 'active') return ['pending', 'accepted', 'preparing', 'on_way'].includes(o.status);
    if (filter === 'completed') return ['delivered', 'cancelled'].includes(o.status);
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="text-xs font-medium text-slate-300 bg-slate-700/60 px-2 py-0.5 rounded">⚪ Kutilmoqda</span>;
      case 'accepted':
        return <span className="text-xs font-medium text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">🟡 Qabul qilindi</span>;
      case 'preparing':
        return <span className="text-xs font-medium text-orange-300 bg-orange-950/60 border border-orange-800/60 px-2 py-0.5 rounded">🟠 Tayyorlanmoqda</span>;
      case 'on_way':
        return <span className="text-xs font-medium text-sky-300 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded">🔵 Kuryer yo'lda</span>;
      case 'delivered':
        return <span className="text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">🟢 Yetkazildi</span>;
      case 'cancelled':
        return <span className="text-xs font-medium text-rose-300 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded">🔴 Bekor qilindi</span>;
    }
  };

  const getPaymentLabel = (method: string) => {
    if (method === 'click') return <span className="text-sky-400 font-medium">Click (Online)</span>;
    if (method === 'payme') return <span className="text-emerald-400 font-medium">Payme (Online)</span>;
    return <span className="text-slate-300">Naqd pul (Cash)</span>;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-800/90 px-5 py-3.5 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Oshxona & Admin Buyurtmalar Markazi</h2>
            <p className="text-xs text-slate-400">Telegram Admin guruhi va kuryerlar uchun jonli nazorat</p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === 'all' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Barchasi ({orders.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === 'active' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Faol ({orders.filter(o => ['pending', 'accepted', 'preparing', 'on_way'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === 'completed' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Yakunlangan
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ChefHat className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-300">Ushbu toifada buyurtmalar mavjud emas</p>
            <p className="text-xs text-slate-500 mt-1">Telegram simulyatorida yangi taom buyurtma qilib ko'ring</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 transition-all hover:border-slate-600"
            >
              {/* Top row */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-700/60 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-white">#ORDER_{order.id}</span>
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-slate-400 font-mono tabular-nums">{order.created_at}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300">
                    <span className="font-medium text-white">{order.customer_name}</span>
                    {order.customer_username && (
                      <span className="text-sky-400">@{order.customer_username}</span>
                    )}
                    <span className="text-slate-400">·</span>
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="flex items-center gap-1 text-emerald-400 hover:underline font-mono"
                    >
                      <Phone className="w-3 h-3" />
                      {order.customer_phone}
                    </a>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-amber-400 font-mono tabular-nums">
                    {order.total_amount.toLocaleString()} so'm
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {getPaymentLabel(order.payment_method)}
                  </div>
                </div>
              </div>

              {/* Delivery info & Location */}
              <div className="bg-slate-900/60 rounded-lg p-2.5 mb-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="font-semibold text-white">
                    {order.delivery_type === 'delivery' ? '🛵 Yetkazib berish' : '🏃 Olib ketish'}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-300 truncate max-w-sm">{order.address_text || 'Manzil berilmagan'}</span>
                </div>

                {order.latitude && order.longitude && (
                  <a
                    href={`https://maps.google.com/?q=${order.latitude},${order.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium whitespace-nowrap ml-2"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Google Maps
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Items breakdown */}
              <div className="space-y-1 mb-4 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-300 py-0.5">
                    <span>
                      <span className="font-medium text-white">{item.quantity}x</span> {item.name}
                    </span>
                    <span className="font-mono tabular-nums text-slate-400">
                      {(item.unit_price * item.quantity).toLocaleString()} so'm
                    </span>
                  </div>
                ))}
              </div>

              {/* Kitchen Action Status Controller Buttons */}
              <div className="pt-2 border-t border-slate-700/60 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Holatni boshqarish:</span>

                <button
                  onClick={() => onUpdateStatus(order.id, 'accepted')}
                  disabled={order.status === 'accepted'}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    order.status === 'accepted'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-700 hover:bg-amber-600/30 text-slate-300 hover:text-amber-200'
                  }`}
                >
                  🟡 Qabul qilish
                </button>

                <button
                  onClick={() => onUpdateStatus(order.id, 'preparing')}
                  disabled={order.status === 'preparing'}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    order.status === 'preparing'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                      : 'bg-slate-700 hover:bg-orange-600/30 text-slate-300 hover:text-orange-200'
                  }`}
                >
                  🟠 Oshxonada
                </button>

                <button
                  onClick={() => onUpdateStatus(order.id, 'on_way')}
                  disabled={order.status === 'on_way'}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    order.status === 'on_way'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-slate-700 hover:bg-sky-600/30 text-slate-300 hover:text-sky-200'
                  }`}
                >
                  🔵 Kuryer yo'lda
                </button>

                <button
                  onClick={() => onUpdateStatus(order.id, 'delivered')}
                  disabled={order.status === 'delivered'}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    order.status === 'delivered'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-700 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-200'
                  }`}
                >
                  🟢 Yetkazildi
                </button>

                <button
                  onClick={() => onUpdateStatus(order.id, 'cancelled')}
                  disabled={order.status === 'cancelled'}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ml-auto ${
                    order.status === 'cancelled'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-700 hover:bg-rose-600/30 text-rose-300 hover:text-rose-200'
                  }`}
                >
                  🔴 Bekor qilish
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
