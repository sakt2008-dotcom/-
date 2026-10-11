import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Menu,
  Shield,
  UserCheck,
  ChevronDown,
  Sparkles,
  RefreshCw,
  LogOut,
  Users,
  Smartphone,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenRoleSwitcher: () => void;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenRoleSwitcher,
  onOpenInstallModal,
}) => {
  const {
    userRole,
    currentMarketer,
    guard,
    isAdmin,
    isGuard,
    unreadNotificationsCount,
    marketers,
    switchUser,
    activeTab,
    setActiveTab,
    currentUserAccount,
    canViewCalendar,
    canViewProperties,
    canViewDashboard,
    canViewMarketers,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-purple-100/80 shadow-xs">
      {/* Top Status / Brand Row */}
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Action: Notifications with badge & Mobile Install button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full text-purple-900 hover:bg-purple-50 transition-colors focus:outline-hidden"
            title="الإشعارات"
          >
            <Bell className="w-5 h-5 text-purple-800" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1 shadow-xs">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Mobile PWA Install / Download App Button */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-100 to-amber-100 hover:from-purple-200 hover:to-amber-200 text-purple-950 border border-purple-200/90 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              title="تحميل وتثبيت التطبيق على الجوال"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-700" />
              <span className="hidden xs:inline">تحميل التطبيق</span>
              <span className="xs:hidden">تحميل</span>
            </button>
          )}

          {/* Quick Tab shortcut for Marketers (يظهر فقط لمن لديه الصلاحية أو الإدارة) */}
          {canViewMarketers && (
            <button
              onClick={() => setActiveTab('marketers')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'marketers'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>المسوقون والعمولات (5%)</span>
            </button>
          )}
        </div>

        {/* Center: App Title with elegant AMASA luxury brand lockup */}
        <div
          onClick={() => setActiveTab('calendar')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1b0630] via-[#3b1263] to-[#120422] border border-purple-300/30 flex items-center justify-center text-white shadow-md relative overflow-hidden group-hover:scale-105 transition-all">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/25 to-transparent pointer-events-none" />
            <span className="font-serif font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-purple-200">
              A
            </span>
            <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute top-1 right-1" />
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-wider">
                الاستراحات
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-gradient-to-r from-purple-100 to-amber-100 text-purple-900 border border-purple-200/80 font-serif">
                AMASA
              </span>
            </div>
            <span className="text-[10px] text-purple-700 font-medium -mt-0.5 tracking-tight truncate max-w-[210px] sm:max-w-xs">
              الترف · كوخ البيلسان · رانس · الما · نايا
            </span>
          </div>
        </div>

        {/* Right Action: Current Role Badge / Switcher with Gmail */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRoleSwitcher}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-purple-200 bg-purple-50/70 hover:bg-purple-100 transition-all text-xs font-semibold text-purple-950"
            title="تبديل الصلاحية أو تسجيل الدخول عبر Gmail"
          >
            {isAdmin ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <Shield className="w-3.5 h-3.5 text-purple-700" />
                <span className="hidden xs:inline">الإدارة (AMASA)</span>
                <span className="xs:hidden">الإدارة</span>
              </>
            ) : isGuard ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-amber-800 font-bold">الحارس</span>
                <span className="truncate max-w-[80px] xs:max-w-[110px]">
                  {guard.name.split(' ')[0]}
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <UserCheck className="w-3.5 h-3.5 text-purple-700" />
                <span className="truncate max-w-[90px] xs:max-w-[120px]">
                  {currentMarketer?.name}
                </span>
                <span className="text-[10px] bg-purple-200/80 text-purple-900 px-1.5 py-0.2 rounded-full font-bold">
                  5%
                </span>
              </>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-purple-600" />
          </button>

          {/* Quick Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors md:hidden"
            title="القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown if menuOpen */}
      {menuOpen && (
        <div className="md:hidden border-t border-purple-100 bg-white px-4 py-3 space-y-2 animate-in fade-in slide-in-from-top duration-150">
          <div className="p-3 bg-purple-50/60 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">الحساب النشط:</p>
              <p className="text-sm font-bold text-purple-900">
                {isAdmin ? 'الإدارة العامة (كامل الصلاحيات)' : currentMarketer?.name}
              </p>
            </div>
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenRoleSwitcher();
              }}
              className="text-xs bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium"
            >
              تبديل
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {canViewCalendar && (
              <button
                onClick={() => {
                  setActiveTab('calendar');
                  setMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-xs font-semibold text-right transition-colors ${
                  activeTab === 'calendar' ? 'bg-purple-100 text-purple-900' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                📅 التقويم التفاعلي
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab('bookings');
                setMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-semibold text-right transition-colors ${
                activeTab === 'bookings' ? 'bg-purple-100 text-purple-900' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              📋 الحجوزات
            </button>
            {canViewMarketers && (
              <button
                onClick={() => {
                  setActiveTab('marketers');
                  setMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-xs font-semibold text-right transition-colors ${
                  activeTab === 'marketers' ? 'bg-purple-100 text-purple-900' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                🤝 المسوقون والعمولات
              </button>
            )}
            {canViewProperties && (
              <button
                onClick={() => {
                  setActiveTab('properties');
                  setMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-xs font-semibold text-right transition-colors ${
                  activeTab === 'properties' ? 'bg-purple-100 text-purple-900' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                🏡 العقار والاستراحات
              </button>
            )}
            {canViewDashboard && (
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-xs font-semibold text-right transition-colors ${
                  activeTab === 'dashboard' ? 'bg-purple-100 text-purple-900' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                📊 لوحة التحكم
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab('more');
                setMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-semibold text-right transition-colors ${
                activeTab === 'more' ? 'bg-purple-100 text-purple-900' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              ⚙️ المزيد والإعدادات
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
