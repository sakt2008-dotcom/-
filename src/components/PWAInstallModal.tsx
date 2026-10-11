import React from 'react';
import {
  Download,
  Smartphone,
  Share2,
  PlusSquare,
  CheckCircle,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  Bell,
  ArrowDown,
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => Promise<boolean>;
  isIOS: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isIOS,
  isInstallable,
  isInstalled,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-purple-100 flex flex-col max-h-[90dvh]">
        {/* Header with App Brand */}
        <div className="bg-gradient-to-l from-[#1f0b38] via-[#3d126b] to-[#1a0833] p-5 text-white flex items-center justify-between border-b border-purple-900/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-800 to-indigo-900 border border-purple-300/30 flex items-center justify-center text-white shadow-md relative overflow-hidden">
              <span className="font-serif font-black text-xl text-amber-300">A</span>
              <Sparkles className="w-3 h-3 text-amber-300 absolute top-1 right-1" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">تحميل تطبيق أماسا (AMASA)</h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-300/30 px-2 py-0.5 rounded-full font-bold">
                  تطبيق الجوال
                </span>
              </div>
              <p className="text-xs text-purple-200">
                تثبيت التطبيق على الشاشة الرئيسية للاستخدام السريع
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer relative z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1 touch-scroll">
          {/* Status banner if already installed */}
          {isInstalled ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block text-sm">التطبيق مثبت بالفعل على جهازك!</span>
                <span className="text-[11px] text-emerald-700">
                  يمكنك فتحه مباشرة من الشاشة الرئيسية لجوالك وتلقي الإشعارات الفورية.
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* App Advantages */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-purple-50/70 p-2.5 rounded-2xl border border-purple-100 flex flex-col items-center">
                  <Zap className="w-5 h-5 text-purple-700 mb-1" />
                  <span className="font-bold text-slate-800 text-[11px]">سرعة فائقة</span>
                  <span className="text-[10px] text-slate-500">فتح فوري بدون متصفح</span>
                </div>
                <div className="bg-purple-50/70 p-2.5 rounded-2xl border border-purple-100 flex flex-col items-center">
                  <Smartphone className="w-5 h-5 text-purple-700 mb-1" />
                  <span className="font-bold text-slate-800 text-[11px]">شاشة كاملة</span>
                  <span className="text-[10px] text-slate-500">تجربة تطبيق أصلي</span>
                </div>
                <div className="bg-purple-50/70 p-2.5 rounded-2xl border border-purple-100 flex flex-col items-center">
                  <Bell className="w-5 h-5 text-purple-700 mb-1" />
                  <span className="font-bold text-slate-800 text-[11px]">تنبيهات فورية</span>
                  <span className="text-[10px] text-slate-500">حجوزات وعمولات</span>
                </div>
              </div>

              {/* iOS Instructions */}
              {isIOS ? (
                <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-2xl p-4 border border-purple-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-800" />
                    <span className="font-bold text-slate-900 text-xs">
                      خطوات تثبيت التطبيق على آيفون (iOS Safari):
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-purple-100 shadow-2xs">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-900 font-bold flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-slate-800">اضغط على زر المشاركة أسفل الشاشة</span>
                        <div className="px-2 py-1 bg-slate-100 rounded-md flex items-center gap-1 font-bold text-[11px] text-purple-900">
                          <Share2 className="w-3.5 h-3.5" />
                          <span>مشاركة</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-purple-100 shadow-2xs">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-900 font-bold flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-slate-800">اختر «إضافة إلى الشاشة الرئيسية»</span>
                        <div className="px-2 py-1 bg-slate-100 rounded-md flex items-center gap-1 font-bold text-[11px] text-purple-900">
                          <PlusSquare className="w-3.5 h-3.5" />
                          <span>إضافة</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-purple-800 text-center font-medium pt-1">
                    ✨ سيظهر أيقونة تطبيق أماسا على شاشة جوالك الرئيسية كأي تطبيق رسمي!
                  </p>
                </div>
              ) : (
                /* Android / Chrome One-Click Install */
                <div className="space-y-3">
                  <button
                    onClick={onInstall}
                    className="btn-mauve-shiny w-full py-3.5 px-4 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تثبيت وتحميل التطبيق على الجوال الآن</span>
                  </button>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-slate-600 text-[11px] space-y-1">
                    <span className="font-bold text-slate-800 block">إذا لم يظهر التثبيت التلقائي:</span>
                    <p>
                      اضغط على قائمة المتصفح (⋮) في أعلى يسار الشاشة ثم اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Sizing & Storage info */}
          <div className="text-center text-[10px] text-slate-400 pt-1">
            <span>حجم التطبيق: خفيف جداً (~1.8 ميغابايت) · متوافق مع كافة أنظمة Android و iOS</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
