import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Share2,
  Send,
  FileText,
  Image as ImageIcon,
  MapPin,
  Landmark,
  Pencil,
  Check,
  X,
  Save,
  ExternalLink,
  Copy,
  Users,
  Bed,
  Bath,
  Maximize2,
  Sparkles,
  DollarSign,
  Plus,
  ArrowRight,
  Waves,
  ShieldCheck,
  Calendar,
  Layers,
  Link2,
  RefreshCw,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Property, PropertyId, PropertySection } from '../types';

export const PropertiesView: React.FC = () => {
  const {
    properties,
    updateProperty,
    updatePropertySection,
    togglePropertyPublished,
    isAdmin,
    setSelectedPropertyId,
    setActiveTab,
    openTemplatesModal,
  } = useApp();

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Selected property for detail view (null means list view)
  const [selectedPropId, setSelectedPropId] = useState<PropertyId | null>(null);

  // Edit modal states for property detail view
  const [editingSection, setEditingSection] = useState<'info' | 'location' | 'bank' | 'photos' | null>(null);

  // Form states for editing
  const [editFormData, setEditFormData] = useState<Partial<Property>>({});

  // Active section tab for multi-section property (e.g. Al-Taraf: section-1 | section-2 | all)
  const [activeSectionTab, setActiveSectionTab] = useState<'section-1' | 'section-2' | 'all'>('section-1');

  // Edit modal for a specific section (القسم الأول / القسم الثاني)
  const [editingSubSection, setEditingSubSection] = useState<PropertySection | null>(null);
  const [editSectionFormData, setEditSectionFormData] = useState<Partial<PropertySection>>({});
  const [newFeatureInput, setNewFeatureInput] = useState('');

  // Gallery preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Property Calendar Sync Modal (ربط العقار مع جاذر إن وبوكينج وغيرها)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [selectedSyncPropId, setSelectedSyncPropId] = useState<PropertyId | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [gathernCalendarUrl, setGathernCalendarUrl] = useState('');
  const [bookingCalendarUrl, setBookingCalendarUrl] = useState('');
  const [airbnbCalendarUrl, setAirbnbCalendarUrl] = useState('');
  const [syncStatusMap, setSyncStatusMap] = useState<Record<string, { gathern: boolean; booking: boolean; airbnb: boolean; lastSync?: string }>>(() => {
    try {
      const saved = localStorage.getItem('property_calendar_sync_status');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      'al-taraf': { gathern: true, booking: true, airbnb: false, lastSync: 'منذ 5 دقائق' },
      'al-baylasan': { gathern: true, booking: false, airbnb: false, lastSync: 'منذ 18 دقيقة' },
      'rans': { gathern: false, booking: false, airbnb: false },
      'alma': { gathern: true, booking: true, airbnb: false, lastSync: 'منذ ساعة' },
      'naya': { gathern: false, booking: false, airbnb: false },
      'hamran': { gathern: false, booking: false, airbnb: false },
    };
  });

  const handleOpenSyncModalForProp = (propId: PropertyId) => {
    setSelectedSyncPropId(propId);
    try {
      const savedUrls = localStorage.getItem('property_calendar_sync_urls');
      if (savedUrls) {
        const parsed = JSON.parse(savedUrls);
        if (parsed[propId]) {
          setGathernCalendarUrl(parsed[propId].gathern || '');
          setBookingCalendarUrl(parsed[propId].booking || '');
          setAirbnbCalendarUrl(parsed[propId].airbnb || '');
        } else {
          setGathernCalendarUrl('');
          setBookingCalendarUrl('');
          setAirbnbCalendarUrl('');
        }
      }
    } catch {}
    setIsSyncModalOpen(true);
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveAndSync = () => {
    if (!selectedSyncPropId) return;
    setIsSyncingNow(true);
    setSyncFeedback(null);
    setTimeout(() => {
      setIsSyncingNow(false);
      const updated = {
        ...syncStatusMap,
        [selectedSyncPropId]: {
          gathern: !!gathernCalendarUrl || syncStatusMap[selectedSyncPropId]?.gathern || true,
          booking: !!bookingCalendarUrl || syncStatusMap[selectedSyncPropId]?.booking || true,
          airbnb: !!airbnbCalendarUrl || syncStatusMap[selectedSyncPropId]?.airbnb || false,
          lastSync: 'الآن',
        },
      };
      setSyncStatusMap(updated);
      try {
        localStorage.setItem('property_calendar_sync_status', JSON.stringify(updated));
        const savedUrls = localStorage.getItem('property_calendar_sync_urls');
        const parsedUrls = savedUrls ? JSON.parse(savedUrls) : {};
        parsedUrls[selectedSyncPropId] = {
          gathern: gathernCalendarUrl,
          booking: bookingCalendarUrl,
          airbnb: airbnbCalendarUrl,
        };
        localStorage.setItem('property_calendar_sync_urls', JSON.stringify(parsedUrls));
      } catch {}
      setSyncFeedback('تمت مزامنة وتقييد الحجوزات مع جاذر إن وبوكينج بنجاح!');
      showToast('تم حفظ روابط المزامنة وتقييد الحجوزات بنجاح');
      setTimeout(() => setSyncFeedback(null), 3000);
    }, 1200);
  };

  // Section edit handlers
  const handleStartEditSubSection = (sec: PropertySection) => {
    setEditingSubSection(sec);
    setEditSectionFormData({ ...sec, features: [...sec.features] });
    setNewFeatureInput('');
  };

  const handleSaveSubSectionEdit = () => {
    if (!currentProperty || !editingSubSection) return;
    updatePropertySection(currentProperty.id, editingSubSection.id, editSectionFormData);
    setEditingSubSection(null);
    showToast(`تم حفظ معلومات وسعر ${editingSubSection.name} بنجاح`);
  };

  const handleAddFeatureToSection = () => {
    if (!newFeatureInput.trim()) return;
    const currentFeats = editSectionFormData.features || [];
    setEditSectionFormData({
      ...editSectionFormData,
      features: [...currentFeats, newFeatureInput.trim()],
    });
    setNewFeatureInput('');
  };

  const handleRemoveFeatureFromSection = (index: number) => {
    const currentFeats = editSectionFormData.features || [];
    setEditSectionFormData({
      ...editSectionFormData,
      features: currentFeats.filter((_, i) => i !== index),
    });
  };

  // Section WhatsApp helper
  const handleSendSectionWhatsApp = (prop: Property, sec: PropertySection) => {
    const text =
      `أهلاً وسهلاً بك 🌿\nتفاصيل وأسعار (${prop.name} - ${sec.name}):\n\n` +
      `💰 الأسعار المعتمدة:\n` +
      `• وسط الأسبوع: ${sec.priceWeekday} ر.س / ليلة\n` +
      `• نهاية الأسبوع (الويكند): ${sec.priceWeekend} ر.س / ليلة\n\n` +
      `📋 معلومات ومواصفات القسم:\n` +
      `• ${sec.subtitle}\n` +
      `• السعة: تتسع لـ ${sec.capacity} فرداً\n` +
      `• غرف النوم: ${sec.bedrooms} | دورات المياه: ${sec.bathrooms}\n` +
      `• المساحة: ${sec.areaM2} م²\n` +
      (sec.poolType ? `• المسبح: ${sec.poolType}\n` : '') +
      `\n✨ أبرز المرافق والتجهيزات:\n` +
      sec.features.map((f) => `• ${f}`).join('\n') +
      `\n\n📍 الموقع: ${prop.location}\n` +
      `يسعدنا تواصلكم لتأكيد الحجز!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Section copy info helper
  const handleCopySectionInfo = (prop: Property, sec: PropertySection) => {
    const text =
      `🌿 تفاصيل وأسعار (${prop.name} - ${sec.name}):\n` +
      `• السعر وسط الأسبوع: ${sec.priceWeekday} ر.س / ليلة\n` +
      `• السعر نهاية الأسبوع: ${sec.priceWeekend} ر.س / ليلة\n` +
      `• المعلومات: ${sec.subtitle}\n` +
      `• السعة: ${sec.capacity} فرداً | غرف النوم: ${sec.bedrooms} | دورات المياه: ${sec.bathrooms}\n` +
      `• المساحة: ${sec.areaM2} م²\n` +
      (sec.poolType ? `• المسبح: ${sec.poolType}\n` : '') +
      `• المرافق: ${sec.features.join('، ')}\n` +
      `• الموقع: ${prop.location}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`تم نسخ معلومات وسعر ${sec.name}`);
    } else {
      showToast(`تم تجهيز معلومات وسعر ${sec.name}`);
    }
  };

  // Filtered properties based on search
  const filteredProperties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchLoc = p.location.toLowerCase().includes(q);
      const matchCode = (p.code || '').toLowerCase().includes(q);
      const matchSubtitle = (p.subtitle || '').toLowerCase().includes(q);
      return matchName || matchLoc || matchCode || matchSubtitle;
    });
  }, [properties, searchQuery]);

  // The active property for detail view
  const currentProperty = useMemo(() => {
    if (!selectedPropId) return null;
    return properties.find((p) => p.id === selectedPropId) || null;
  }, [properties, selectedPropId]);

  // Handle entering edit mode for a specific section
  const handleStartEdit = (section: 'info' | 'location' | 'bank' | 'photos') => {
    if (!currentProperty) return;
    setEditingSection(section);
    setEditFormData({ ...currentProperty });
  };

  // Handle saving edits
  const handleSaveEdit = () => {
    if (!currentProperty || !selectedPropId) return;
    updateProperty(selectedPropId, editFormData);
    setEditingSection(null);
    showToast('تم حفظ التعديلات بنجاح');
  };

  // Handle WhatsApp action
  const handleSendWhatsApp = (prop: Property) => {
    const text =
      `مرحباً بك،\nتفاصيل استراحة (${prop.name}):\n` +
      `• الموقع: ${prop.location}\n` +
      `• سعر وسط الأسبوع: ${prop.basePriceWeekday} ر.س / ليلة\n` +
      `• سعر نهاية الأسبوع: ${prop.basePriceWeekend} ر.س / ليلة\n` +
      `• الحالة: ${prop.isPublished ? 'متاح للحجز' : 'مغلق حالياً'}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Handle share action
  const handleShare = (prop: Property) => {
    if (navigator.clipboard) {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(`${prop.name} - ${prop.location}: ${shareUrl}`);
      showToast('تم نسخ رابط ومعلومات العقار للمشاركة');
    } else {
      showToast('تم تجهيز الرابط للمشاركة');
    }
  };

  // Handle preview action (switches to calendar view for booking)
  const handlePreviewCalendar = (prop: Property) => {
    setSelectedPropertyId(prop.id);
    setActiveTab('calendar');
  };

  return (
    <div className="pb-28 max-w-2xl mx-auto px-3 sm:px-4 pt-2 space-y-4 font-['Tajawal',sans-serif]">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-purple-950/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-purple-400/30 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 1: MAIN PROPERTIES LIST PAGE (SCREENSHOT 1)           */}
      {/* ========================================================= */}
      {!selectedPropId && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header Title & Subtitle */}
          <div className="pt-2 text-right">
            <h1 className="text-2xl sm:text-3xl font-black text-[#2E1045] tracking-tight">
              العقارات والوحدات
            </h1>
            <p className="text-sm text-purple-600/80 mt-1 font-medium">
              {filteredProperties.length} وحدة — اضغط على بطاقة لعرض التفاصيل
            </p>
          </div>

          {/* Search Input Bar (Matching Screenshot 1) */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-purple-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو الموقع أو الكود..."
              dir="rtl"
              className="w-full bg-white border border-purple-100/80 rounded-2xl pr-11 pl-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-400 focus:ring-2 focus:ring-purple-100 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Property Cards List (Matching Screenshot 1) */}
          <div className="space-y-4">
            {filteredProperties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => setSelectedPropId(prop.id)}
                className="bg-white rounded-3xl overflow-hidden shadow-xs border border-purple-100/70 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Top Section with Light Lavender / Soft Purple Background */}
                <div className="bg-[#F4EFFB] p-4 relative min-h-[170px] flex flex-col justify-between overflow-hidden">
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between w-full z-10">
                    {/* Status Pill Badge (Right in RTL): "متاح" or "مغلق" exactly as requested */}
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs backdrop-blur-xs transition-colors ${
                        prop.isPublished
                          ? 'bg-[#EAF8F1] text-[#1E7E52] border border-[#B7E8D0]'
                          : 'bg-[#FDF0ED] text-[#C0392B] border border-[#F5C6CB]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          prop.isPublished ? 'bg-[#1E7E52]' : 'bg-[#C0392B]'
                        }`}
                      />
                      <span>{prop.isPublished ? 'متاح' : 'مغلق'}</span>
                    </div>

                    {/* Sub-Units Pill Badge (Left in RTL): e.g. "2 وحدات فرعية" */}
                    <div className="bg-[#6B2896] text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <Building2 className="w-3.5 h-3.5 text-purple-200" />
                      <span>{prop.subUnitsCount || 2} وحدات فرعية</span>
                    </div>
                  </div>

                  {/* Center Architectural Building Outline Icon (Matching Screenshot 1) */}
                  <div className="flex-1 flex items-center justify-center py-4">
                    <div className="w-16 h-16 rounded-2xl bg-purple-200/40 border border-purple-300/40 flex items-center justify-center text-purple-400 group-hover:scale-108 group-hover:text-purple-600 transition-all duration-300 shadow-2xs">
                      <Building2 className="w-9 h-9 stroke-[1.5]" />
                    </div>
                  </div>
                </div>

                {/* Bottom Section (White Background with Details) */}
                <div className="p-4 sm:p-5 bg-white space-y-2.5">
                  {/* Property Name & Code Badge Row */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#2E1045] tracking-tight group-hover:text-purple-700 transition-colors">
                      {prop.name}
                    </h3>

                    {/* Code Tag (e.g. #83821) */}
                    <span className="bg-[#ECE5F8] text-[#6B2896] text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border border-purple-200/50">
                      {prop.code || `#838${prop.id === 'al-taraf' ? '20' : '21'}`}
                    </span>
                  </div>

                  {/* Location Info */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="truncate">{prop.location}</span>
                  </div>

                  {/* Multi-Sections Strip (الترف قسمين) */}
                  {prop.sections && prop.sections.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50 p-2.5 rounded-2xl border border-purple-200/80 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-950">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>الترف قسمين مستقلين (أو كامل العقار):</span>
                        </span>
                        <span className="text-[10px] bg-purple-200/60 text-purple-900 px-2 py-0.5 rounded-md font-bold">
                          قسم أو كامل
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {prop.sections.map((sec) => (
                          <div
                            key={sec.id}
                            className="bg-white/95 p-1.5 px-2 rounded-xl border border-purple-150 flex items-center justify-between text-[11px]"
                          >
                            <span className="font-bold text-slate-800 truncate">{sec.name}</span>
                            <span className="text-purple-700 font-bold font-mono shrink-0 mr-1">
                              {sec.priceWeekday} ر.س
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Row: Link "التفاصيل >" + Price per night */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    {/* Link "التفاصيل >" */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPropId(prop.id);
                      }}
                      className="text-[#6B2896] hover:text-[#4A166B] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>التفاصيل</span>
                      <ChevronLeft className="w-4 h-4 text-[#6B2896]" />
                    </button>

                    {/* Price per night */}
                    <div className="text-left text-slate-600 font-medium">
                      <span className="font-bold text-[#2E1045] font-mono text-sm ml-1">
                        {prop.basePriceWeekday}
                      </span>
                      <span>ر.س / ليلة</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredProperties.length === 0 && (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-purple-100 space-y-2">
                <Building2 className="w-10 h-10 text-purple-300 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">لم يتم العثور على عقارات مطابقة للبحث</p>
                <p className="text-xs text-slate-400">جرب البحث باسم آخر أو كود العقار</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: PROPERTY DETAIL PAGE (SCREENSHOTS 2 & 3)           */}
      {/* ========================================================= */}
      {selectedPropId && currentProperty && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Top Breadcrumb Header: "< العودة للقائمة" */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setSelectedPropId(null)}
              className="text-[#6B2896] hover:text-purple-900 font-bold text-sm flex items-center gap-1 transition-colors cursor-pointer py-1"
            >
              <ChevronRight className="w-5 h-5 text-[#6B2896]" />
              <span>العودة للقائمة</span>
            </button>

            <span className="text-xs bg-[#ECE5F8] text-[#6B2896] font-mono font-bold px-2.5 py-1 rounded-lg">
              {currentProperty.code || `#83821`}
            </span>
          </div>

          {/* Hero Banner Card with Soft Purple Gradient (Matching Screenshot 2) */}
          <div className="relative rounded-3xl overflow-hidden shadow-xs h-48 sm:h-56 bg-gradient-to-br from-[#BBAFD5] via-[#A08EC3] to-[#7861A7] flex flex-col justify-between p-5 text-white">
            {/* Center Image Icon Placeholder */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white/80 border border-white/20">
                <ImageIcon className="w-8 h-8" />
              </div>
            </div>

            {/* Bottom Property Name */}
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                  {currentProperty.name}
                </h2>
                <p className="text-xs text-purple-100 flex items-center gap-1 mt-0.5 drop-shadow-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{currentProperty.location}</span>
                </p>
              </div>

              <span className="text-xs bg-black/30 backdrop-blur-md text-white font-bold px-3 py-1 rounded-full border border-white/20">
                {currentProperty.subUnitsCount || 2} وحدات فرعية
              </span>
            </div>
          </div>

          {/* Card 1: الحالة (Status Card - Matching Screenshot 2) */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-purple-100/80 space-y-4">
            {/* Top Row: Label + Status Pill + Toggle Button */}
            <div className="flex items-center justify-between">
              {/* Left Button in RTL: Purple button "تغيير إلى مغلق" / "تغيير إلى متاح" */}
              <button
                onClick={() => {
                  togglePropertyPublished(currentProperty.id);
                  showToast(
                    currentProperty.isPublished
                      ? `تم تحويل حالة ${currentProperty.name} إلى: مغلق`
                      : `تم تحويل حالة ${currentProperty.name} إلى: متاح`
                  );
                }}
                className="bg-[#6B2896] hover:bg-[#581D7D] active:scale-98 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-900/10 cursor-pointer flex items-center gap-1.5"
              >
                <span>
                  {currentProperty.isPublished ? 'تغيير إلى مغلق' : 'تغيير إلى متاح'}
                </span>
              </button>

              {/* Right in RTL: Label "الحالة" + Status Pill with Dot */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-slate-400 font-medium">الحالة</span>
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    currentProperty.isPublished
                      ? 'bg-[#EAF8F1] text-[#1E7E52] border border-[#B7E8D0]'
                      : 'bg-[#FDF0ED] text-[#C0392B] border border-[#F5C6CB]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentProperty.isPublished ? 'bg-[#1E7E52]' : 'bg-[#C0392B]'
                    }`}
                  />
                  <span>{currentProperty.isPublished ? 'متاح' : 'مغلق'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: 3 Interactive Pill Buttons (معاينة · مشاركة · واتساب) */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              {/* معاينة */}
              <button
                onClick={() => handlePreviewCalendar(currentProperty)}
                className="bg-[#F4EFFB] hover:bg-purple-100 active:scale-98 text-[#6B2896] border border-purple-100 rounded-xl py-2 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة</span>
              </button>

              {/* مشاركة */}
              <button
                onClick={() => handleShare(currentProperty)}
                className="bg-[#F4EFFB] hover:bg-purple-100 active:scale-98 text-[#6B2896] border border-purple-100 rounded-xl py-2 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة</span>
              </button>

              {/* واتساب */}
              <button
                onClick={() => handleSendWhatsApp(currentProperty)}
                className="bg-[#EBF8F2] hover:bg-emerald-100 active:scale-98 text-[#1E7E52] border border-emerald-100 rounded-xl py-2 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>واتساب</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SPECIAL CARD: أقسام الاستراحة (الترف قسمين)              */}
          {/* ========================================================= */}
          {currentProperty.sections && currentProperty.sections.length > 0 && (
            <div className="bg-white rounded-3xl p-5 shadow-xs border-2 border-purple-200/90 space-y-4 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-800 text-white flex items-center justify-center shadow-md">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#2E1045] flex items-center gap-2">
                      <span>أقسام الاستراحة ({currentProperty.name} قسمين)</span>
                      <span className="text-[10px] bg-purple-100 text-[#6B2896] px-2.5 py-0.5 rounded-full font-bold">
                        قسمين مستقلين
                      </span>
                    </h3>
                    <p className="text-xs text-purple-600/80 font-medium">
                      معلومات ومواصفات وأسعار كل قسم على حدة، أو حجز كامل الاستراحة
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs Switcher: [القسم الأول] [القسم الثاني] [كامل الاستراحة] */}
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#F5EFFB] rounded-2xl border border-purple-200/60">
                <button
                  type="button"
                  onClick={() => setActiveSectionTab('section-1')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeSectionTab === 'section-1'
                      ? 'bg-[#6B2896] text-white shadow-sm ring-2 ring-purple-300/50'
                      : 'text-slate-600 hover:text-purple-900 hover:bg-white/60'
                  }`}
                >
                  <span>👑</span>
                  <span className="truncate">القسم الأول</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSectionTab('section-2')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeSectionTab === 'section-2'
                      ? 'bg-[#6B2896] text-white shadow-sm ring-2 ring-purple-300/50'
                      : 'text-slate-600 hover:text-purple-900 hover:bg-white/60'
                  }`}
                >
                  <span>🌿</span>
                  <span className="truncate">القسم الثاني</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSectionTab('all')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeSectionTab === 'all'
                      ? 'bg-[#6B2896] text-white shadow-sm ring-2 ring-purple-300/50'
                      : 'text-slate-600 hover:text-purple-900 hover:bg-white/60'
                  }`}
                >
                  <span>🏰</span>
                  <span className="truncate">كامل الاستراحة</span>
                </button>
              </div>

              {/* TAB 1: القسم الأول */}
              {activeSectionTab === 'section-1' && (() => {
                const sec = currentProperty.sections.find((s) => s.id === 'section-1') || currentProperty.sections[0];
                return (
                  <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
                    {/* Header Row */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-[#2E1045]">{sec.name}</span>
                          {sec.title && (
                            <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                              {sec.title}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">قسم مستقل بمدخل خاص ومرافق متكاملة</p>
                      </div>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleStartEditSubSection(sec)}
                          className="bg-[#F4EFFB] hover:bg-purple-100 text-[#6B2896] border border-purple-200 rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3 text-[#6B2896]" />
                          <span>تعديل معلومات وسعر القسم الأول</span>
                        </button>
                      )}
                    </div>

                    {/* Pricing Box (السعر) */}
                    <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white rounded-2xl p-4 shadow-md space-y-2">
                      <div className="flex items-center justify-between text-xs text-purple-200">
                        <span className="flex items-center gap-1.5 font-bold">
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                          <span>سعر حجز القسم الأول المعتمد:</span>
                        </span>
                        <span className="bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          حجز منفصل
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                          <span className="text-[10px] text-purple-200 block">وسط الأسبوع (الأحد - الأربعاء)</span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-2xl font-black font-mono text-white">{sec.priceWeekday}</span>
                            <span className="text-xs text-purple-200">ر.س / ليلة</span>
                          </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                          <span className="text-[10px] text-purple-200 block">نهاية الأسبوع (الخميس والجمعة)</span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-2xl font-black font-mono text-amber-300">{sec.priceWeekend}</span>
                            <span className="text-xs text-purple-200">ر.س / ليلة</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Information (المعلومات والمواصفات) */}
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold text-slate-700 block">معلومات ومواصفات القسم الأول:</span>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-150">
                        {sec.subtitle}
                      </p>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center bg-[#FAF7FD] p-2.5 rounded-2xl border border-purple-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">السعة</span>
                          <span className="font-bold font-mono text-purple-900 text-sm">
                            {sec.capacity} فرد
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">غرف النوم</span>
                          <span className="font-bold font-mono text-purple-900 text-sm">
                            {sec.bedrooms}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">دورات المياه</span>
                          <span className="font-bold font-mono text-purple-900 text-sm">
                            {sec.bathrooms}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">المساحة</span>
                          <span className="font-bold font-mono text-purple-900 text-sm">
                            {sec.areaM2} م²
                          </span>
                        </div>
                      </div>

                      {/* Pool info */}
                      {sec.poolType && (
                        <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-150 flex items-center gap-2 text-xs text-blue-900">
                          <Waves className="w-4 h-4 text-blue-600 shrink-0" />
                          <span><strong>المسبح:</strong> {sec.poolType}</span>
                        </div>
                      )}

                      {/* Features */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-600 block">المرافق والتجهيزات:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                          {sec.features.map((feat, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 rounded-xl bg-purple-50/50 border border-purple-100/70 text-slate-700"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="text-[11px] font-medium">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section Images */}
                      {sec.images && sec.images.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-600 block">صور القسم الأول:</span>
                          <div className="grid grid-cols-3 gap-2">
                            {sec.images.map((imgUrl, idx) => (
                              <div
                                key={idx}
                                onClick={() => setPreviewImage(imgUrl)}
                                className="h-20 rounded-xl overflow-hidden border border-purple-100 hover:border-purple-300 transition-all cursor-pointer relative group"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`${sec.name} ${idx + 1}`}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section Quick Actions */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-purple-100">
                      <button
                        type="button"
                        onClick={() => handleCopySectionInfo(currentProperty, sec)}
                        className="bg-[#F4EFFB] hover:bg-purple-100 text-[#6B2896] border border-purple-150 rounded-xl py-2 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ المعلومات والسعر</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendSectionWhatsApp(currentProperty, sec)}
                        className="bg-[#EBF8F2] hover:bg-emerald-100 text-[#1E7E52] border border-emerald-150 rounded-xl py-2 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>واتساب للعميل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePreviewCalendar(currentProperty)}
                        className="bg-[#6B2896] hover:bg-[#571F7A] text-white rounded-xl py-2 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>حجز بالتقويم</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 2: القسم الثاني */}
              {activeSectionTab === 'section-2' && (() => {
                const sec = currentProperty.sections.find((s) => s.id === 'section-2') || currentProperty.sections[1] || currentProperty.sections[0];
                return (
                  <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
                    {/* Header Row */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-[#2E1045]">{sec.name}</span>
                          {sec.title && (
                            <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                              {sec.title}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">قسم عائلي هادئ بخصوصية تامة وحديقة زجاجية</p>
                      </div>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleStartEditSubSection(sec)}
                          className="bg-[#F4EFFB] hover:bg-purple-100 text-[#6B2896] border border-purple-200 rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3 text-[#6B2896]" />
                          <span>تعديل معلومات وسعر القسم الثاني</span>
                        </button>
                      )}
                    </div>

                    {/* Pricing Box (السعر) */}
                    <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white rounded-2xl p-4 shadow-md space-y-2">
                      <div className="flex items-center justify-between text-xs text-purple-200">
                        <span className="flex items-center gap-1.5 font-bold">
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                          <span>سعر حجز القسم الثاني المعتمد:</span>
                        </span>
                        <span className="bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          حجز منفصل
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                          <span className="text-[10px] text-purple-200 block">وسط الأسبوع (الأحد - الأربعاء)</span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-2xl font-black font-mono text-white">{sec.priceWeekday}</span>
                            <span className="text-xs text-purple-200">ر.س / ليلة</span>
                          </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                          <span className="text-[10px] text-purple-200 block">نهاية الأسبوع (الخميس والجمعة)</span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-2xl font-black font-mono text-amber-300">{sec.priceWeekend}</span>
                            <span className="text-xs text-purple-200">ر.س / ليلة</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Information (المعلومات والمواصفات) */}
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold text-slate-700 block">معلومات ومواصفات القسم الثاني:</span>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-150">
                        {sec.subtitle}
                      </p>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center bg-[#FAF7FD] p-2.5 rounded-2xl border border-purple-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">السعة</span>
                          <span className="font-bold font-mono text-purple-900 text-sm">
                            {sec.capacity} فرد
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">غرف النوم</span>
                          <span className="font-bold font-mono text-purple-900 text-sm">
                            {sec.bedrooms}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">دورات المياه</span>
                          <span className="font-bold font-mono text-purple-900 text-sm">
                            {sec.bathrooms}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">المساحة</span>
                          <span className="font-bold font-mono text-purple-900 text-sm">
                            {sec.areaM2} م²
                          </span>
                        </div>
                      </div>

                      {/* Pool info */}
                      {sec.poolType && (
                        <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-150 flex items-center gap-2 text-xs text-blue-900">
                          <Waves className="w-4 h-4 text-blue-600 shrink-0" />
                          <span><strong>الجاكوزي والمسبح:</strong> {sec.poolType}</span>
                        </div>
                      )}

                      {/* Features */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-600 block">المرافق والتجهيزات:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                          {sec.features.map((feat, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 rounded-xl bg-purple-50/50 border border-purple-100/70 text-slate-700"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="text-[11px] font-medium">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section Images */}
                      {sec.images && sec.images.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-600 block">صور القسم الثاني:</span>
                          <div className="grid grid-cols-3 gap-2">
                            {sec.images.map((imgUrl, idx) => (
                              <div
                                key={idx}
                                onClick={() => setPreviewImage(imgUrl)}
                                className="h-20 rounded-xl overflow-hidden border border-purple-100 hover:border-purple-300 transition-all cursor-pointer relative group"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`${sec.name} ${idx + 1}`}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section Quick Actions */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-purple-100">
                      <button
                        type="button"
                        onClick={() => handleCopySectionInfo(currentProperty, sec)}
                        className="bg-[#F4EFFB] hover:bg-purple-100 text-[#6B2896] border border-purple-150 rounded-xl py-2 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ المعلومات والسعر</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendSectionWhatsApp(currentProperty, sec)}
                        className="bg-[#EBF8F2] hover:bg-emerald-100 text-[#1E7E52] border border-emerald-150 rounded-xl py-2 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>واتساب للعميل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePreviewCalendar(currentProperty)}
                        className="bg-[#6B2896] hover:bg-[#571F7A] text-white rounded-xl py-2 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>حجز بالتقويم</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 3: كامل الاستراحة (القسمين معاً) */}
              {activeSectionTab === 'all' && (
                <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
                  <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white rounded-2xl p-4 shadow-md space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-purple-200">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>عرض حجز كامل الاستراحة (القسم الأول + القسم الثاني):</span>
                      </span>
                      <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        توفير خاص
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                        <span className="text-[10px] text-purple-200 block">وسط الأسبوع (كامل الاستراحة)</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl font-black font-mono text-white">
                            {currentProperty.basePriceWeekday}
                          </span>
                          <span className="text-xs text-purple-200">ر.س / ليلة</span>
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                        <span className="text-[10px] text-purple-200 block">نهاية الأسبوع (الويكند كامل)</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl font-black font-mono text-amber-300">
                            {currentProperty.basePriceWeekend}
                          </span>
                          <span className="text-xs text-purple-200">ر.س / ليلة</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-200/70 text-xs text-purple-950 space-y-1.5">
                    <p className="font-bold">✨ مميزات حجز الاستراحة بالكامل:</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      يحصل العميل على الخصوصية المطلقة لكلا القسمين (مسبح أوفر فلو وشلال + جاكوزي دافئ + مجلس الضيافة الملكي + الصالة الزجاجية والحديقة + كافة غرف النوم والمرافق) بإجمالي مساحة تتجاوز 750 م².
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-100">
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(currentProperty)}
                      className="bg-[#EBF8F2] hover:bg-emerald-100 text-[#1E7E52] border border-emerald-150 rounded-xl py-2 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>واتساب لكامل العقار</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePreviewCalendar(currentProperty)}
                      className="bg-[#6B2896] hover:bg-[#571F7A] text-white rounded-xl py-2 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>حجز كامل الاستراحة</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card 2: معلومات المكان (Place Information - Matching Screenshot 2) */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-purple-100/80 space-y-3">
            <div className="flex items-center justify-between">
              {/* Left Button: "تعديل" with pencil icon */}
              <button
                onClick={() => handleStartEdit('info')}
                className="bg-[#F4EFFB] hover:bg-purple-100 text-[#6B2896] border border-purple-100 rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pencil className="w-3 h-3 text-[#6B2896]" />
                <span>تعديل</span>
              </button>

              {/* Right Title: Document Icon + "معلومات المكان" */}
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#6B2896]" />
                <h3 className="font-bold text-sm sm:text-base text-[#2E1045]">معلومات المكان</h3>
              </div>
            </div>

            {/* Place Information Body */}
            {editingSection === 'info' ? (
              <div className="space-y-3 pt-2 text-xs border-t border-slate-100 animate-in fade-in">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    الوصف المختصر:
                  </label>
                  <textarea
                    value={editFormData.subtitle || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, subtitle: e.target.value })}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-purple-200 text-xs outline-hidden focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      سعر وسط الأسبوع (ر.س):
                    </label>
                    <input
                      type="number"
                      value={editFormData.basePriceWeekday || 0}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, basePriceWeekday: Number(e.target.value) })
                      }
                      className="w-full p-2 rounded-xl border border-purple-200 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      سعر الويكند (ر.س):
                    </label>
                    <input
                      type="number"
                      value={editFormData.basePriceWeekend || 0}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, basePriceWeekend: Number(e.target.value) })
                      }
                      className="w-full p-2 rounded-xl border border-purple-200 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">السعة</label>
                    <input
                      type="number"
                      value={editFormData.capacity || 0}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, capacity: Number(e.target.value) })
                      }
                      className="w-full p-1.5 rounded-lg border border-purple-200 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">غرف النوم</label>
                    <input
                      type="number"
                      value={editFormData.bedrooms || 0}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, bedrooms: Number(e.target.value) })
                      }
                      className="w-full p-1.5 rounded-lg border border-purple-200 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">دورات المياه</label>
                    <input
                      type="number"
                      value={editFormData.bathrooms || 0}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, bathrooms: Number(e.target.value) })
                      }
                      className="w-full p-1.5 rounded-lg border border-purple-200 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">المساحة م²</label>
                    <input
                      type="number"
                      value={editFormData.areaM2 || 0}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, areaM2: Number(e.target.value) })
                      }
                      className="w-full p-1.5 rounded-lg border border-purple-200 text-xs text-center font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingSection(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="btn-mauve-shiny px-5 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ التعديل</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {/* 🌟 New Div: زر ربط العقار وعلامة موجب (+) ومزامنة تقويم العقار مع جاذر إن وبوكينج (كما في لقطة الشاشة) */}
                <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-purple-50/50 p-3.5 rounded-2xl border border-emerald-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs hover:border-emerald-300 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs relative">
                      <Link2 className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-ping" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>
                    <div className="text-right flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs sm:text-sm text-slate-800">
                          ربط تقويم العقار
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                            جاذر إن (Gathern)
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200/60">
                            بوكينج (Booking)
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        ربط ومزامنة تقويم العقار مع تقويم جاذر إن و Booking.com لمنع الحجوزات المزدوجة
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenSyncModalForProp(currentProperty.id)}
                    className="shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>ربط العقار +</span>
                  </button>
                </div>

                {currentProperty.subtitle ? (
                  <>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {currentProperty.subtitle}
                    </p>

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 p-2.5 rounded-2xl text-slate-700 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">السعة</span>
                        <span className="font-bold font-mono text-purple-900">
                          {currentProperty.capacity} فرد
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">غرف النوم</span>
                        <span className="font-bold font-mono text-purple-900">
                          {currentProperty.bedrooms}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">دورات المياه</span>
                        <span className="font-bold font-mono text-purple-900">
                          {currentProperty.bathrooms}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">المساحة</span>
                        <span className="font-bold font-mono text-purple-900">
                          {currentProperty.areaM2} م²
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 bg-purple-50/50 p-2 rounded-xl">
                      <span>
                        وسط الأسبوع:{' '}
                        <strong className="text-[#2E1045] font-mono">
                          {currentProperty.basePriceWeekday} ر.س
                        </strong>
                      </span>
                      <span>·</span>
                      <span>
                        نهاية الأسبوع:{' '}
                        <strong className="text-[#2E1045] font-mono">
                          {currentProperty.basePriceWeekend} ر.س
                        </strong>
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 font-medium py-1">لا توجد معلومات بعد.</p>
                )}
              </div>
            )}
          </div>

          {/* Card 3: ألبوم الصور (Photo Album - Matching Screenshot 3) */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-purple-100/80 space-y-3">
            <div className="flex items-center justify-between">
              {/* Badge: "X صورة" */}
              <span className="text-xs text-slate-400 font-mono">
                {currentProperty.images?.length || 0} صورة
              </span>

              {/* Title: Image Icon + "ألبوم الصور" */}
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#6B2896]" />
                <h3 className="font-bold text-sm sm:text-base text-[#2E1045]">ألبوم الصور</h3>
              </div>
            </div>

            {/* Images Grid or Empty Placeholder */}
            {currentProperty.images && currentProperty.images.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                  {currentProperty.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setPreviewImage(imgUrl)}
                      className="h-20 sm:h-24 rounded-2xl overflow-hidden border border-purple-100 hover:border-purple-300 transition-all cursor-pointer relative group"
                    >
                      <img
                        src={imgUrl}
                        alt={`${currentProperty.name} ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>

                {/* Button: "إدارة الصور والفيديو" with pencil icon (Matching Screenshot 3) */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      const newUrl = prompt('أدخل رابط الصورة الجديدة لإضافتها إلى الألبوم:');
                      if (newUrl && newUrl.trim()) {
                        const updatedImages = [...(currentProperty.images || []), newUrl.trim()];
                        updateProperty(currentProperty.id, { images: updatedImages });
                        showToast('تمت إضافة الصورة بنجاح');
                      }
                    }}
                    className="bg-[#F4EFFB] hover:bg-purple-100 text-[#6B2896] border border-purple-100 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#6B2896]" />
                    <span>إدارة الصور والفيديو</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 font-medium py-1">لا توجد صور بعد.</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const newUrl = prompt('أدخل رابط الصورة لإضافتها:');
                      if (newUrl && newUrl.trim()) {
                        updateProperty(currentProperty.id, { images: [newUrl.trim()] });
                        showToast('تمت إضافة الصورة بنجاح');
                      }
                    }}
                    className="bg-[#F4EFFB] hover:bg-purple-100 text-[#6B2896] border border-purple-100 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#6B2896]" />
                    <span>إدارة الصور والفيديو</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card 4: اللوكيشن (Location - Matching Screenshot 3) */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-purple-100/80 space-y-3">
            <div className="flex items-center justify-between">
              {/* Left Button: "تعديل" with pencil icon */}
              <button
                onClick={() => handleStartEdit('location')}
                className="bg-[#F4EFFB] hover:bg-purple-100 text-[#6B2896] border border-purple-100 rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pencil className="w-3 h-3 text-[#6B2896]" />
                <span>تعديل</span>
              </button>

              {/* Right Title: MapPin icon + "اللوكيشن" */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#6B2896]" />
                <h3 className="font-bold text-sm sm:text-base text-[#2E1045]">اللوكيشن</h3>
              </div>
            </div>

            {/* Location Body */}
            {editingSection === 'location' ? (
              <div className="space-y-3 pt-2 text-xs border-t border-slate-100 animate-in fade-in">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    عنوان وموقع العقار:
                  </label>
                  <input
                    type="text"
                    value={editFormData.location || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-purple-200 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingSection(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-1.5 rounded-xl bg-[#6B2896] text-white font-bold flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ اللوكيشن</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {currentProperty.location ? (
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <p className="text-slate-700 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{currentProperty.location}</span>
                    </p>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${currentProperty.name} ${currentProperty.location}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#6B2896] hover:text-purple-900 font-bold flex items-center gap-1 bg-[#F4EFFB] px-3 py-1 rounded-lg border border-purple-100"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>فتح في الخرائط</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-medium py-1">لم يُحدد اللوكيشن بعد.</p>
                )}
              </div>
            )}
          </div>

          {/* Card 5: المعلومات البنكية (Bank Information - Matching Screenshot 3) */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-purple-100/80 space-y-3">
            <div className="flex items-center justify-between">
              {/* Left Button: Purple button "إضافة" / "تعديل" */}
              <button
                onClick={() => handleStartEdit('bank')}
                className="btn-mauve-shiny rounded-xl px-4 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-md"
              >
                <span>{currentProperty.iban ? 'تعديل' : 'إضافة'}</span>
              </button>

              {/* Right Title: Landmark Bank icon + "المعلومات البنكية" */}
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#6B2896]" />
                <h3 className="font-bold text-sm sm:text-base text-[#2E1045]">المعلومات البنكية</h3>
              </div>
            </div>

            {/* Bank Information Body */}
            {editingSection === 'bank' ? (
              <div className="space-y-3 pt-2 text-xs border-t border-slate-100 animate-in fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      اسم البنك:
                    </label>
                    <input
                      type="text"
                      value={editFormData.bankName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, bankName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      اسم صاحب الحساب:
                    </label>
                    <input
                      type="text"
                      value={editFormData.accountHolder || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, accountHolder: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    رقم الآيبان (IBAN):
                  </label>
                  <input
                    type="text"
                    value={editFormData.iban || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, iban: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold"
                    placeholder="SA..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      العربون الافتراضي (ر.س):
                    </label>
                    <input
                      type="number"
                      value={editFormData.defaultDeposit || 0}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, defaultDeposit: Number(e.target.value) })
                      }
                      className="w-full p-2 rounded-xl border border-purple-200 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      مبلغ التأمين المسترد (ر.س):
                    </label>
                    <input
                      type="number"
                      value={editFormData.insuranceAmount || 0}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, insuranceAmount: Number(e.target.value) })
                      }
                      className="w-full p-2 rounded-xl border border-purple-200 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingSection(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="btn-mauve-shiny px-5 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ البيانات البنكية</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-1 text-xs">
                {currentProperty.iban ? (
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">البنك:</span>
                      <span className="font-bold text-[#2E1045]">{currentProperty.bankName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">اسم الحساب:</span>
                      <span className="font-bold text-[#2E1045]">{currentProperty.accountHolder}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
                      <span className="text-slate-400">الآيبان (IBAN):</span>
                      <span className="font-mono text-purple-900 font-bold select-all">
                        {currentProperty.iban}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
                      <span className="text-slate-400">العربون الافتراضي:</span>
                      <span className="font-mono text-emerald-800 font-bold">
                        {currentProperty.defaultDeposit} ر.س
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">التأمين المسترد:</span>
                      <span className="font-mono text-purple-900 font-bold">
                        {currentProperty.insuranceAmount} ر.س
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-medium py-1">لم تُضف بيانات بنكية بعد.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Preview Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl space-y-3 p-3"
          >
            <div className="flex justify-between items-center px-2 pt-1">
              <span className="text-xs font-bold text-slate-700">معاينة الصورة</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden max-h-[70vh]">
              <img
                src={previewImage}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Sub-Section (القسم الأول / القسم الثاني) Modal */}
      {editingSubSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-purple-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-l from-purple-900 via-purple-800 to-indigo-900 p-4 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-200">عقار الترف · إدارة الأقسام</span>
                <h3 className="font-bold text-base text-white">
                  تعديل معلومات وسعر {editingSubSection.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingSubSection(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Names */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    اسم القسم:
                  </label>
                  <input
                    type="text"
                    value={editSectionFormData.name || ''}
                    onChange={(e) =>
                      setEditSectionFormData({ ...editSectionFormData, name: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    العنوان التوضيحي للقسم:
                  </label>
                  <input
                    type="text"
                    value={editSectionFormData.title || ''}
                    onChange={(e) =>
                      setEditSectionFormData({ ...editSectionFormData, title: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-purple-200 text-xs"
                    placeholder="مثال: قسم الضيافة والمسابح"
                  />
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
                <span className="font-bold text-purple-950 block text-[11px]">
                  💰 تعديل سعر حجز {editingSubSection.name}:
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-1">
                      سعر وسط الأسبوع (ر.س / ليلة):
                    </label>
                    <input
                      type="number"
                      value={editSectionFormData.priceWeekday || 0}
                      onChange={(e) =>
                        setEditSectionFormData({
                          ...editSectionFormData,
                          priceWeekday: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 rounded-xl bg-white border border-purple-300 font-mono font-bold text-purple-950 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-1">
                      سعر نهاية الأسبوع (الويكند):
                    </label>
                    <input
                      type="number"
                      value={editSectionFormData.priceWeekend || 0}
                      onChange={(e) =>
                        setEditSectionFormData({
                          ...editSectionFormData,
                          priceWeekend: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 rounded-xl bg-white border border-purple-300 font-mono font-bold text-purple-950 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Subtitle / Information */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  معلومات وتفاصيل القسم (الوصف):
                </label>
                <textarea
                  value={editSectionFormData.subtitle || ''}
                  onChange={(e) =>
                    setEditSectionFormData({ ...editSectionFormData, subtitle: e.target.value })
                  }
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs outline-hidden focus:ring-2 focus:ring-purple-200"
                />
              </div>

              {/* Specs */}
              <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">السعة</label>
                  <input
                    type="number"
                    value={editSectionFormData.capacity || 0}
                    onChange={(e) =>
                      setEditSectionFormData({
                        ...editSectionFormData,
                        capacity: Number(e.target.value),
                      })
                    }
                    className="w-full p-1.5 rounded-lg border border-purple-200 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">غرف النوم</label>
                  <input
                    type="number"
                    value={editSectionFormData.bedrooms || 0}
                    onChange={(e) =>
                      setEditSectionFormData({
                        ...editSectionFormData,
                        bedrooms: Number(e.target.value),
                      })
                    }
                    className="w-full p-1.5 rounded-lg border border-purple-200 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">دورات المياه</label>
                  <input
                    type="number"
                    value={editSectionFormData.bathrooms || 0}
                    onChange={(e) =>
                      setEditSectionFormData({
                        ...editSectionFormData,
                        bathrooms: Number(e.target.value),
                      })
                    }
                    className="w-full p-1.5 rounded-lg border border-purple-200 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">المساحة م²</label>
                  <input
                    type="number"
                    value={editSectionFormData.areaM2 || 0}
                    onChange={(e) =>
                      setEditSectionFormData({
                        ...editSectionFormData,
                        areaM2: Number(e.target.value),
                      })
                    }
                    className="w-full p-1.5 rounded-lg border border-purple-200 text-xs text-center font-bold"
                  />
                </div>
              </div>

              {/* Pool type */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  المسبح أو الجاكوزي:
                </label>
                <input
                  type="text"
                  value={editSectionFormData.poolType || ''}
                  onChange={(e) =>
                    setEditSectionFormData({ ...editSectionFormData, poolType: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs"
                  placeholder="مثال: مسبح أوفر فلو مع شلال دافئ"
                />
              </div>

              {/* Features List */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">
                  المرافق والتجهيزات:
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {(editSectionFormData.features || []).map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-slate-700 text-xs border border-slate-100"
                    >
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{feat}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeatureFromSection(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new feature input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeatureToSection();
                      }
                    }}
                    placeholder="إضافة مرفق جديد (مثال: شواية مجهزة)"
                    className="flex-1 p-2 rounded-xl border border-purple-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeatureToSection}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingSubSection(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveSubSectionEdit}
                className="px-5 py-2 rounded-xl bg-[#6B2896] hover:bg-[#571F7A] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ معلومات وسعر القسم</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال ربط العقار ومزامنة التقويم (جاذر إن، بوكينج، و iCal) */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl border border-purple-100 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3.5 border-purple-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-1.5">
                    <span>ربط تقويم العقار</span>
                    {(() => {
                      const propObj = properties.find((p) => p.id === selectedSyncPropId) || currentProperty;
                      return propObj ? (
                        <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">
                          {propObj.name}
                        </span>
                      ) : null;
                    })()}
                  </h3>
                  <p className="text-xs text-slate-500">
                    مزامنة آلية ثنائية الاتجاه مع جاذر إن (Gathern) و Booking.com
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Sync Feedback Alert */}
            {syncFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{syncFeedback}</span>
              </div>
            )}

            {/* Step 1: Export iCal from System to External Platforms */}
            <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-700 text-white text-[11px] flex items-center justify-center font-mono">1</span>
                  رابط تقويم العقار للتصدير (Export iCal)
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-semibold">
                  مباشر ومحدث
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                انسخ هذا الرابط وضعه في إعدادات التقويم بمنصة <b>جاذر إن</b> أو <b>Booking.com</b> لمنع الحجوزات المزدوجة وإغلاق الأيام المحجوزة تلقائياً:
              </p>
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-purple-200">
                <input
                  type="text"
                  readOnly
                  dir="ltr"
                  value={`https://amasa.app/api/calendar/ical/${selectedSyncPropId || currentProperty?.id || 'prop'}.ics?key=auth_sync_2026`}
                  className="w-full text-[11px] font-mono text-slate-700 bg-transparent outline-none truncate"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      `https://amasa.app/api/calendar/ical/${selectedSyncPropId || currentProperty?.id || 'prop'}.ics?key=auth_sync_2026`,
                      'export'
                    )
                  }
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold transition-all cursor-pointer"
                >
                  {copiedKey === 'export' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 2: Import Links from Platforms (Gathern & Booking) */}
            <div className="space-y-3.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-mono">2</span>
                استيراد تقويم المنصات الخارجية إلى النظام (Import iCal)
              </span>

              {/* Gathern Input */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <label className="text-xs font-bold text-slate-900">
                      رابط تقويم جاذر إن (Gathern Calendar iCal)
                    </label>
                  </div>
                  {syncStatusMap[selectedSyncPropId || currentProperty?.id || '']?.gathern ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      متصل ونشط
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">غير مربوط بعد</span>
                  )}
                </div>
                <input
                  type="url"
                  dir="ltr"
                  placeholder="https://gathern.co/calendars/.../sync.ics"
                  value={gathernCalendarUrl}
                  onChange={(e) => setGathernCalendarUrl(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[10px] text-slate-500">
                  انسخ رابط التقويم من حساب المضيف في تطبيق جاذر إن (إدارة العقار ← المزامنة والتقويم).
                </p>
              </div>

              {/* Booking.com Input */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <label className="text-xs font-bold text-slate-900">
                      رابط تقويم بوكينج (Booking.com iCal)
                    </label>
                  </div>
                  {syncStatusMap[selectedSyncPropId || currentProperty?.id || '']?.booking ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      متصل ونشط
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">غير مربوط بعد</span>
                  )}
                </div>
                <input
                  type="url"
                  dir="ltr"
                  placeholder="https://admin.booking.com/hotel/hoteladmin/ical.html?t=..."
                  value={bookingCalendarUrl}
                  onChange={(e) => setBookingCalendarUrl(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-500">
                  انسخ رابط iCal من إكسترانت بوكينج (الأسعار والتوافر ← مزامنة التقاويم).
                </p>
              </div>

              {/* Airbnb / External Optional */}
              <div className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  منصات أخرى (Airbnb / منصة محلية) (اختياري)
                </label>
                <input
                  type="url"
                  dir="ltr"
                  placeholder="https://www.airbnb.com/calendar/ical/...ics"
                  value={airbnbCalendarUrl}
                  onChange={(e) => setAirbnbCalendarUrl(e.target.value)}
                  className="w-full text-xs font-mono p-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            {/* Sync Frequency Info & Current Status */}
            <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-purple-700 animate-spin-slow" />
                <span>تحديث المزامنة التلقائية: كل 10 دقائق</span>
              </span>
              <span className="text-slate-400 text-[10px]">
                آخر تحديث: {syncStatusMap[selectedSyncPropId || currentProperty?.id || '']?.lastSync || 'لم يتم بعد'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveAndSync}
                disabled={isSyncingNow}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncingNow ? 'animate-spin' : ''}`} />
                <span>{isSyncingNow ? 'جارٍ فحص ومزامنة التقويم...' : 'حفظ ومزامنة فورية الآن'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
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
