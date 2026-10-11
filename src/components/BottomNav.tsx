import React from 'react';
import {
  CalendarDays,
  CalendarCheck2,
  LayoutGrid,
  Building2,
  MoreHorizontal,
  Users,
} from 'lucide-react';
import { useApp, TabType } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    bookings,
    isAdmin,
    isGuard,
    todayArrivals,
    todayDepartures,
    canViewCalendar,
    canViewProperties,
    canViewDashboard,
    canViewMarketers,
  } = useApp();

  // Active bookings count
  const pendingOrConfirmedCount = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending_payment'
  ).length;

  const todayCount = todayArrivals.length + todayDepartures.length;

  const allNavItems: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    forGuard?: boolean;
    hidden?: boolean;
  }[] = [
    {
      id: 'calendar',
      label: 'التقويم والأسعار',
      icon: CalendarDays,
      forGuard: false,
      hidden: !canViewCalendar,
    },
    {
      id: 'bookings',
      label: isGuard ? 'قائمة النزلاء' : 'الحجوزات',
      icon: CalendarCheck2,
      badge: !isGuard && pendingOrConfirmedCount > 0 ? pendingOrConfirmedCount : undefined,
      forGuard: true,
    },
    {
      id: 'dashboard',
      label: isGuard ? 'دخول وخروج اليوم' : 'الرئيسية',
      icon: LayoutGrid,
      badge: isGuard && todayCount > 0 ? todayCount : undefined,
      forGuard: true,
      hidden: !canViewDashboard,
    },
    {
      id: 'properties',
      label: 'العقار',
      icon: Building2,
      forGuard: false,
      hidden: !canViewProperties,
    },
    {
      id: 'more',
      label: 'المزيد',
      icon: MoreHorizontal,
      forGuard: true,
    },
  ];

  const visibleNavItems = allNavItems
    .filter((item) => !item.hidden)
    .filter((item) => (isGuard ? item.forGuard : true));

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-purple-100/90 shadow-lg select-none"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
    >
      <div className="max-w-lg mx-auto px-1 sm:px-2 flex items-center justify-around h-16">
        {visibleNavItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all relative cursor-pointer active:scale-95 touch-manipulation min-h-[48px] ${
                isActive
                  ? 'text-purple-700 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`relative px-2.5 py-0.5 rounded-xl transition-all ${
                  isActive ? 'bg-[#ECE5F8] text-[#6B2896]' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'text-[#6B2896] stroke-[2.3]' : 'text-slate-400 stroke-[1.8]'
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 tracking-tight leading-none whitespace-nowrap ${
                  isActive ? 'text-[#6B2896] font-bold' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
