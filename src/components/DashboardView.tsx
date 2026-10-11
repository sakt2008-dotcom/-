import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Plus,
  Pin,
  Play,
  CheckCircle,
  MessageCircle,
  LogOut,
  ShieldCheck,
  Building2,
  Calendar,
  X,
  Phone,
  Eye,
  Check,
  ExternalLink,
  ChevronDown,
  Search,
  Copy,
  Clock,
  ArrowUpRight,
  User,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Booking } from '../types';

export const DashboardView: React.FC = () => {
  const {
    properties,
    bookings,
    filteredBookings,
    todayArrivals,
    todayDepartures,
    sendCheckoutReminder,
    markCheckedOut,
    returnInsuranceDeposit,
    setBookingModalOpen,
    setSelectedPropertyId,
    setActiveTab,
    updateBookingStatus,
    isAdmin,
  } = useApp();

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal for "تفاصيل" (Details)
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);
  const [detailModalTitle, setDetailModalTitle] = useState<string>('تفاصيل الحجز');

  // Active filter tab: 'all' | 'arrivals' | 'departures' | 'waitingDeposit'
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'arrivals' | 'departures' | 'waitingDeposit'>('all');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Show available section toggle
  const [showAllAvailable, setShowAllAvailable] = useState(true);

  // Checked-in local tracking for arrivals
  const [checkedInIds, setCheckedInIds] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Available properties today (those not booked today)
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const availablePropertiesToday = useMemo(() => {
    return properties.filter((prop) => {
      if (!prop.isPublished) return false;
      const isBooked = bookings.some(
        (b) =>
          b.propertyId === prop.id &&
          b.status !== 'cancelled' &&
          (todayDateStr >= b.checkInDate && todayDateStr < b.checkOutDate)
      );
      return !isBooked;
    });
  }, [properties, bookings, todayDateStr]);

  // Active bookings list (يعتمد على الصلاحيات: كافة الحجوزات للإدارة، وحجوزات المسوق فقط إذا لم يُمنح الصلاحية)
  const activeBookings = useMemo(() => {
    return filteredBookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'pending_payment' || b.status === 'waiting_deposit'
    );
  }, [filteredBookings]);

  // Actions
  const handleReminder = (bookingId: string) => {
    sendCheckoutReminder(bookingId);
    showToast('تم فتح واتساب مع نص تذكير الخروج للعميل بنجاح');
  };

  const handleCheckedOut = (bookingId: string) => {
    markCheckedOut(bookingId);
    showToast('تم تسجيل خروج العميل وإرسال إشعار للحارس والإدارة');
  };

  const handleReturnInsurance = (bookingId: string) => {
    returnInsuranceDeposit(bookingId);
    showToast('تم تسليم التأمين للعميل وإرسال إشعار للإدارة');
  };

  const handleToggleCheckIn = (bookingId: string) => {
    setCheckedInIds((prev) => {
      const isCurrentlyIn = !!prev[bookingId];
      const nextState = !isCurrentlyIn;
      showToast(nextState ? 'تم تأكيد دخول واستلام العميل للشاليه بنجاح' : 'تم إلغاء تأكيد الدخول');
      return { ...prev, [bookingId]: nextState };
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`تم نسخ ${label} بنجاح`);
    }
  };

  const getWhatsAppLink = (phone: string, customerName: string, propertyName: string, type: 'arrival' | 'departure') => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '966' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('966')) {
      cleanPhone = '966' + cleanPhone;
    }
    const message =
      type === 'arrival'
        ? `أهلاً بك أخي الكريم ${customerName}، يسعدنا استقبالكم اليوم في ${propertyName} الساعة 5 م. ونتمنى لكم إقامة ممتعة وسعيدة. لأي استفسار نحن بخدمتكم دائماً.`
        : `أهلاً بك أخي الكريم ${customerName}، نأمل أن تكونوا قضيتم أوقاتاً ممتعة في ${propertyName}. نود تذكيركم بموعد المغادرة الساعة 2 م، وسيتم تسليم مبلغ التأمين عند الخروج. شكراً لكم.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Filtered lists based on search
  const matchesSearch = (b: Booking) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      b.customerName.toLowerCase().includes(q) ||
      b.customerPhone.includes(q) ||
      b.propertyName.toLowerCase().includes(q) ||
      (b.marketerName && b.marketerName.toLowerCase().includes(q))
    );
  };

  const filteredArrivals = useMemo(() => todayArrivals.filter(matchesSearch), [todayArrivals, searchQuery]);
  const filteredDepartures = useMemo(() => todayDepartures.filter(matchesSearch), [todayDepartures, searchQuery]);
  const filteredActive = useMemo(() => activeBookings.filter(matchesSearch), [activeBookings, searchQuery]);
  const filteredWaitingDeposit = useMemo(() => bookings.filter(b => b.status === 'waiting_deposit').filter(matchesSearch), [bookings, searchQuery]);

  return (
    <div className="pb-28 max-w-5xl mx-auto px-3 sm:px-4 pt-3 space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white p-3 rounded-2xl text-xs font-bold shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white hover:opacity-80">
            ✕
          </button>
        </div>
      )}

      {/* 1. HERO BAR */}
      <div className="bg-transparent flex items-center justify-between pt-1 px-1">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-2">
          {/* + حجز جديد */}
          <button
            onClick={() => setBookingModalOpen(true)}
            className="btn-mauve-shiny font-bold py-2.5 px-4 rounded-2xl shadow-md flex items-center gap-1.5 transition-all text-xs sm:text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-purple-200" />
            <span className="leading-none">حجز جديد</span>
          </button>

          {/* Refresh Button 🔄 */}
          <button
            onClick={() => {
              showToast('تم تحديث البيانات الحية لكافة الاستراحات بنجاح');
            }}
            className="w-10 h-10 rounded-2xl bg-white border border-purple-100/90 shadow-xs flex items-center justify-center text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-all cursor-pointer"
            title="تحديث البيانات"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Right Title Block */}
        <div className="text-right">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center justify-end gap-2">
            <span>لوحة التحكم المركزية</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium -mt-0.5">
            متابعة فورية وسريعة لكل عميل في صف واحد أفقي
          </p>
        </div>
      </div>

      {/* 2. SEARCH & QUICK FILTER BAR */}
      <div className="bg-white rounded-2xl p-2.5 shadow-xs border border-purple-100/90 flex flex-wrap items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث سريع بالاسم أو رقم الجوال..."
            className="w-full pl-8 pr-9 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'all'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            كافة الحجوزات ({activeBookings.length})
          </button>

          <button
            onClick={() => setActiveFilterTab('arrivals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'arrivals'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            دخول اليوم ({todayArrivals.length})
          </button>

          <button
            onClick={() => setActiveFilterTab('departures')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'departures'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            خروج اليوم ({todayDepartures.length})
          </button>

          <button
            onClick={() => setActiveFilterTab('waitingDeposit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilterTab === 'waitingDeposit'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            انتظار العربون ({bookings.filter(b => b.status === 'waiting_deposit').length})
          </button>
        </div>
      </div>

      {/* 1. SECTION: كافة الحجوزات النشطة (إذا كان التبويب "كافة الحجوزات") */}
      {activeFilterTab === 'all' && (
        <div className="bg-white rounded-3xl p-3.5 sm:p-5 shadow-xs border border-purple-100/90 space-y-3">
          <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
            <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              سجل الحجوزات
            </span>
            <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-purple-700" />
              <span>كافة الحجوزات النشطة ({filteredActive.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-purple-100/80 bg-white shadow-xs">
            <div className="min-w-[620px] sm:min-w-0">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 text-center items-center">
                <div className="col-span-5 text-right pr-1">العميل والجوال والتواصل</div>
                <div className="col-span-3 text-center">فترة الإقامة</div>
                <div className="col-span-2 text-center">الحساب المالي</div>
                <div className="col-span-2 text-center">التفاصيل</div>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredActive.map((b) => (
                  <div
                    key={b.id}
                    className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center text-xs hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="col-span-5 text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {b.customerName.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{b.customerName}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-500">{b.customerPhone}</span>
                            <a
                              href={getWhatsAppLink(b.customerPhone, b.customerName, b.propertyName, 'arrival')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-5 h-5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center transition-colors"
                              title="فتح واتساب العميل فوراً"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-3 text-center font-mono text-[10px] text-slate-600">
                      {b.checkInDate} ← {b.checkOutDate}
                    </div>

                    <div className="col-span-2 text-center">
                      <span className="font-bold text-slate-900 font-mono text-[11px] block">
                        {b.totalPrice} ر.س
                      </span>
                      <span className="text-[10px] text-emerald-700 block font-mono">
                        العربون: {b.depositPaid} ر.س
                      </span>
                    </div>

                    <div className="col-span-2 text-center">
                      <button
                        onClick={() => {
                          setDetailModalTitle('تفاصيل الحجز الكاملة');
                          setSelectedBookingDetails(b);
                        }}
                        className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        عرض
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SECTION: دخول اليوم - كل عميل صف واحد أفقي */}
      {(activeFilterTab === 'arrivals' || activeFilterTab === 'all') && (
        <div className="bg-white rounded-3xl p-3.5 sm:p-5 shadow-xs border border-purple-100/90 space-y-3">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-sky-700 font-bold bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span>مباشر اليوم</span>
            </div>

            <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <span className="text-purple-700 font-mono text-lg">⤺</span>
              <span>حركات دخول اليوم ({filteredArrivals.length})</span>
            </h3>
          </div>

          {filteredArrivals.length === 0 ? (
            <div className="text-center py-6 bg-slate-50/70 rounded-2xl border border-slate-100 text-slate-400 text-xs font-medium">
              لا توجد حركات دخول مسجلة لليوم مطابقة للبحث
            </div>
          ) : (
            /* Single Horizontal Rows Wrapper */
            <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-purple-100/80 bg-white shadow-xs">
              <div className="min-w-[620px] sm:min-w-0">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-purple-50/40 border-b border-purple-100/70 text-[11px] font-bold text-slate-500 text-center items-center">
                  <div className="col-span-4 text-right pr-1">العميل والجوال والتواصل</div>
                  <div className="col-span-3 text-center">الحساب والمتبقي</div>
                  <div className="col-span-2 text-center">التأمين</div>
                  <div className="col-span-3 text-center">الإجراءات والتحكم</div>
                </div>

                {/* Client Rows: كل عميل صف واحد */}
                <div className="divide-y divide-purple-100/60">
                  {filteredArrivals.map((arrival) => {
                    const isCheckedIn = !!checkedInIds[arrival.id];
                    return (
                      <div
                        key={arrival.id}
                        className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center text-xs hover:bg-purple-50/40 transition-colors"
                      >
                        {/* Col 1: العميل والتواصل (4 cols) */}
                        <div className="col-span-4 text-right">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {arrival.customerName.slice(0, 1)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate" title={arrival.customerName}>
                                {arrival.customerName}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] text-slate-500">{arrival.customerPhone}</span>
                                {/* Quick WhatsApp Button */}
                                <a
                                  href={getWhatsAppLink(arrival.customerPhone, arrival.customerName, arrival.propertyName, 'arrival')}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-5 h-5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center transition-colors"
                                  title="فتح واتساب العميل فوراً"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Col 2: الحساب والمتبقي (3 cols) */}
                        <div className="col-span-3 text-center">
                          {arrival.remainingAmount > 0 ? (
                            <span className="font-bold text-purple-900 font-mono text-[11px] block">
                              متبقي: {arrival.remainingAmount} ر.س
                            </span>
                          ) : (
                            <span className="font-bold text-emerald-700 text-[11px] block">
                              مدفوع بالكامل ✓
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setDetailModalTitle('تفاصيل اكمال الدفع وسند القبض');
                              setSelectedBookingDetails(arrival);
                            }}
                            className="mt-0.5 px-2.5 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            إكمال الدفع
                          </button>
                        </div>

                        {/* Col 3: التأمين (2 cols) */}
                        <div className="col-span-2 text-center">
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {arrival.insuranceAmount} ر.س
                          </span>
                          <button
                            onClick={() => handleReturnInsurance(arrival.id)}
                            className={`mt-0.5 px-3 py-0.5 text-[10px] font-bold border rounded-full mx-auto flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                              arrival.insuranceReturned
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                : 'bg-purple-100 hover:bg-purple-200 border-purple-200 text-purple-800'
                            }`}
                            title={arrival.insuranceReturned ? 'تم تسليم التأمين' : 'تأكيد استلام / تسليم التأمين'}
                          >
                            {arrival.insuranceReturned ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-700" />
                                <span>مستلم</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-2.5 h-2.5 fill-purple-700 text-purple-700" />
                                <span>تسليم</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Col 4: الإجراءات السريعة (3 cols) */}
                        <div className="col-span-3 text-center flex items-center justify-center gap-1.5">
                          {/* Quick Check-in button */}
                          <button
                            onClick={() => handleToggleCheckIn(arrival.id)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-xl border transition-colors cursor-pointer ${
                              isCheckedIn
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-200'
                            }`}
                            title="تأكيد دخول النزيل"
                          >
                            {isCheckedIn ? 'تم الدخول ✓' : 'تسجيل دخول'}
                          </button>

                          {/* Full Details Modal */}
                          <button
                            onClick={() => {
                              setDetailModalTitle('تفاصيل الحجز الكاملة');
                              setSelectedBookingDetails(arrival);
                            }}
                            className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white text-[10px] font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>تفاصيل</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SECTION: خروج اليوم - كل عميل صف واحد أفقي */}
      {(activeFilterTab === 'departures' || activeFilterTab === 'all') && (
        <div className="bg-white rounded-3xl p-3.5 sm:p-5 shadow-xs border border-purple-100/90 space-y-3">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>مغادرة اليوم</span>
            </div>

            <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <span className="text-rose-600 font-mono text-lg">⤺</span>
              <span>حركات خروج اليوم ({filteredDepartures.length})</span>
            </h3>
          </div>

          {filteredDepartures.length === 0 ? (
            <div className="text-center py-6 bg-slate-50/70 rounded-2xl border border-slate-100 text-slate-400 text-xs font-medium">
              لا توجد حركات خروج مسجلة لليوم مطابقة للبحث
            </div>
          ) : (
            /* Single Horizontal Rows Wrapper */
            <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-purple-100/80 bg-white shadow-xs">
              <div className="min-w-[620px] sm:min-w-0">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-rose-50/40 border-b border-rose-100/70 text-[11px] font-bold text-slate-500 text-center items-center">
                  <div className="col-span-4 text-right pr-1">العميل والتواصل والتذكير</div>
                  <div className="col-span-3 text-center">إغلاق وتصفية الحساب</div>
                  <div className="col-span-2 text-center">تصفية التأمين</div>
                  <div className="col-span-3 text-center">تسجيل الخروج والتفاصيل</div>
                </div>

                {/* Client Rows: كل عميل صف واحد */}
                <div className="divide-y divide-purple-100/60">
                  {filteredDepartures.map((departure) => (
                    <div
                      key={departure.id}
                      className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center text-xs hover:bg-rose-50/30 transition-colors"
                    >
                      {/* Col 1: العميل والتواصل (4 cols) */}
                      <div className="col-span-4 text-right">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {departure.customerName.slice(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate" title={departure.customerName}>
                              {departure.customerName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-slate-500">{departure.customerPhone}</span>
                              {/* Quick WhatsApp Reminder */}
                              <button
                                onClick={() => handleReminder(departure.id)}
                                className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="إرسال تذكير خروج واتساب"
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                                <span>تذكير</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Col 2: إغلاق الحساب (3 cols) */}
                      <div className="col-span-3 text-center">
                        <span className="font-bold text-slate-800 font-mono text-[11px] block">
                          الإجمالي: {departure.totalPrice} ر.س
                        </span>
                        <button
                          onClick={() => {
                            setDetailModalTitle('إغلاق وتصفية حساب العميل');
                            setSelectedBookingDetails(departure);
                          }}
                          className="mt-0.5 px-2.5 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          تصفية الحساب
                        </button>
                      </div>

                      {/* Col 3: تصفية التأمين (2 cols) */}
                      <div className="col-span-2 text-center">
                        <span className="text-[10px] text-slate-500 block font-mono">
                          {departure.insuranceAmount} ر.س
                        </span>
                        <button
                          onClick={() => handleReturnInsurance(departure.id)}
                          className={`mt-0.5 px-3 py-0.5 text-[10px] font-bold border rounded-full mx-auto flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                            departure.insuranceReturned
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                              : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800'
                          }`}
                          title={departure.insuranceReturned ? 'تم تسليم التأمين' : 'تسليم وإرجاع التأمين'}
                        >
                          {departure.insuranceReturned ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-700" />
                              <span>مسلّم</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-2.5 h-2.5 fill-rose-700 text-rose-700" />
                              <span>إرجاع</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Col 4: تسجيل الخروج والتفاصيل (3 cols) */}
                      <div className="col-span-3 text-center flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleCheckedOut(departure.id)}
                          className={`px-3 py-1 text-[10px] font-bold rounded-xl border transition-colors cursor-pointer ${
                            departure.checkedOut
                              ? 'bg-slate-200 text-slate-600 border-slate-300'
                              : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600'
                          }`}
                        >
                          {departure.checkedOut ? 'تم الخروج ✓' : 'تسجيل خروج'}
                        </button>

                        <button
                          onClick={() => {
                            setDetailModalTitle('تفاصيل الحجز والتسوية المالية');
                            setSelectedBookingDetails(departure);
                          }}
                          className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white text-[10px] font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>تفاصيل</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SECTION: انتظار العربون - كل عميل صف واحد أفقي */}
      {(activeFilterTab === 'waitingDeposit' || activeFilterTab === 'all') && (
        <div className="bg-white rounded-3xl p-3.5 sm:p-5 shadow-xs border border-purple-100/90 space-y-3">
          <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>معلق</span>
            </div>

            <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <span className="text-amber-600 font-mono text-lg">⏳</span>
              <span>حجوزات بانتظار العربون ({filteredWaitingDeposit.length})</span>
            </h3>
          </div>

          {filteredWaitingDeposit.length === 0 ? (
            <div className="text-center py-6 bg-slate-50/70 rounded-2xl border border-slate-100 text-slate-400 text-xs font-medium">
              لا توجد حجوزات بانتظار العربون حالياً
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-purple-100/80 bg-white shadow-xs">
              <div className="min-w-[620px] sm:min-w-0">
                <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-amber-50/40 border-b border-amber-100/70 text-[11px] font-bold text-slate-500 text-center items-center">
                  <div className="col-span-5 text-right pr-1">العميل والجوال والتواصل</div>
                  <div className="col-span-3 text-center">المبلغ المطلوب</div>
                  <div className="col-span-2 text-center">التفاصيل</div>
                  <div className="col-span-2 text-center">إجراء</div>
                </div>

                <div className="divide-y divide-purple-100/60">
                  {filteredWaitingDeposit.map((b) => (
                    <div
                      key={b.id}
                      className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center text-xs hover:bg-amber-50/30 transition-colors"
                    >
                      <div className="col-span-5 text-right">
                        <span className="font-bold text-slate-900 block truncate">{b.customerName}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-500">{b.customerPhone}</span>
                          <a
                            href={getWhatsAppLink(b.customerPhone, b.customerName, b.propertyName, 'arrival')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-5 h-5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center transition-colors"
                            title="فتح واتساب العميل فوراً"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <div className="col-span-3 text-center font-bold text-amber-700 font-mono text-[11px]">
                        {b.depositPaid} ر.س
                      </div>
                      <div className="col-span-2 text-center">
                        <button
                          onClick={() => {
                            setDetailModalTitle('تفاصيل الحجز المعلق');
                            setSelectedBookingDetails(b);
                          }}
                          className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          عرض
                        </button>
                      </div>
                      <div className="col-span-2 text-center">
                        <button
                          onClick={() => updateBookingStatus(b.id, 'cancelled')}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. SECTION: المتاح اليوم - صف واحد لكل استراحة */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-5 shadow-xs border border-purple-100/90 space-y-3">
        <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
          <button
            onClick={() => setShowAllAvailable(!showAllAvailable)}
            className="px-3.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            {showAllAvailable ? 'إخفاء المتاح' : 'عرض المتاح'}
          </button>

          <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-700" />
            <span>المتاح اليوم ({availablePropertiesToday.length})</span>
          </h3>
        </div>

        {/* Available Properties Grid / List */}
        {showAllAvailable && (
          <div className="space-y-2 pt-1 animate-in fade-in duration-150">
            {availablePropertiesToday.map((prop) => (
              <div
                key={prop.id}
                onClick={() => {
                  setSelectedPropertyId(prop.id);
                  setActiveTab('calendar');
                }}
                className="p-3 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl border border-emerald-200/80 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-purple-900 transition-colors">
                      {prop.name}
                    </h4>
                    <span className="text-[10px] text-slate-500">{prop.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left font-mono">
                    <span className="font-bold text-xs sm:text-sm text-emerald-800 block">
                      {prop.basePriceWeekday} ر.س
                    </span>
                    <span className="text-[9px] text-slate-400">سعر الليلة</span>
                  </div>

                  <span className="text-xs bg-purple-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs group-hover:bg-purple-800 transition-all">
                    حجز الآن
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8. MODAL: تفاصيل الحجز وإغلاق الحساب */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-purple-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-purple-100">
              <div>
                <h4 className="font-bold text-base text-slate-900">{detailModalTitle}</h4>
                <span className="text-xs font-mono text-purple-700">
                  {selectedBookingDetails.bookingNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">اسم العميل:</span>
                <span className="font-bold text-slate-900">
                  {selectedBookingDetails.customerName}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">رقم الجوال:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">
                    {selectedBookingDetails.customerPhone}
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedBookingDetails.customerPhone, 'رقم الجوال')}
                    className="text-purple-700 hover:text-purple-900"
                    title="نسخ رقم الجوال"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">العقار:</span>
                <span className="font-bold text-purple-900">
                  {selectedBookingDetails.propertyName}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">فترة الإقامة:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  من {selectedBookingDetails.checkInDate} إلى {selectedBookingDetails.checkOutDate}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">المبلغ الإجمالي:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {selectedBookingDetails.totalPrice} ر.س
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">العربون المدفوع:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {selectedBookingDetails.depositPaid} ر.س
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">المبلغ المتبقي للتحصيل:</span>
                <span className="font-bold text-purple-900 font-mono">
                  {selectedBookingDetails.remainingAmount} ر.س
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">مبلغ التأمين المسترد:</span>
                <span className="font-bold text-amber-700 font-mono">
                  {selectedBookingDetails.insuranceAmount} ر.س (
                  {selectedBookingDetails.insuranceReturned ? 'تم التسليم' : 'معلق'}
                  )
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">المسوق المعتمد (عمولة 5%):</span>
                <span className="font-bold text-slate-800">
                  {selectedBookingDetails.marketerName || 'حجز مباشر'} (
                  {selectedBookingDetails.marketerCommission} ر.س)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  handleReminder(selectedBookingDetails.id);
                  setSelectedBookingDetails(null);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال تذكير خروج</span>
              </button>

              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};