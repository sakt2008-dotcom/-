import React, { useState, useEffect } from 'react';
import {
  CalendarPlus,
  Percent,
  X,
  Sparkles,
  Phone,
  User,
  Calendar,
  Building,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PropertyId } from '../types';

export const NewBookingModal: React.FC = () => {
  const {
    bookingModalOpen,
    setBookingModalOpen,
    preselectedDateForBooking,
    properties,
    selectedPropertyId,
    marketers,
    isAdmin,
    currentMarketerId,
    activePermissions,
    canEditDeposit,
    canCreateContract,
    addBooking,
    dateOverrides,
  } = useApp();

  // Form State
  const [propId, setPropId] = useState<PropertyId>(selectedPropertyId);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('05');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [depositAmount, setDepositAmount] = useState<number>(250);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [assignedMarketerId, setAssignedMarketerId] = useState<string>(
    isAdmin ? marketers[0]?.id || '' : currentMarketerId
  );

  useEffect(() => {
    if (bookingModalOpen) {
      setPropId(selectedPropertyId);
      const today = new Date();
      const defaultCheckIn = preselectedDateForBooking || today.toISOString().split('T')[0];
      setCheckInDate(defaultCheckIn);

      // Default next day check out
      const checkInObj = new Date(defaultCheckIn);
      checkInObj.setDate(checkInObj.getDate() + 1);
      setCheckOutDate(checkInObj.toISOString().split('T')[0]);

      if (!isAdmin) {
        setAssignedMarketerId(currentMarketerId);
      }
    }
  }, [bookingModalOpen, preselectedDateForBooking, selectedPropertyId, isAdmin, currentMarketerId]);

  if (!bookingModalOpen) return null;

  const currentProperty = properties.find((p) => p.id === propId) || properties[0];

  // Calculate nights
  const checkInTime = new Date(checkInDate).getTime();
  const checkOutTime = new Date(checkOutDate).getTime();
  const diffDays = Math.max(1, Math.round((checkOutTime - checkInTime) / (1000 * 60 * 60 * 24)));
  const nightsCount = isNaN(diffDays) ? 1 : diffDays;

  // Approximate nightly price
  const baseRate = currentProperty.basePriceWeekday;
  const subtotal = baseRate * nightsCount;
  const netTotal = Math.max(0, subtotal - discountAmount);

  // Exact 5% commission calculation
  const calculatedCommission = Math.round(netTotal * 0.05);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !checkInDate || !checkOutDate) return;

    addBooking({
      propertyId: propId,
      customerName,
      customerPhone,
      checkInDate,
      checkOutDate,
      nightsCount,
      nightlyPrice: baseRate,
      totalPrice: netTotal,
      discount: discountAmount,
      depositPaid: depositAmount,
      marketerId: assignedMarketerId || undefined,
      notes,
    });

    // Reset and close
    setCustomerName('');
    setCustomerPhone('05');
    setDiscountAmount(0);
    setNotes('');
    setBookingModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-purple-100 max-h-[92dvh] sm:max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-l from-purple-900 via-purple-800 to-indigo-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-purple-200 backdrop-blur-xs">
              <CalendarPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">تسجيل حجز استراحة جديد</h3>
              <p className="text-xs text-purple-200">
                يتم احتساب عمولة 5% تلقائياً للمسوق عند إتمام الحجز
              </p>
            </div>
          </div>
          <button
            onClick={() => setBookingModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Property Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">اختر الاستراحة / العقار:</label>
            <select
              value={propId}
              onChange={(e) => setPropId(e.target.value as PropertyId)}
              className="w-full px-3.5 py-2.5 bg-purple-50/70 border border-purple-200 text-purple-950 font-bold rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden cursor-pointer"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {p.location.split('-')[1] || p.location} ({p.basePriceWeekday} ر.س / ليلة)
                </option>
              ))}
            </select>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">اسم العميل (النزيل):</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="الاسم الثلاثي"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">رقم الجوال (واتساب):</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="tel"
                  required
                  placeholder="05xxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">تاريخ الدخول:</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">تاريخ الخروج:</label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Marketer Assignment */}
          {isAdmin ? (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                تنسيب الحجز لمسوق (لاستحقاق عمولة 5%):
              </label>
              <select
                value={assignedMarketerId}
                onChange={(e) => setAssignedMarketerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden"
              >
                <option value="">حجز مباشر للإدارة (بدون عمولة مسوق)</option>
                {marketers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.code}) - عمولة 5%
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
              <span className="text-slate-600">المسوق المسجل:</span>
              <span className="font-bold text-purple-950 font-mono">
                {marketers.find((m) => m.id === currentMarketerId)?.name} (عمولة 5%)
              </span>
            </div>
          )}

          {/* Discount Field (if allowed) */}
          {(isAdmin || activePermissions.canEditPrices) && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                خصم إضافي (بالريال):
              </label>
              <input
                type="number"
                min={0}
                step={50}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-purple-600 outline-hidden"
              />
            </div>
          )}

          {/* Deposit Field with Staff Editing Permission */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 block">
                مبلغ العربون المطلوب (ريال):
              </label>
              {(canEditDeposit || isAdmin) && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  ✓ مصرح لك بتعديل العربون
                </span>
              )}
            </div>
            <input
              type="number"
              min={0}
              step={50}
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              disabled={!canEditDeposit && !isAdmin}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-purple-600 outline-hidden"
            />
            {(canEditDeposit || isAdmin) && (
              <div className="flex items-center gap-1.5 pt-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDepositAmount(Math.round(netTotal * 0.2))}
                  className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 font-medium"
                >
                  20% ({Math.round(netTotal * 0.2)})
                </button>
                <button
                  type="button"
                  onClick={() => setDepositAmount(Math.round(netTotal * 0.3))}
                  className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 font-medium"
                >
                  30% ({Math.round(netTotal * 0.3)})
                </button>
                <button
                  type="button"
                  onClick={() => setDepositAmount(Math.round(netTotal * 0.5))}
                  className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 font-medium"
                >
                  50% ({Math.round(netTotal * 0.5)})
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">ملاحظات وطلبات خاصة:</label>
            <textarea
              rows={2}
              placeholder="مثال: عائلة، طلبوا سرير إضافي، توفير فحم للشواء..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden"
            />
          </div>

          {/* Financial Summary & 5% Commission Highlight Box */}
          <div className="p-4 bg-gradient-to-l from-purple-50 to-indigo-50/70 rounded-2xl border border-purple-200 space-y-2">
            <div className="flex justify-between items-center text-slate-700">
              <span>عدد الليالي:</span>
              <span className="font-bold font-mono">{nightsCount} ليالي</span>
            </div>

            <div className="flex justify-between items-center text-slate-700">
              <span>الإجمالي قبل الخصم:</span>
              <span className="font-mono">{subtotal} ر.س</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-rose-600 font-medium">
                <span>الخصم الممنوح:</span>
                <span className="font-mono">-{discountAmount} ر.س</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-bold text-purple-950 pt-2 border-t border-purple-200/80">
              <span>المبلغ النهائي للحجز:</span>
              <span className="text-base font-mono font-bold text-purple-900">
                {netTotal} ر.س
              </span>
            </div>

            {/* 5% Marketer Commission */}
            <div className="flex justify-between items-center bg-white/80 p-2.5 rounded-xl border border-purple-200 text-emerald-800 font-bold">
              <span className="flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>عمولة المسوق المكتسبة (5%):</span>
              </span>
              <span className="text-sm font-mono text-emerald-700">
                {calculatedCommission} ر.س
              </span>
            </div>
            <p className="text-[10px] text-slate-500 text-center">
              * تصرف العمولة عند إتمام الحجز للنزيل
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>تأكيد الحجز واحتساب العمولة</span>
            </button>
            <button
              type="button"
              onClick={() => setBookingModalOpen(false)}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
