import React, { useState } from 'react';
import {
  MapPin,
  Image as ImageIcon,
  Navigation,
  FileText,
  X,
  Users,
  Bed,
  Bath,
  Maximize2,
  Waves,
  Sparkles,
  Check,
  ShieldCheck,
  Edit2,
  Save,
  CreditCard,
  Clock,
  Eye,
  EyeOff,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type ModalType = 'details' | 'photos' | 'location' | 'contract';

interface PropertyDetailsModalProps {
  type: ModalType | null;
  onClose: () => void;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ type, onClose }) => {
  const {
    selectedProperty,
    updateProperty,
    isAdmin,
    canCreateContract,
    togglePropertyPublished,
    openTemplatesModal,
  } = useApp();

  const [isEditingContract, setIsEditingContract] = useState(false);
  const [editedTerms, setEditedTerms] = useState<string>(
    selectedProperty.contractTerms.join('\n')
  );
  const [editedCheckInTime, setEditedCheckInTime] = useState(selectedProperty.checkInTimeText || 'الساعة ٥ م');
  const [editedCheckOutTime, setEditedCheckOutTime] = useState(selectedProperty.checkOutTimeText || 'الساعة ٢ م');
  const [editedInsurance, setEditedInsurance] = useState<number>(selectedProperty.insuranceAmount || 300);
  const [editedIban, setEditedIban] = useState(selectedProperty.iban || '');
  const [editedBank, setEditedBank] = useState(selectedProperty.bankName || 'مصرف الراجحي');
  const [modalSectionTab, setModalSectionTab] = useState<'section-1' | 'section-2' | 'all'>('section-1');

  if (!type) return null;

  const handleSaveContractSettings = () => {
    const termsArray = editedTerms
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    updateProperty(selectedProperty.id, {
      contractTerms: termsArray,
      checkInTimeText: editedCheckInTime,
      checkOutTimeText: editedCheckOutTime,
      insuranceAmount: Number(editedInsurance),
      iban: editedIban,
      bankName: editedBank,
    });
    setIsEditingContract(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-purple-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-l from-purple-900 via-purple-800 to-indigo-900 p-4 text-white flex items-center justify-between">
          <div>
            <span className="text-xs text-purple-200">{selectedProperty.name}</span>
            <h3 className="font-bold text-base text-white">
              {type === 'details' && 'معلومات ومواصفات المكان'}
              {type === 'photos' && 'ألبوم الصور والفيديو'}
              {type === 'location' && 'موقع الاستراحة (اللوكيشن)'}
              {type === 'contract' && 'عقد وبنود إيجار الاستراحة'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content based on type */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* 1. DETAILS */}
          {type === 'details' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProperty.coverImage}
                    alt={selectedProperty.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border border-purple-100"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{selectedProperty.name}</h4>
                    <p className="text-slate-500 mt-0.5">{selectedProperty.location}</p>
                    <p className="text-purple-700 font-bold font-mono mt-0.5">
                      {selectedProperty.basePriceWeekday} ر.س / ليلة
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => togglePropertyPublished(selectedProperty.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 ${
                    selectedProperty.isPublished
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border border-rose-300'
                  }`}
                >
                  {selectedProperty.isPublished ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>معروض للجميع</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                      <span>موقوف كاملاً</span>
                    </>
                  )}
                </button>
              </div>

              {/* Multi-Section Switcher (الترف قسمين) */}
              {selectedProperty.sections && selectedProperty.sections.length > 0 && (
                <div className="p-3 bg-purple-50/80 rounded-2xl border border-purple-200 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-950">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{selectedProperty.name} قسمين مستقلين:</span>
                    </span>
                    <span className="text-[10px] bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full">
                      تصفح الأقسام والأسعار
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setModalSectionTab('section-1')}
                      className={`p-2 rounded-xl text-xs font-bold transition-all ${
                        modalSectionTab === 'section-1'
                          ? 'bg-[#6B2896] text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-purple-100/50 border border-purple-150'
                      }`}
                    >
                      👑 القسم الأول
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalSectionTab('section-2')}
                      className={`p-2 rounded-xl text-xs font-bold transition-all ${
                        modalSectionTab === 'section-2'
                          ? 'bg-[#6B2896] text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-purple-100/50 border border-purple-150'
                      }`}
                    >
                      🌿 القسم الثاني
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalSectionTab('all')}
                      className={`p-2 rounded-xl text-xs font-bold transition-all ${
                        modalSectionTab === 'all'
                          ? 'bg-[#6B2896] text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-purple-100/50 border border-purple-150'
                      }`}
                    >
                      🏰 كامل الاستراحة
                    </button>
                  </div>

                  {/* Section Price Banner */}
                  {(() => {
                    const sec1 = selectedProperty.sections.find((s) => s.id === 'section-1') || selectedProperty.sections[0];
                    const sec2 = selectedProperty.sections.find((s) => s.id === 'section-2') || selectedProperty.sections[1] || sec1;
                    const activeSec = modalSectionTab === 'section-1' ? sec1 : modalSectionTab === 'section-2' ? sec2 : null;

                    if (activeSec) {
                      return (
                        <div className="bg-white p-3 rounded-xl border border-purple-200/70 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#2E1045]">{activeSec.name} — {activeSec.title || 'مواصفات مستقلة'}</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                              سعر مستقل
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{activeSec.subtitle}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                            <span className="text-slate-500">وسط الأسبوع: <strong className="text-purple-900 font-mono font-bold">{activeSec.priceWeekday} ر.س</strong></span>
                            <span className="text-slate-500">الويكند: <strong className="text-purple-900 font-mono font-bold">{activeSec.priceWeekend} ر.س</strong></span>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="bg-white p-3 rounded-xl border border-purple-200/70 space-y-1 text-xs">
                          <div className="flex items-center justify-between font-bold text-[#2E1045]">
                            <span>كامل الاستراحة (القسمين معاً)</span>
                            <span className="text-emerald-700 font-mono">{selectedProperty.basePriceWeekday} ر.س / ليلة</span>
                          </div>
                          <p className="text-slate-600 text-[11px]">يشمل القسم الأول وقسم العائلة مع كامل المرافق والمسابح والحدائق.</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}

              {/* Bank Details for Deposit */}
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-950 font-bold">
                  <CreditCard className="w-4 h-4 text-purple-700" />
                  <span>بيانات تحويل العربون الرسمية:</span>
                </div>
                <div className="text-slate-700 space-y-0.5 pt-1">
                  <p>• البنك: <strong>{selectedProperty.bankName}</strong></p>
                  <p>• المستفيد: <strong>{selectedProperty.accountHolder}</strong></p>
                  <p className="font-mono text-[11px] text-purple-900">• الآيبان: {selectedProperty.iban}</p>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">السعة</span>
                  <span className="font-bold text-purple-950 font-mono text-sm">
                    {selectedProperty.capacity} فرد
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">غرف النوم</span>
                  <span className="font-bold text-purple-950 font-mono text-sm">
                    {selectedProperty.bedrooms}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">دورات المياه</span>
                  <span className="font-bold text-purple-950 font-mono text-sm">
                    {selectedProperty.bathrooms}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">المساحة</span>
                  <span className="font-bold text-purple-950 font-mono text-sm">
                    {selectedProperty.areaM2} م²
                  </span>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <span className="font-bold text-slate-900 block mb-2">المرافق والتجهيزات:</span>
                <div className="space-y-1.5">
                  {selectedProperty.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 text-slate-700"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. PHOTOS */}
          {type === 'photos' && (
            <div className="space-y-3">
              <p className="text-slate-600">
                معرض صور حية لعقار <strong className="text-purple-900">{selectedProperty.name}</strong>:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedProperty.images.map((img, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden border border-purple-100 group">
                    <img
                      src={img}
                      alt={`${selectedProperty.name} - صورة ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. LOCATION */}
          {type === 'location' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-start gap-3">
                <Navigation className="w-5 h-5 text-purple-700 shrink-0 mt-1" />
                <div>
                  <span className="font-bold text-sm text-purple-950 block">العنوان الدقيق:</span>
                  <p className="text-slate-700 mt-1">{selectedProperty.location}</p>
                  <p className="text-slate-500 text-[11px] font-mono mt-1">
                    الإحداثيات: {selectedProperty.coordinates.lat.toFixed(4)}, {selectedProperty.coordinates.lng.toFixed(4)}
                  </p>
                </div>
              </div>

              <div className="w-full h-44 bg-slate-200 rounded-2xl relative overflow-hidden flex items-center justify-center border border-slate-300">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
                  alt="خريطة الموقع"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-purple-900/10 flex flex-col items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-purple-700 text-white flex items-center justify-center shadow-lg animate-bounce">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="bg-white/90 text-purple-950 px-3 py-1 rounded-full text-[11px] font-bold shadow-xs mt-1.5">
                    {selectedProperty.name}
                  </span>
                </div>
              </div>

              <a
                href={`https://maps.google.com/?q=${selectedProperty.coordinates.lat},${selectedProperty.coordinates.lng}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-center block transition-colors"
              >
                فتح اللوكيشن في خرائط Google
              </a>
            </div>
          )}

          {/* 4. CONTRACT (Editable as requested: "يمكن تعديل صيغة العقد من معلومات مكان الاقامة") */}
          {type === 'contract' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-2xl border border-purple-200">
                <div className="flex items-center gap-2 text-purple-900 font-bold">
                  <ShieldCheck className="w-5 h-5 text-purple-700" />
                  <span>عقد وبنود الإيجار المعتمد لعقار {selectedProperty.name}</span>
                </div>

                {(isAdmin || canCreateContract) && (
                  <button
                    onClick={() => setIsEditingContract(!isEditingContract)}
                    className="flex items-center gap-1 text-xs text-purple-800 hover:text-purple-950 font-bold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditingContract ? 'إلغاء التعديل' : 'تعديل الصيغة'}</span>
                  </button>
                )}
              </div>

              {isEditingContract ? (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-purple-200">
                  <h5 className="font-bold text-slate-800 text-xs">تعديل بنود وأوقات العقد:</h5>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">وقت الدخول:</label>
                      <input
                        type="text"
                        value={editedCheckInTime}
                        onChange={(e) => setEditedCheckInTime(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                        placeholder="الساعة ٥ م"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">وقت الخروج:</label>
                      <input
                        type="text"
                        value={editedCheckOutTime}
                        onChange={(e) => setEditedCheckOutTime(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                        placeholder="الساعة ٢ م"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">مبلغ التأمين (ريال):</label>
                      <input
                        type="number"
                        value={editedInsurance}
                        onChange={(e) => setEditedInsurance(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">البنك:</label>
                      <input
                        type="text"
                        value={editedBank}
                        onChange={(e) => setEditedBank(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">رقم الآيبان (IBAN):</label>
                    <input
                      type="text"
                      value={editedIban}
                      onChange={(e) => setEditedIban(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">
                      الشروط والأحكام (كل شرط في سطر مستقل):
                    </label>
                    <textarea
                      rows={5}
                      value={editedTerms}
                      onChange={(e) => setEditedTerms(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl leading-relaxed text-xs"
                    />
                  </div>

                  <button
                    onClick={handleSaveContractSettings}
                    className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ صيغة العقد الجديدة</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block">وقت الدخول:</span>
                      <span className="font-bold text-slate-800">{selectedProperty.checkInTimeText}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">وقت الخروج:</span>
                      <span className="font-bold text-slate-800">{selectedProperty.checkOutTimeText}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">مبلغ التأمين:</span>
                      <span className="font-bold text-purple-900 font-mono">
                        {selectedProperty.insuranceAmount} ريال
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">العربون الافتراضي:</span>
                      <span className="font-bold text-emerald-800 font-mono">
                        {selectedProperty.defaultDeposit} ريال
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 mb-1.5">الشروط والأحكام المعتمدة:</p>
                    <div className="space-y-1 text-slate-700 leading-relaxed">
                      {selectedProperty.contractTerms.map((term, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="font-mono text-purple-700 font-bold">{idx + 1}.</span>
                          <span>{term}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Jump to Global Templates Manager */}
              <div className="pt-2 border-t border-purple-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openTemplatesModal('contract');
                  }}
                  className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1.5 p-2 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>تعديل صيغ وقوالب رسائل الواتساب والعقد العامة بالكامل</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-slate-800 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
