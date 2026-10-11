import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  PieChart, 
  BarChart2, 
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { OrderRecord } from '../types';

interface AnalyticsViewProps {
  orders: OrderRecord[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ orders }) => {
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.total_amount : sum, 0);
  const totalCount = orders.length;
  const completedCount = orders.filter(o => o.status === 'delivered').length;
  const avgCheck = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

  // Breakdown by payment
  const clickTotal = orders.filter(o => o.payment_method === 'click').reduce((sum, o) => sum + o.total_amount, 0);
  const paymeTotal = orders.filter(o => o.payment_method === 'payme').reduce((sum, o) => sum + o.total_amount, 0);
  const cashTotal = orders.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + o.total_amount, 0);

  // Delivery vs Pickup
  const deliveryOrders = orders.filter(o => o.delivery_type === 'delivery').length;
  const pickupOrders = orders.filter(o => o.delivery_type === 'pickup').length;
  const deliveryPct = totalCount > 0 ? Math.round((deliveryOrders / totalCount) * 100) : 0;

  // Dish popularity
  const itemCounts: Record<string, { qty: number; revenue: number }> = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { qty: 0, revenue: 0 };
      }
      itemCounts[item.name].qty += item.quantity;
      itemCounts[item.name].revenue += item.unit_price * item.quantity;
    });
  });

  const popularDishes = Object.entries(itemCounts)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 5);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-800/90 px-5 py-3.5 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Restoran Daromad & Savdo Analitikasi</h2>
            <p className="text-xs text-slate-400">Kunlik, oylik va to'lov turlari bo'yicha hisobot</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-medium mb-1">Bugungi tushum</div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums">
              {totalRevenue.toLocaleString()} <span className="text-xs text-slate-400 font-normal">so'm</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Real vaqt ma'lumotlari</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-medium mb-1">Jami buyurtmalar</div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums">
              {totalCount} <span className="text-xs text-slate-400 font-normal">ta</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              {completedCount} tasi yetkazib berildi
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-medium mb-1">O'rtacha chek</div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums">
              {avgCheck.toLocaleString()} <span className="text-xs text-slate-400 font-normal">so'm</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Buyurtma boshiga hisob
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-medium mb-1">Yetkazib berish ulushi</div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums">
              {deliveryPct}%
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              {pickupOrders} ta samovivoz
            </div>
          </div>
        </div>

        {/* Payment and Delivery Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-400" />
              To'lov tizimlari taqsimoti
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-sky-400 font-medium">Click (Online)</span>
                  <span className="font-mono text-slate-300">{clickTotal.toLocaleString()} so'm</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${totalRevenue > 0 ? (clickTotal / totalRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400 font-medium">Payme (Online)</span>
                  <span className="font-mono text-slate-300">{paymeTotal.toLocaleString()} so'm</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${totalRevenue > 0 ? (paymeTotal / totalRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-400 font-medium">Naqd pul (Kuryerga)</span>
                  <span className="font-mono text-slate-300">{cashTotal.toLocaleString()} so'm</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${totalRevenue > 0 ? (cashTotal / totalRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Dishes */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Eng ko'p sotilgan taomlar
            </h3>

            <div className="space-y-2.5">
              {popularDishes.map(([dishName, stat], idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-700/40 last:border-none">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 w-4">{idx + 1}.</span>
                    <span className="text-slate-200 font-medium">{dishName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-700 px-2 py-0.5 rounded font-mono text-[11px] text-amber-300">
                      {stat.qty} ta
                    </span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {stat.revenue.toLocaleString()} so'm
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
