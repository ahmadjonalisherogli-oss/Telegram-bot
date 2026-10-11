import React, { useState } from 'react';
import { 
  Terminal, 
  Server, 
  Container, 
  Check, 
  Copy, 
  Cpu, 
  Database, 
  Globe, 
  ShieldCheck,
  Zap
} from 'lucide-react';

export const DeploymentGuide: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-800/90 px-5 py-3.5 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Ishga Tushirish & Serverga O'rnatish Qo'llanmasi</h2>
            <p className="text-xs text-slate-400">Docker, Systemd, PostgreSQL va Redis orqali production sozlamalari</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-4xl">
        {/* Method 1: Docker Compose */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold">
              1
            </div>
            <h3 className="text-sm font-semibold text-white">
              Tavsiya etilgan: Docker Compose orqali 1-bosqichda ishga tushirish
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Docker Compose PostgreSQL 15, Redis 7 va Aiogram 3 bot servisini bitta buyruq bilan to'liq izolyatsiyalangan holda ishga tushiradi.
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 relative">
            <button
              onClick={() => copySnippet('docker-cmd', `cp .env.example .env\ndocker compose up -d --build\ndocker compose logs -f telegram_bot`)}
              className="absolute top-3 right-3 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-[11px] transition-colors"
            >
              {copiedId === 'docker-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              Nusxalash
            </button>
            <div className="text-slate-500 mb-1"># 1. Konfiguratsiya faylini tayyorlash va konteynerlarni ko'tarish</div>
            <div className="text-sky-400">cp .env.example .env</div>
            <div className="text-slate-500 my-1"># 2. .env faylida BOT_TOKEN va ADMIN_IDS ni tekshirib, ishga tushirish:</div>
            <div className="text-emerald-400">docker compose up -d --build</div>
            <div className="text-slate-500 my-1"># 3. Jonli loglarni kuzatish:</div>
            <div className="text-slate-300">docker compose logs -f telegram_bot</div>
          </div>
        </section>

        {/* Method 2: Local Python */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
              2
            </div>
            <h3 className="text-sm font-semibold text-white">
              Lokal ishlab chiqish (Python 3.11+ virtualenv)
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ishlab chiquvchi kompyuterida tezkor testlar va o'zgartirishlar kiritish uchun:
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 relative">
            <button
              onClick={() => copySnippet('local-cmd', `python3 -m venv venv\nsource venv/bin/activate\npip install -r requirements.txt\npython -m bot.main`)}
              className="absolute top-3 right-3 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-[11px] transition-colors"
            >
              {copiedId === 'local-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              Nusxalash
            </button>
            <div className="text-slate-500 mb-1"># Virtual muhit yaratish va kutubxonalarni o'rnatish</div>
            <div className="text-sky-400">python3 -m venv venv</div>
            <div className="text-sky-400">source venv/bin/activate  # Windows: venv\\Scripts\\activate</div>
            <div className="text-sky-400">pip install -r requirements.txt</div>
            <div className="text-slate-500 my-1"># Botni ishga tushirish (avtomatik ravishda jadval va menyu seedlarini yuklaydi)</div>
            <div className="text-emerald-400">python -m bot.main</div>
          </div>
        </section>

        {/* Method 3: Systemd Daemon on VPS */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h3 className="text-sm font-semibold text-white">
              Linux VPS (Ubuntu 22.04 / 24.04) da Systemd xizmati sifatida sozlash
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Server qayta yuklanganda (reboot) avtomatik qayta ishga tushish va to'xtovsiz ishlash (24/7 uptime) uchun:
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 relative">
            <button
              onClick={() => copySnippet('systemd-cmd', `sudo cp bot.service /etc/systemd/system/\nsudo systemctl daemon-reload\nsudo systemctl enable bot\nsudo systemctl start bot\nsudo systemctl status bot`)}
              className="absolute top-3 right-3 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-[11px] transition-colors"
            >
              {copiedId === 'systemd-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              Nusxalash
            </button>
            <div className="text-slate-500 mb-1"># Systemd servisini ro'yxatga olish</div>
            <div className="text-sky-400">sudo cp bot.service /etc/systemd/system/</div>
            <div className="text-sky-400">sudo systemctl daemon-reload</div>
            <div className="text-sky-400">sudo systemctl enable bot</div>
            <div className="text-emerald-400">sudo systemctl start bot</div>
            <div className="text-slate-500 my-1"># Holatini tekshirish</div>
            <div className="text-slate-300">sudo systemctl status bot</div>
          </div>
        </section>
      </div>
    </div>
  );
};
