import React, { useState } from 'react';
import { 
  Smartphone, 
  ChefHat, 
  BarChart3, 
  Code2, 
  Rocket, 
  Layers, 
  Play, 
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  ShoppingBag
} from 'lucide-react';
import { TelegramSimulator } from './components/TelegramSimulator';
import { KitchenDashboard } from './components/KitchenDashboard';
import { AnalyticsView } from './components/AnalyticsView';
import { CodeExplorer } from './components/CodeExplorer';
import { DeploymentGuide } from './components/DeploymentGuide';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS } from './data/mockData';
import { OrderRecord, OrderStatus } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'split' | 'kitchen' | 'analytics' | 'code' | 'deploy'>('split');
  const [categories] = useState(INITIAL_CATEGORIES);
  const [products] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  
  // Real-time notification dispatched from Kitchen to Telegram simulator
  const [externalNotification, setExternalNotification] = useState<{
    orderId: number;
    statusText: string;
    timestamp: number;
  } | null>(null);

  // New order created in Telegram bot simulator
  const handleNewOrder = (newOrder: OrderRecord) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  // Status update performed by kitchen admin
  const handleUpdateStatus = (orderId: number, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    const statusLabels: Record<OrderStatus, string> = {
      pending: "⚪ Kutilmoqda",
      accepted: "🟡 Qabul qilindi (Accepted)",
      preparing: "🟠 Oshxonada tayyorlanmoqda (Preparing)",
      on_way: "🔵 Kuryer yo'lga chiqdi (On the Way)",
      delivered: "🟢 Yetkazib berildi! Yoqimli ishtaha!",
      cancelled: "🔴 Bekor qilindi"
    };

    setExternalNotification({
      orderId,
      statusText: statusLabels[newStatus],
      timestamp: Date.now()
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract: Brand, 4-5 Navigation Links, 1 Primary Action */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/95 px-6 flex items-center justify-between gap-8 shrink-0 z-20">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm">
            🇺🇿
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white">
              Osh & Kabob Express
            </span>
            <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
              Aiogram 3.x Telegram Delivery Bot
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 md:gap-2 text-xs font-medium text-slate-300 overflow-x-auto">
          <button
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'split' ? 'bg-sky-600 text-white font-semibold shadow-sm' : 'hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Jonli Simulyator (Bot + Oshxona)</span>
          </button>

          <button
            onClick={() => setActiveTab('kitchen')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'kitchen' ? 'bg-sky-600 text-white font-semibold shadow-sm' : 'hover:text-white hover:bg-slate-800'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Oshxona & Kuryer</span>
            <span className="bg-amber-500/20 text-amber-300 font-mono text-[10px] px-1.5 py-0.2 rounded-full">
              {orders.filter(o => ['pending', 'accepted', 'preparing', 'on_way'].includes(o.status)).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'bg-sky-600 text-white font-semibold shadow-sm' : 'hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Daromad Analitikasi</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'code' ? 'bg-sky-600 text-white font-semibold shadow-sm' : 'hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Python Kod Boshqaruvi</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'deploy' ? 'bg-sky-600 text-white font-semibold shadow-sm' : 'hover:text-white hover:bg-slate-800'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Deploy (Docker/Systemd)</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            PostgreSQL & Redis Online
          </div>
          <button
            onClick={() => setActiveTab('deploy')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5" />
            Ishga tushirish
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden max-w-[1720px] w-full mx-auto">
        {activeTab === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6.5rem)]">
            {/* Left: Mobile Telegram Customer Bot Simulation (5 cols) */}
            <div className="lg:col-span-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  <span>Mijoz interfeysi (Telegram Bot)</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  O'zbek / Rus / Ingliz tillari
                </span>
              </div>
              <div className="flex-1 h-full min-h-0">
                <TelegramSimulator
                  categories={categories}
                  products={products}
                  orders={orders}
                  onNewOrder={handleNewOrder}
                  externalNotification={externalNotification}
                />
              </div>
            </div>

            {/* Right: Real-time Kitchen Channel & Order Control (7 cols) */}
            <div className="lg:col-span-7 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <ChefHat className="w-4 h-4 text-amber-400" />
                  <span>Oshxona & Kuryer Nazorat Kanali (Real-time Alert)</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Holat o'zgarganda mijozga avtomatik xabar boradi
                </span>
              </div>
              <div className="flex-1 h-full min-h-0">
                <KitchenDashboard
                  orders={orders}
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kitchen' && (
          <div className="h-[calc(100vh-6.5rem)]">
            <KitchenDashboard
              orders={orders}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="h-[calc(100vh-6.5rem)]">
            <AnalyticsView orders={orders} />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="h-[calc(100vh-6.5rem)]">
            <CodeExplorer />
          </div>
        )}

        {activeTab === 'deploy' && (
          <div className="h-[calc(100vh-6.5rem)]">
            <DeploymentGuide />
          </div>
        )}
      </main>
    </div>
  );
}
