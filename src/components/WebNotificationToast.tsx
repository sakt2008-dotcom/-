import React, { useEffect, useState } from 'react';
import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  DollarSign,
  Percent,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WebNotificationToast: React.FC = () => {
  const {
    activeToast,
    dismissToast,
    isSoundEnabled,
    toggleSound,
    setActiveTab,
  } = useApp();

  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!activeToast) {
      setProgress(100);
      return;
    }

    const duration = 6500; // 6.5s
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(interval);
        dismissToast();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  let Icon = Bell;
  let bgGradient = 'from-purple-900 to-indigo-900';
  let badgeColor = 'bg-purple-700 text-purple-100';

  if (activeToast.type === 'deposit_confirmed') {
    Icon = CheckCircle2;
    bgGradient = 'from-emerald-800 to-teal-900';
    badgeColor = 'bg-emerald-600 text-emerald-100';
  } else if (activeToast.type === 'deposit_request') {
    Icon = DollarSign;
    bgGradient = 'from-amber-700 to-yellow-900';
    badgeColor = 'bg-amber-600 text-amber-100';
  } else if (activeToast.type === 'booking') {
    Icon = CalendarCheck;
    bgGradient = 'from-purple-900 to-purple-950';
    badgeColor = 'bg-purple-700 text-purple-100';
  } else if (activeToast.type === 'commission') {
    Icon = Percent;
    bgGradient = 'from-emerald-900 to-slate-900';
    badgeColor = 'bg-emerald-600 text-white';
  }

  const handleToastClick = () => {
    if (activeToast.type === 'commission') {
      setActiveTab('marketers');
    } else {
      setActiveTab('bookings');
    }
    dismissToast();
  };

  return (
    <div className="fixed top-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 pointer-events-auto animate-in slide-in-from-top-4 duration-300">
      <div
        className={`bg-gradient-to-r ${bgGradient} text-white p-4 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-md relative overflow-hidden`}
      >
        {/* Progress Countdown Bar */}
        <div
          className="absolute bottom-0 right-0 left-0 h-1 bg-white/30"
          style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
        />

        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${badgeColor}`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={handleToastClick}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] bg-white/20 text-white px-2 py-0.2 rounded-full font-bold">
                تنبيه فوري للموظفين والمسوقين
              </span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-1">
              {activeToast.title}
            </h4>
            <p className="text-[11px] text-white/90 mt-0.5 leading-relaxed line-clamp-2">
              {activeToast.body}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-1">
            <button
              onClick={toggleSound}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              title={isSoundEnabled ? 'كتم نغمة التنبيه' : 'تشغيل نغمة التنبيه'}
            >
              {isSoundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-amber-300" />
              )}
            </button>

            <button
              onClick={dismissToast}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
