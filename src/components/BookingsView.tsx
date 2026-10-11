import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Download,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Film,
  Navigation,
  FileText,
  Lock,
  Clock,
  Send,
  Upload,
  CheckCircle2,
  X,
  Share2,
  DollarSign,
  Sparkles,
  Paperclip,
  Check,
  ExternalLink,
  Save,
  MessageSquare,
  Building2,
  AlertTriangle,
  RotateCcw,
  Pencil,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PropertyId, Booking } from '../types';

export const BookingsView: React.FC = () => {
  const {
    properties,
    selectedPropertyId,
    selectedProperty,
    setSelectedPropertyId,
    bookings,
    dateOverrides,
    setDateOverride,
    setDateOverridesBulk,
    requestDeposit,
    cancelDepositWait,
    confirmBookingWithReceipt,
    updateBookingStatus,
    payMarketerCommission,
    isAdmin,
    currentMarketerId,
    currentMarketer,
    nowTimestamp,
    openTemplatesModal,
    sendPaymentCompletionRequest,
    canCreateContract,
    canEditDeposit,
    updateWaitingDepositAmount,
  } = useApp();

  // Month navigation for embedded interactive calendar
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // October 2026

  // Selected dates for booking (single or multi-day range)
  const [selectedDates, setSelectedDates] = useState<string[]>(['2026-10-13']);

  // Booking Form Inputs (Matching Screenshot 3)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('05');
  const [depositInput, setDepositInput] = useState<number>(selectedProperty.defaultDeposit || 250);
  const [editingDepositModalOpen, setEditingDepositModalOpen] = useState(false);
  const [editDepositValue, setEditDepositValue] = useState<number>(selectedProperty.defaultDeposit || 250);


  // Modals for Top 4 Quick Actions
  const [activeQuickModal, setActiveQuickModal] = useState<
    'info' | 'photos' | 'location' | 'contract' | null
  >(null);

  // Receipt upload state for confirming booking
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');

  // Active deposit request state (if on hold)
  const [activeDepositHold, setActiveDepositHold] = useState<{
    whatsappUrl: string;
    message: string;
    expiresAt: number;
  } | null>(null);

  // Calendar Size state: 'compact' | 'normal' | 'large'
  const [calendarSize, setCalendarSize] = useState<'compact' | 'normal' | 'large'>('normal');

  // WhatsApp Preview & Direct Link Modal Data
  const [whatsAppModalData, setWhatsAppModalData] = useState<{
    title: string;
    text: string;
    whatsappUrl: string;
    phone: string;
  } | null>(null);

  // Contract preview modal data
  const [contractModalData, setContractModalData] = useState<{
    contractText: string;
    whatsappUrl: string;
    bookingNumber: string;
  } | null>(null);

  // View sub-tab: 'interactive' (شاشة الحجز والتقويم كالصورة) vs 'list' (سجل الحجوزات السابقة)
  const [viewSubTab, setViewSubTab] = useState<'interactive' | 'list'>('interactive');

  // Multi-section choice (الترف قسمين: القسم الأول / القسم الثاني / كامل الاستراحة)
  const [selectedSectionId, setSelectedSectionId] = useState<'section-1' | 'section-2' | 'all'>('section-1');

  // Reset or adjust section choice when property changes
  useEffect(() => {
    if (selectedProperty.sections && selectedProperty.sections.length > 0) {
      setSelectedSectionId('section-1');
    } else {
      setSelectedSectionId('all');
    }
  }, [selectedPropertyId, selectedProperty]);

  // Active section helper
  const activeSection = useMemo(() => {
    if (!selectedProperty.sections || selectedProperty.sections.length === 0) return null;
    if (selectedSectionId === 'all') return null;
    return selectedProperty.sections.find((s) => s.id === selectedSectionId) || null;
  }, [selectedProperty, selectedSectionId]);

  const sectionNameText = useMemo(() => {
    if (!activeSection) return undefined;
    return activeSection.name;
  }, [activeSection]);

  // Sync default deposit when property changes
  useEffect(() => {
    if (selectedProperty.defaultDeposit) {
      setDepositInput(selectedProperty.defaultDeposit);
    }
  }, [selectedPropertyId, selectedProperty]);

  // Clean phone number helper
  const getCleanCustomerPhone = (rawPhone?: string) => {
    const target = (rawPhone || customerPhone || '').replace(/\D/g, '');
    return target.replace(/^0/, '966');
  };

  // Helper: Open WhatsApp with customer phone or show popup modal if missing
  const sendWhatsAppWithCustomerPhone = (messageText: string, title: string = 'إرسال عبر واتساب') => {
    let phone = customerPhone.trim();
    if (!phone || phone === '05' || phone.length < 9) {
      // Show WhatsApp modal with phone input field
      const clean = '966';
      const url = `https://wa.me/${clean}?text=${encodeURIComponent(messageText)}`;
      setWhatsAppModalData({
        title,
        text: messageText,
        whatsappUrl: url,
        phone: customerPhone && customerPhone !== '05' ? customerPhone : '05',
      });
      return;
    }
    const clean = phone.replace(/\D/g, '').replace(/^0/, '966');
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(messageText)}`;
    
    // Set preview modal so user can also copy or see it, and attempt opening
    setWhatsAppModalData({
      title,
      text: messageText,
      whatsappUrl: url,
      phone,
    });
    try {
      window.open(url, '_blank');
    } catch {
      // Ignored if browser blocks popup
    }
  };

  // Dynamic Check-In & Check-Out:
  // "الخانه الاولى تاريخ الدخول وتاريخ المغادره يكون ديناميكي حيث يحدد بعد اخر يوم للدخول مثلا تاريخ الدخول 5 يناير يتم احتساب الخروج 6 يناير بدون اختيار تاريخ الخروج"
  const sortedDates = useMemo(() => [...selectedDates].sort(), [selectedDates]);
  const checkInDate = sortedDates[0] || '2026-10-13';
  const lastNight = sortedDates[sortedDates.length - 1] || checkInDate;

  const dynamicCheckOutDate = useMemo(() => {
    const nextDate = new Date(lastNight);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate.toISOString().split('T')[0];
  }, [lastNight]);

  const nightsCount = Math.max(1, selectedDates.length);

  // Total Price calculation across selected dates
  const totalPrice = useMemo(() => {
    let sum = 0;
    sortedDates.forEach((d) => {
      const override = dateOverrides[`${selectedPropertyId}_${d}`];
      if (override?.price !== undefined) {
        sum += override.price;
      } else {
        const dateObj = new Date(d);
        const isWeekend = dateObj.getDay() === 4 || dateObj.getDay() === 5;
        if (activeSection) {
          sum += isWeekend ? activeSection.priceWeekend : activeSection.priceWeekday;
        } else {
          sum += isWeekend ? selectedProperty.basePriceWeekend : selectedProperty.basePriceWeekday;
        }
      }
    });
    return sum;
  }, [sortedDates, dateOverrides, selectedPropertyId, selectedProperty, activeSection]);

  // Financial Breakdown Calculations (Matching Screenshots 2 & 3)
  const marketerCommission5 = Math.round(totalPrice * 0.05);
  const remainingAmount = Math.max(0, totalPrice - depositInput);
  const insuranceAmount = selectedProperty.insuranceAmount || 300;

  // Check 15-minute deposit countdown status
  const currentHoldOverride = dateOverrides[`${selectedPropertyId}_${checkInDate}`];
  const isCurrentlyWaitingDeposit =
    currentHoldOverride?.status === 'waiting_deposit' &&
    currentHoldOverride.waitingDepositExpiresAt &&
    currentHoldOverride.waitingDepositExpiresAt > nowTimestamp;

  const remainingSeconds = isCurrentlyWaitingDeposit && currentHoldOverride?.waitingDepositExpiresAt
    ? Math.max(0, Math.floor((currentHoldOverride.waitingDepositExpiresAt - nowTimestamp) / 1000))
    : 0;

  // Embedded Calendar Grid
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateKey = `${currentYear}-${monthStr}-${dayStr}`;

      const dateObj = new Date(currentYear, currentMonth, d);
      const isWeekend = dateObj.getDay() === 4 || dateObj.getDay() === 5;

      const overrideKey = `${selectedPropertyId}_${dateKey}`;
      const override = dateOverrides[overrideKey];

      const defaultPrice = isWeekend
        ? selectedProperty.basePriceWeekend
        : selectedProperty.basePriceWeekday;
      const effectivePrice = override?.price !== undefined ? override.price : defaultPrice;

      const activeBooking = bookings.find(
        (b) =>
          b.propertyId === selectedPropertyId &&
          b.status !== 'cancelled' &&
          dateKey >= b.checkInDate &&
          dateKey < b.checkOutDate
      );

      let status: 'available' | 'booked' | 'waiting_deposit' | 'blocked' = 'available';
      if (!selectedProperty.isPublished) {
        status = 'blocked';
      } else if (activeBooking) {
        status = 'booked';
      } else if (override?.status === 'waiting_deposit') {
        status = 'waiting_deposit';
      } else if (override?.status === 'blocked') {
        status = 'blocked';
      }

      days.push({
        dayNum: d,
        dateKey,
        price: effectivePrice,
        status,
        override,
      });
    }

    return days;
  }, [currentYear, currentMonth, selectedPropertyId, selectedProperty, bookings, dateOverrides]);

  // Handle Calendar Day Selection
  const handleSelectCalendarDay = (dateKey: string) => {
    if (selectedDates.includes(dateKey)) {
      if (selectedDates.length > 1) {
        setSelectedDates(selectedDates.filter((d) => d !== dateKey));
      }
    } else {
      setSelectedDates([...selectedDates, dateKey]);
    }
  };

  // Month Navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // 1. WhatsApp Dispatch: معلومات المكان (Place Specs)
  const handleSendPlaceInfoWhatsApp = () => {
    const text =
      `مرحباً بك أخي الكريم ${customerName || ''}،\n` +
      `يسرنا تزويدكم بتفاصيل ومواصفات استراحة (${selectedProperty.name}):\n\n` +
      `🏕️ *المواصفات:*\n` +
      `• ${selectedProperty.subtitle}\n` +
      `• السعة: ${selectedProperty.capacity} فرد\n` +
      `• غرف النوم: ${selectedProperty.bedrooms} | دورات المياه: ${selectedProperty.bathrooms}\n` +
      `• المساحة: ${selectedProperty.areaM2} م² | المسبح: ${selectedProperty.poolType}\n` +
      `• وقت الدخول: ${selectedProperty.checkInTimeText} | وقت الخروج: ${selectedProperty.checkOutTimeText}\n` +
      `• سعر الليلة: ${selectedProperty.basePriceWeekday} ر.س (وسط الأسبوع) / ${selectedProperty.basePriceWeekend} ر.س (الويكند)\n` +
      `• التأمين المسترد: ${insuranceAmount} ريال\n\n` +
      `نتشرف بخدمتكم لحجز إقامتكم السعيدة!`;
    sendWhatsAppWithCustomerPhone(text);
  };

  // 2. WhatsApp Dispatch: الفيديو والصور (Media Links)
  const handleSendPhotosWhatsApp = () => {
    const imagesList = selectedProperty.images?.length
      ? selectedProperty.images.map((url, i) => {
          const isVideo = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('.mp4') || url.includes('vimeo.com');
          return `• ${isVideo ? '🎥 فيديو' : '📸 صورة'} ${i + 1}: ${url}`;
        }).join('\n')
      : `• رابط الألبوم: ${selectedProperty.coverImage}`;

    const text =
      `أهلاً بك أخي الكريم ${customerName || ''}،\n` +
      `مرفق لكم ألبوم الصور والفيديو لاستراحة (${selectedProperty.name}):\n\n` +
      `📸 *روابط الصور والتغطيات:*\n${imagesList}\n\n` +
      `نتمنى أن تنال إعجابكم ويسعدنا استقبال استفساراتكم! 🏕️`;
    sendWhatsAppWithCustomerPhone(text, 'إرسال الوسائط عبر واتساب');
  };

  // 3. WhatsApp Dispatch: اللوكيشن (Google Maps Location)
  const handleSendLocationWhatsApp = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${selectedProperty.name} ${selectedProperty.location}`
    )}`;
    const text =
      `مرحباً بك أخي الكريم ${customerName || ''}،\n` +
      `موقع ولوكيشن استراحة (${selectedProperty.name}):\n\n` +
      `📍 *العنوان:* ${selectedProperty.location}\n` +
      `🗺️ *رابط خرائط Google:*\n${mapsUrl}\n\n` +
      `نتمنى لكم رحلة وصول ميسرة وممتعة!`;
    sendWhatsAppWithCustomerPhone(text);
  };

  // 4. WhatsApp Dispatch: باقة متكاملة (المكان + الصور + اللوكيشن معاً)
  const handleSendAllPackageWhatsApp = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${selectedProperty.name} ${selectedProperty.location}`
    )}`;
    const text =
      `مرحباً بك أخي الكريم ${customerName || ''}،\n` +
      `تفاصيل استراحة (${selectedProperty.name}) الكاملة:\n\n` +
      `🏕️ *معلومات المكان:* ${selectedProperty.subtitle}\n` +
      `• السعة: ${selectedProperty.capacity} فرد | غرف النوم: ${selectedProperty.bedrooms}\n` +
      `• المسبح: ${selectedProperty.poolType}\n` +
      `• وقت الدخول: ${selectedProperty.checkInTimeText} | وقت الخروج: ${selectedProperty.checkOutTimeText}\n\n` +
      `📍 *اللوكيشن على خرائط Google:*\n${mapsUrl}\n\n` +
      `📸 *ألبوم الصور:* ${selectedProperty.coverImage}\n\n` +
      `💰 *الأسعار:* ${totalPrice} ر.س (${nightsCount} ليالي) | التأمين: ${insuranceAmount} ر.س\n` +
      `يسعدنا تأكيد حجزكم فور تحويل العربون!`;
    sendWhatsAppWithCustomerPhone(text);
  };

  // 5. طلب العربون (15 دقيقة)
  const handleRequestDeposit = () => {
    if (!customerPhone.trim() || customerPhone === '05' || customerPhone.length < 9) {
      alert('فضلاً أدخل رقم جوال العميل بصيغة صحيحة (مثال: 0551234567)');
      return;
    }

    const { whatsappUrl, message } = requestDeposit({
      propertyId: selectedPropertyId,
      dates: selectedDates,
      customerName: customerName.trim() || 'عميل كريم',
      customerPhone,
      depositAmount: depositInput,
      totalPrice,
      nightsCount,
      marketerId: currentMarketerId,
    });

    setActiveDepositHold({
      whatsappUrl,
      message,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    setWhatsAppModalData({
      title: 'طلب العربون (مهلة 15 دقيقة) عبر واتساب',
      text: message,
      whatsappUrl,
      phone: customerPhone,
    });

    window.open(whatsappUrl, '_blank');
  };

  // 6. تأكيد الحجز الفوري وإصدار العقد
  const handleInstantBooking = () => {
    if (!customerPhone.trim() || customerPhone === '05' || customerPhone.length < 9) {
      alert('فضلاً أدخل رقم جوال العميل لإرسال العقد عبر واتساب');
      return;
    }

    const { booking, whatsappContractUrl, contractText } = confirmBookingWithReceipt({
      propertyId: selectedPropertyId,
      dates: selectedDates,
      customerName: customerName.trim() || 'علي',
      customerPhone,
      depositPaid: depositInput,
      totalPrice,
      remainingAmount,
      insuranceAmount,
      receiptFileName: receiptFileName || 'حجز_فوري_معتمد.pdf',
      marketerId: currentMarketerId,
    });

    setContractModalData({
      contractText,
      whatsappUrl: whatsappContractUrl,
      bookingNumber: booking.bookingNumber,
    });

    window.open(whatsappContractUrl, '_blank');
  };

  // 7. إغلاق الأيام المحددة
  const handleBlockSelectedDates = () => {
    if (selectedDates.length === 0) return;
    setDateOverridesBulk(selectedPropertyId, selectedDates, { status: 'blocked' });
    alert(`تم إغلاق الأيام المحددة (${selectedDates.length} يوم) لعقار ${selectedProperty.name}`);
  };

  return (
    <div className="pb-28 max-w-2xl mx-auto px-3 sm:px-4 pt-1 space-y-4 font-['Tajawal',sans-serif]">
      {/* 1. Header Royal Purple Banner (Matching Screenshot 1) */}
      <div className="bg-gradient-to-r from-[#4A154B] via-[#5E17EB] to-[#43126C] rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between">
        <button
          onClick={() => {
            const csv = `الاستراحة,${selectedProperty.name}\nتاريخ الدخول,${checkInDate}\nتاريخ الخروج,${dynamicCheckOutDate}\nالليالي,${nightsCount}\nالسعر,${totalPrice}`;
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `حجز_${selectedProperty.name}.csv`;
            a.click();
          }}
          className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white backdrop-blur-xs transition-colors cursor-pointer"
          title="تحميل تفاصيل الحجز"
        >
          <Download className="w-5 h-5 text-white" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <h2 className="text-base font-bold text-white tracking-tight">
              التقويم التفاعلي للحجوزات والأسعار
            </h2>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* 2. Chalet Dropdown Selector (الاستراحة أولاً كما هو مطلوب) */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-purple-100/90 flex items-center justify-between">
        <div className="relative flex-1">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value as PropertyId)}
            className="w-full bg-[#FBF9FE] border border-purple-200/80 rounded-xl py-2 px-3 pr-4 pl-9 text-xs sm:text-sm font-bold text-[#2E1045] focus:outline-hidden focus:border-purple-500 appearance-none cursor-pointer"
          >
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-600">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <span className="text-xs font-bold text-purple-900 mr-3 shrink-0">
          الاستراحة:
        </span>
      </div>

      {/* Customer Phone & Name Link Bar (رقم جوال العميل للواتساب ثانياً) */}
      <div className="bg-gradient-to-r from-[#FBF8FE] to-[#F3EDFB] p-3 rounded-2xl border border-purple-200/90 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
            <Send className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-purple-950">رقم جوال العميل للواتساب:</span>
            <span className="text-[9px] text-purple-600/80">يرتبط تلقائياً بكافة روابط الإرسال</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-sm justify-end">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="اسم العميل (اختياري)"
            dir="rtl"
            className="bg-white border border-purple-200/90 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-200 w-1/2"
          />
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="05xxxxxxxx"
            dir="ltr"
            className="bg-white border border-purple-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-purple-950 focus:outline-hidden focus:border-purple-600 focus:ring-2 focus:ring-purple-200 w-1/2 text-left"
          />
        </div>
      </div>

      {/* 3. Card: 4 Quick Links with WhatsApp Integration (Matching Screenshot 1 & User Request) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100/90 space-y-3">
        {/* 4 Quick Actions - صف واحد أفقي */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Card 1: معلومات المكان */}
          <div className="p-2.5 rounded-2xl bg-[#FAF8FD] hover:bg-purple-50/80 transition-all border border-purple-100 flex flex-col justify-between gap-2 text-center">
            <button
              onClick={() => setActiveQuickModal('info')}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#2E1045]">معلومات المكان</span>
            </button>
            <button
              onClick={handleSendPlaceInfoWhatsApp}
              className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-[#1E7E52] border border-emerald-200 py-1 px-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              title="إرسال عبر واتساب"
            >
              <Send className="w-2.5 h-2.5" />
              <span>واتساب</span>
            </button>
          </div>

          {/* Card 2: الفيديو والصور */}
          <div className="p-2.5 rounded-2xl bg-[#FAF8FD] hover:bg-purple-50/80 transition-all border border-purple-100 flex flex-col justify-between gap-2 text-center">
            <button
              onClick={() => setActiveQuickModal('photos')}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#2E1045]">الفيديو والصور</span>
            </button>
            <button
              onClick={handleSendPhotosWhatsApp}
              className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-[#1E7E52] border border-emerald-200 py-1 px-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              title="إرسال عبر واتساب"
            >
              <Send className="w-2.5 h-2.5" />
              <span>واتساب</span>
            </button>
          </div>

          {/* Card 3: اللوكيشن */}
          <div className="p-2.5 rounded-2xl bg-[#FAF8FD] hover:bg-purple-50/80 transition-all border border-purple-100 flex flex-col justify-between gap-2 text-center">
            <button
              onClick={() => setActiveQuickModal('location')}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Navigation className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#2E1045]">اللوكيشن</span>
            </button>
            <button
              onClick={handleSendLocationWhatsApp}
              className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-[#1E7E52] border border-emerald-200 py-1 px-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              title="إرسال عبر واتساب"
            >
              <Send className="w-2.5 h-2.5" />
              <span>واتساب</span>
            </button>
          </div>

          {/* Card 4: استعراض العقد */}
          <div className="p-2.5 rounded-2xl bg-[#FAF8FD] hover:bg-purple-50/80 transition-all border border-purple-100 flex flex-col justify-between gap-2 text-center">
            <button
              onClick={() => setActiveQuickModal('contract')}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#2E1045]">استعراض العقد</span>
            </button>
            <button
              onClick={() => {
                const contractSample = `عقد استراحة ${selectedProperty.name}\nالعميل: ${customerName || 'عميل'}\nالشروط والأحكام:\n${selectedProperty.contractTerms.join('\n')}`;
                sendWhatsAppWithCustomerPhone(contractSample, 'إرسال صيغة العقد عبر واتساب');
              }}
              className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-[#1E7E52] border border-emerald-200 py-1 px-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              title="إرسال عبر واتساب"
            >
              <Send className="w-2.5 h-2.5" />
              <span>واتساب</span>
            </button>
          </div>
        </div>

        {/* Master WhatsApp Action: باقة متكاملة (معلومات المكان + الصور + اللوكيشن) */}
        <div className="pt-2 border-t border-purple-100/80">
          <button
            onClick={handleSendAllPackageWhatsApp}
            className="btn-mauve-shiny w-full py-3 px-4 rounded-2xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>📲 إرسال معلومات المكان والصور واللوكيشن كاملة للعميل (واتساب)</span>
          </button>
        </div>
      </div>

      {/* 4. Interactive Calendar Card with Proper Sizing & Size Adjustment Toggle */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100/90 space-y-4">
        {/* Calendar Sizing & Month Navigation Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-purple-50">
          {/* Calendar Size Switcher (طلب المستخدم: تعديل حجم التقويم) */}
          <div className="flex items-center gap-1.5 bg-[#F8F5FD] p-1 rounded-xl border border-purple-100 self-stretch sm:self-auto justify-center">
            <span className="text-[10px] font-bold text-purple-900 px-1.5">حجم التقويم:</span>
            <button
              type="button"
              onClick={() => setCalendarSize('compact')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                calendarSize === 'compact'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-100/70'
              }`}
            >
              مدمج
            </button>
            <button
              type="button"
              onClick={() => setCalendarSize('normal')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                calendarSize === 'normal'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-100/70'
              }`}
            >
              قياسي
            </button>
            <button
              type="button"
              onClick={() => setCalendarSize('large')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                calendarSize === 'large'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-100/70'
              }`}
            >
              كبير ومريح
            </button>
          </div>

          {/* Month Navigation: < أكتوبر 2026 > */}
          <div className="flex items-center justify-between gap-4 w-full sm:w-auto">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-xl border border-purple-100 hover:bg-purple-50 flex items-center justify-center text-purple-900 transition-colors cursor-pointer"
              title="الشهر السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <h3 className="text-base sm:text-lg font-bold text-[#2E1045] min-w-[120px] text-center">
              {['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][currentMonth]}{' '}
              {currentYear}
            </h3>

            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-xl border border-purple-100 hover:bg-purple-50 flex items-center justify-center text-purple-900 transition-colors cursor-pointer"
              title="الشهر القادم"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weekday Columns (أحد, إثنين, ثلاثاء, أربعاء, خميس, جمعة, سبت) */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((dayName, idx) => (
            <span key={idx} className="text-xs font-bold text-purple-600/70 py-1">
              {dayName}
            </span>
          ))}
        </div>

        {/* Calendar Days Grid (Resized Dynamically Based on calendarSize) */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {calendarDays.map((cell, idx) => {
            const heightClass =
              calendarSize === 'compact'
                ? 'h-12 sm:h-14'
                : calendarSize === 'large'
                ? 'h-20 sm:h-24'
                : 'h-16 sm:h-18';

            if (!cell) {
              return <div key={`empty-${idx}`} className={`${heightClass} rounded-2xl bg-[#FAF8FD]/50`} />;
            }

            const isSelected = selectedDates.includes(cell.dateKey);

            // Styling based on day status matching screenshots
            let statusStyle = 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'; // متاح (Green)
            if (cell.status === 'booked') {
              statusStyle = 'bg-[#FDF2F8] border-[#FBCFE8] text-[#9D174D]'; // مؤكد (Pink)
            } else if (cell.status === 'waiting_deposit') {
              statusStyle = 'bg-[#FEFCE8] border-[#FDE68A] text-[#854D0E]'; // انتظار العربون (Yellow)
            } else if (cell.status === 'blocked') {
              statusStyle = 'bg-[#FFF1F2] border-[#FECDD3] text-[#9F1239]'; // مغلق / صيانة (Red)
            }

            return (
              <div
                key={cell.dateKey}
                onClick={() => handleSelectCalendarDay(cell.dateKey)}
                className={`${heightClass} rounded-2xl border flex flex-col items-center justify-between py-1.5 px-0.5 transition-all cursor-pointer select-none ${statusStyle} ${
                  isSelected
                    ? 'ring-2 ring-[#7C3AED] ring-offset-1 bg-[#F5F3FF] border-[#7C3AED] font-black scale-102 shadow-xs'
                    : 'hover:scale-102'
                }`}
              >
                <span className={`font-bold ${calendarSize === 'large' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
                  {cell.dayNum}
                </span>
                <span className={`font-mono leading-none ${calendarSize === 'large' ? 'text-xs font-bold' : 'text-[10px]'}`}>
                  {cell.status === 'blocked' ? '--' : cell.price}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend Row (Matching Screenshot 2) */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-around gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#ECFDF5] border border-[#A7F3D0]" />
            <span className="text-slate-600 font-medium">متاح</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#FDF2F8] border border-[#FBCFE8]" />
            <span className="text-slate-600 font-medium">مؤكد</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#FEFCE8] border border-[#FDE68A]" />
            <span className="text-slate-600 font-medium">انتظار العربون</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#FFF1F2] border border-[#FECDD3]" />
            <span className="text-slate-600 font-medium">مغلق (صيانة)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#F5F3FF] border-2 border-[#7C3AED]" />
            <span className="text-purple-900 font-bold">محدد</span>
          </div>
        </div>
      </div>

      {/* 5. Control Panel Card: لوحة التحكم — X يوم محدد (Matching Screenshot 2) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100/90 space-y-3">
        <h4 className="text-xs sm:text-sm font-bold text-[#2E1045] flex items-center justify-between">
          <span>لوحة التحكم — {selectedDates.length} يوم محدد</span>
          <span className="text-xs text-purple-600 font-mono">
            {selectedDates.length} ليلة
          </span>
        </h4>

        {/* Top Button: إغلاق الأيام المحددة */}
        <button
          onClick={handleBlockSelectedDates}
          className="w-full py-3 px-4 rounded-2xl border border-[#FBCFE8] bg-[#FFF1F2] hover:bg-[#FEE2E2] text-[#9F1239] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <Lock className="w-4 h-4 text-[#9F1239]" />
          <span>إغلاق الأيام المحددة</span>
        </button>

        {/* Bottom Button: إظهار عقد الإيجار وتعديل البيانات (SHINY MAUVE ANIMATED BUTTON!) */}
        <button
          onClick={() => setActiveQuickModal('contract')}
          className="btn-mauve-shiny w-full py-3.5 px-4 rounded-2xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <FileText className="w-4 h-4 text-purple-200" />
          <span>إظهار عقد الإيجار وتعديل البيانات</span>
        </button>
      </div>

      {/* 6. Period Summary Card (Matching Screenshot 2) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100/90 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">تاريخ الدخول</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{checkInDate}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">تاريخ الخروج</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{dynamicCheckOutDate}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">عدد الليالي</span>
            <span className="font-bold text-slate-900 text-sm font-mono">{nightsCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">الإجمالي</span>
            <span className="font-bold text-purple-900 text-sm font-mono">{totalPrice} ر.س</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">عمولة الموظف (5%):</span>
          <span className="font-bold text-emerald-700 font-mono text-sm">
            {marketerCommission5} ر.س
          </span>
        </div>
      </div>

      {/* Waiting Deposit Active Hold Banner with Deposit Editing and Contract Generation */}
      {isCurrentlyWaitingDeposit && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white rounded-3xl p-4 sm:p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-200" />
              <span className="font-bold text-sm">الحجز معلق بانتظار تحويل العربون</span>
            </div>
            <span className="bg-black/20 text-white px-3 py-1 rounded-full font-mono font-bold text-xs">
              {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')} متبقية
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <p>العميل: <strong>{currentHoldOverride?.waitingCustomerName || customerName || 'قيد الانتظار'}</strong></p>
              <p>الجوال: <span className="font-mono">{currentHoldOverride?.waitingCustomerPhone || customerPhone}</span></p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-amber-100 text-[11px] block">العربون المطلوب:</span>
              <span className="font-bold text-base font-mono">{currentHoldOverride?.waitingDepositAmount || depositInput} ر.س</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs font-bold">
            {/* Button to edit deposit before confirmation */}
            {(canEditDeposit || isAdmin) && (
              <button
                type="button"
                onClick={() => {
                  setEditDepositValue(currentHoldOverride?.waitingDepositAmount || depositInput);
                  setEditingDepositModalOpen(true);
                }}
                className="py-2.5 px-3 bg-white text-amber-950 rounded-xl hover:bg-amber-50 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-amber-800" />
                <span>تعديل العربون قبل التأكيد</span>
              </button>
            )}

            {/* Button to generate contract */}
            {(canCreateContract || isAdmin) && (
              <button
                type="button"
                onClick={() => setActiveQuickModal('contract')}
                className="py-2.5 px-3 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-200" />
                <span>إنشاء العقد المعتمد</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleInstantBooking}
              className="py-2.5 px-3 bg-purple-950 hover:bg-purple-900 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-200" />
              <span>تأكيد الحجز النهائي</span>
            </button>
          </div>
        </div>
      )}

      {/* 8. Booking Form Card: حجز جديد (Matching Screenshot 3) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-purple-100/90 space-y-4">
        {/* Header: حجز جديد | مسح التحديد */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <button
            onClick={() => {
              setSelectedDates([]);
              setCustomerName('');
              setCustomerPhone('05');
            }}
            className="text-xs text-purple-700 hover:text-purple-900 font-bold cursor-pointer"
          >
            مسح التحديد
          </button>
          <h4 className="font-bold text-[#2E1045] text-sm sm:text-base">حجز جديد</h4>
        </div>

        {/* Field 1: اسم العميل */}
        <div className="space-y-1">
          <label className="text-xs text-slate-500 font-bold block text-right">
            اسم العميل
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="ادخل الاسم"
            dir="rtl"
            className="w-full bg-[#FAF8FD] border border-purple-200/80 rounded-2xl py-3 px-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          />
        </div>

        {/* Field 2: رقم الجوال */}
        <div className="space-y-1">
          <label className="text-xs text-slate-500 font-bold block text-right">
            رقم الجوال
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="05xxxxxxxx"
            dir="ltr"
            className="w-full bg-[#FAF8FD] border border-purple-200/80 rounded-2xl py-3 px-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 font-mono text-left"
          />
        </div>

        {/* Field 3: العربون (مع صلاحيات التعديل للموظفين) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-600 font-bold block text-right flex items-center gap-1.5">
              <span>العربون المطلوب</span>
              {(canEditDeposit || isAdmin) && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                  ✓ مصرح لك بتعديل العربون
                </span>
              )}
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              الافتراضي: {selectedProperty.defaultDeposit || 250} ر.س
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              value={depositInput}
              onChange={(e) => setDepositInput(Math.max(0, Number(e.target.value)))}
              disabled={!canEditDeposit && !isAdmin}
              placeholder="0"
              dir="rtl"
              className="w-full bg-[#FAF8FD] border border-purple-200/80 rounded-2xl py-3 px-4 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 font-mono font-bold"
            />
          </div>
        </div>

        {/* Summary Row (Matching Screenshot 3) */}
        <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">الإجمالي</span>
            <span className="font-bold text-[#2E1045] font-mono text-base">{totalPrice} ر.س</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">عمولة الموظف</span>
            <span className="font-bold text-emerald-700 font-mono text-sm">{marketerCommission5} ر.س</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">الأيام المحددة</span>
            <span className="font-bold text-purple-900 text-sm font-mono">{nightsCount} ليلة</span>
          </div>
        </div>

        {/* Button 1: طلب العربون (Golden / Amber Shiny Button) */}
        <button
          onClick={handleRequestDeposit}
          className="btn-amber-shiny w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Clock className="w-4 h-4 text-amber-900" />
          <span>طلب العربون (مهلة 15 دقيقة)</span>
        </button>

        {/* Button 2: حجز فوري (SHINY MAUVE ANIMATED BUTTON!) */}
        <button
          onClick={handleInstantBooking}
          className="btn-mauve-shiny w-full py-4 px-4 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>حجز فوري ({nightsCount} ليلة) وإصدار العقد</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* QUICK ACTION MODALS (معلومات المكان / الصور / اللوكيشن / العقد) */}
      {/* ========================================================= */}
      {activeQuickModal && (
        <div
          onClick={() => setActiveQuickModal(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-purple-100 flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                {activeQuickModal === 'info' && <MapPin className="w-4 h-4 text-purple-300" />}
                {activeQuickModal === 'photos' && <Film className="w-4 h-4 text-purple-300" />}
                {activeQuickModal === 'location' && <Navigation className="w-4 h-4 text-purple-300" />}
                {activeQuickModal === 'contract' && <FileText className="w-4 h-4 text-purple-300" />}
                <span>
                  {activeQuickModal === 'info' && `معلومات استراحة ${selectedProperty.name}`}
                  {activeQuickModal === 'photos' && `ألبوم صور وفيديو ${selectedProperty.name}`}
                  {activeQuickModal === 'location' && `لوكيشن استراحة ${selectedProperty.name}`}
                  {activeQuickModal === 'contract' && `عقد استراحة ${selectedProperty.name}`}
                </span>
              </h4>
              <button
                onClick={() => setActiveQuickModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {/* 1. INFO */}
              {activeQuickModal === 'info' && (
                <div className="space-y-3">
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {selectedProperty.subtitle}
                  </p>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl text-slate-700">
                    <div>• السعة: <strong>{selectedProperty.capacity} فرد</strong></div>
                    <div>• غرف النوم: <strong>{selectedProperty.bedrooms}</strong></div>
                    <div>• دورات المياه: <strong>{selectedProperty.bathrooms}</strong></div>
                    <div>• المساحة: <strong>{selectedProperty.areaM2} م²</strong></div>
                    <div className="col-span-2 pt-1 border-t border-slate-200">
                      • المسبح: {selectedProperty.poolType}
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-2xl text-purple-950 space-y-1">
                    <p>• وقت الدخول: {selectedProperty.checkInTimeText}</p>
                    <p>• وقت الخروج: {selectedProperty.checkOutTimeText}</p>
                    <p>• التأمين المسترد: {insuranceAmount} ريال</p>
                  </div>
                </div>
              )}

              {/* 2. PHOTOS */}
              {activeQuickModal === 'photos' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {(selectedProperty.images || [selectedProperty.coverImage]).map((url, i) => (
                      <div key={i} className="h-28 rounded-2xl overflow-hidden border border-purple-100">
                        <img
                          src={url}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. LOCATION */}
              {activeQuickModal === 'location' && (
                <div className="space-y-3 text-center">
                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 space-y-1">
                    <p className="font-bold text-slate-900">{selectedProperty.location}</p>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${selectedProperty.name} ${selectedProperty.location}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>فتح الموقع مباشرة على خرائط Google</span>
                  </a>
                </div>
              )}

              {/* 4. CONTRACT - AMASA OFFICIAL CONTRACT */}
              {activeQuickModal === 'contract' && (
                <div className="space-y-3.5">
                  <div className="bg-gradient-to-r from-[#200738] to-[#391263] text-white p-3.5 rounded-2xl flex items-center justify-between border border-purple-800">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-black text-amber-300 text-sm">AMASA</span>
                        <h5 className="font-bold text-xs">عقد إيجار شاليه موثق</h5>
                      </div>
                      <p className="text-[10px] text-purple-200 mt-0.5">
                        صيغة العقد المعتمدة لـ ({selectedProperty.name})
                      </p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                      موثق ومعتمد
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200 text-slate-700">
                      <div>المؤجر: <strong>إدارة AMASA</strong></div>
                      <div>المستأجر: <strong>{customerName || 'العميل الكريم'}</strong></div>
                      <div>رقم الجوال: <strong className="font-mono">{customerPhone}</strong></div>
                      <div>الفترة: <strong>{nightsCount} ليلة ({checkInDate} إلى {dynamicCheckOutDate})</strong></div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-purple-50/80 p-2 rounded-xl border border-purple-100 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">الإجمالي:</span>
                        <strong className="font-mono text-purple-900">{totalPrice} ر.س</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">العربون:</span>
                        <strong className="font-mono text-amber-800">{depositInput} ر.س</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">المتبقي:</span>
                        <strong className="font-mono text-emerald-800">{Math.max(0, totalPrice - depositInput)} ر.س</strong>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <p className="font-bold text-[#2E1045] flex items-center justify-between">
                        <span>شروط وأحكام العقد المعتمدة:</span>
                        {(canCreateContract || isAdmin) && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                            ✓ صلاحية إنشاء العقد مفعلة
                          </span>
                        )}
                      </p>
                      <div className="space-y-1 max-h-36 overflow-y-auto text-slate-700 pr-1">
                        {selectedProperty.contractTerms.map((term, i) => (
                          <div key={i} className="flex items-start gap-1.5 bg-white p-2 rounded-xl border border-slate-200/60">
                            <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{term}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with One-Click Send to Customer WhatsApp */}
            <div className="p-4 bg-slate-50 border-t border-purple-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setActiveQuickModal(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                إغلاق
              </button>

              <button
                onClick={() => {
                  if (activeQuickModal === 'info') handleSendPlaceInfoWhatsApp();
                  else if (activeQuickModal === 'photos') handleSendPhotosWhatsApp();
                  else if (activeQuickModal === 'location') handleSendLocationWhatsApp();
                  else if (activeQuickModal === 'contract') {
                    const text = `عقد إيجار شاليه ${selectedProperty.name} (منصة AMASA)\nالعميل: ${customerName || 'عميل'}\nالجوال: ${customerPhone}\nالفترة: من ${checkInDate} إلى ${dynamicCheckOutDate} (${nightsCount} ليلة)\nالإجمالي: ${totalPrice} ريال | العربون: ${depositInput} ريال | المتبقي: ${totalPrice - depositInput} ريال | التأمين: ${insuranceAmount} ريال\n\nالشروط والأحكام:\n${selectedProperty.contractTerms.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
                    sendWhatsAppWithCustomerPhone(text);
                  }
                  setActiveQuickModal(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال هذا المحتوى للعميل عبر واتساب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract & Booking Confirmation Modal */}
      {contractModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-purple-100 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-l from-purple-900 to-indigo-900 p-4 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base">تم اعتماد الحجز وتوليد العقد المعتمد</h4>
                <span className="text-xs text-purple-200 font-mono">
                  {contractModalData.bookingNumber}
                </span>
              </div>
              <button
                onClick={() => setContractModalData(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-slate-200 text-slate-800 whitespace-pre-wrap font-sans text-xs leading-relaxed select-text shadow-inner">
                {contractModalData.contractText}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-purple-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setContractModalData(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                إغلاق
              </button>
              <a
                href={contractModalData.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>إرسال العقد عبر واتساب للعميل</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Message Preview & Direct Link Modal */}
      {whatsAppModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-purple-100 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-200" />
                <h4 className="font-bold text-sm sm:text-base">{whatsAppModalData.title}</h4>
              </div>
              <button
                onClick={() => setWhatsAppModalData(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
              {/* Linked Customer Phone Edit in Modal */}
              <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between gap-2">
                <span className="font-bold text-emerald-950">رقم جوال العميل:</span>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    const newPhone = e.target.value;
                    setCustomerPhone(newPhone);
                    const clean = newPhone.replace(/\D/g, '').replace(/^0/, '966');
                    const newUrl = `https://wa.me/${clean}?text=${encodeURIComponent(whatsAppModalData.text)}`;
                    setWhatsAppModalData({
                      ...whatsAppModalData,
                      phone: newPhone,
                      whatsappUrl: newUrl,
                    });
                  }}
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                  className="bg-white border border-emerald-300 rounded-xl px-3 py-1.5 font-mono font-bold text-emerald-900 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-200 w-36 text-left"
                />
              </div>

              {/* Message Content Preview */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">نص الرسالة المرسلة للعميل:</span>
                <div className="bg-[#EFEAE2] p-3.5 rounded-2xl border border-slate-300 text-slate-900 whitespace-pre-wrap font-sans text-xs leading-relaxed max-h-64 overflow-y-auto select-text shadow-inner">
                  {whatsAppModalData.text}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(whatsAppModalData.text);
                  alert('تم نسخ نص الرسالة إلى الحافظة بنجاح');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>نسخ النص</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWhatsAppModalData(null)}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  إغلاق
                </button>
                <a
                  href={whatsAppModalData.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setWhatsAppModalData(null)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>فتح واتساب الآن</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Deposit Before Confirmation Modal */}
      {editingDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-purple-100 flex flex-col">
            <div className="bg-gradient-to-l from-amber-600 via-amber-700 to-yellow-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-200" />
                <h4 className="font-bold text-base">تعديل مبلغ العربون قبل تأكيد الحجز</h4>
              </div>
              <button
                onClick={() => setEditingDepositModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-amber-950">
                <p className="font-bold">صلاحية الموظف لتعديل العربون:</p>
                <p className="text-[11px] text-amber-900/80 mt-0.5">
                  يمكنك تعديل وتخصيص قيمة العربون المطلوبة من العميل قبل اعتماد الحجز النهائي، وسيتم تحديث الحسابات فورياً.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  مبلغ العربون الجديد (بالريال):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={editDepositValue}
                    onChange={(e) => setEditDepositValue(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    dir="rtl"
                    className="w-full bg-[#FAF8FD] border border-amber-300 rounded-2xl py-3 px-4 text-base font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold text-xs pointer-events-none">
                    ر.س
                  </span>
                </div>
              </div>

              {/* Quick percentage chips */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-bold block">نسب مقترحة من إجمالي الحجز ({totalPrice} ر.س):</span>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditDepositValue(Math.round(totalPrice * 0.2))}
                    className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl border border-purple-200 text-center text-[11px]"
                  >
                    20% ({Math.round(totalPrice * 0.2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditDepositValue(Math.round(totalPrice * 0.3))}
                    className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl border border-purple-200 text-center text-[11px]"
                  >
                    30% ({Math.round(totalPrice * 0.3)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditDepositValue(Math.round(totalPrice * 0.5))}
                    className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl border border-purple-200 text-center text-[11px]"
                  >
                    50% ({Math.round(totalPrice * 0.5)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditDepositValue(selectedProperty.defaultDeposit || 250)}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-center text-[11px]"
                  >
                    الافتراضي
                  </button>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-600 font-sans">المتبقي للتحصيل:</span>
                <span className="font-bold text-purple-900 text-sm">{Math.max(0, totalPrice - editDepositValue)} ر.س</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-purple-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setEditingDepositModalOpen(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  setDepositInput(editDepositValue);
                  if (selectedDates.length > 0) {
                    updateWaitingDepositAmount(selectedPropertyId, selectedDates, editDepositValue);
                  }
                  setEditingDepositModalOpen(false);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>حفظ وتحديث العربون فورياً</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
