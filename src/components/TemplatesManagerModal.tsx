import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  MessageSquare,
  Sparkles,
  Save,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  Info,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  Clock,
  Send,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MessageTemplates } from '../types';
import { DEFAULT_MESSAGE_TEMPLATES } from '../data/mockData';

export type TemplateKey = keyof MessageTemplates;

interface TemplateConfig {
  id: TemplateKey;
  title: string;
  badge: string;
  icon: React.ReactNode;
  subtitle: string;
  description: string;
  availableTags: { tag: string; label: string; sample: string }[];
}

const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: 'depositRequest',
    title: 'صيغة طلب العربون',
    badge: 'مهلة 15 دقيقة',
    icon: <DollarSign className="w-4 h-4 text-amber-500" />,
    subtitle: 'الرسالة المرسلة للعميل فور اختيار الليالي لتحويل العربون',
    description:
      'تُرسل عبر رابط واتساب برقم العميل مباشرة عند الضغط على "طلب العربون"، مع توضيح رقم الآيبان والبنك وإمهاله 15 دقيقة لتحويل العربون وتثبيت الحجز.',
    availableTags: [
      { tag: '{اسم_العميل}', label: 'اسم العميل', sample: 'علي السالم' },
      { tag: '{رقم_الجوال}', label: 'رقم الجوال', sample: '0555123456' },
      { tag: '{اسم_العقار}', label: 'اسم العقار', sample: 'كوخ البيلسان' },
      { tag: '{عدد_الليالي}', label: 'عدد الليالي', sample: '2' },
      { tag: '{مبلغ_العربون}', label: 'مبلغ العربون', sample: '250' },
      { tag: '{المبلغ_الإجمالي}', label: 'المبلغ الإجمالي', sample: '1500' },
      { tag: '{المبلغ_المتبقي}', label: 'المتبقي عند الدخول', sample: '1250' },
      { tag: '{مبلغ_التأمين}', label: 'مبلغ التأمين', sample: '300' },
      { tag: '{اسم_البنك}', label: 'اسم البنك', sample: 'مصرف الراجحي' },
      { tag: '{اسم_الحساب}', label: 'اسم الحساب المستفيد', sample: 'مؤسسة الشاليهات الفاخرة' },
      { tag: '{رقم_الآيبان}', label: 'رقم الآيبان (IBAN)', sample: 'SA0380000000608010167519' },
      { tag: '{مهلة_الدفع}', label: 'مهلة الدفع', sample: '15 دقيقة' },
    ],
  },
  {
    id: 'bookingConfirmation',
    title: 'صيغة تأكيد الحجز',
    badge: 'إشعار فوري',
    icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    subtitle: 'رسالة إشعار العميل بتأكيد الحجز بعد اعتماد إيصال التحويل',
    description:
      'تُرسل للعميل بعد إرفاق إيصال تحويل العربون والضغط على زر "تأكيد الحجز"، مع إشعار بالبيانات وتفاصيل الإقامة ورقم الحجز.',
    availableTags: [
      { tag: '{اسم_العميل}', label: 'اسم العميل', sample: 'علي السالم' },
      { tag: '{رقم_الحجز}', label: 'رقم الحجز', sample: 'BK-2026-105' },
      { tag: '{اسم_العقار}', label: 'اسم العقار', sample: 'كوخ البيلسان' },
      { tag: '{تاريخ_الدخول}', label: 'تاريخ الدخول', sample: 'الأحد 4 أكتوبر 2026' },
      { tag: '{وقت_الدخول}', label: 'وقت الدخول', sample: 'الساعة ٥ م' },
      { tag: '{تاريخ_الخروج}', label: 'تاريخ الخروج', sample: 'الإثنين 5 أكتوبر 2026' },
      { tag: '{وقت_الخروج}', label: 'وقت الخروج', sample: 'الساعة ٢ م' },
      { tag: '{عدد_الليالي}', label: 'عدد الليالي', sample: '1' },
      { tag: '{المبلغ_الإجمالي}', label: 'المبلغ الإجمالي', sample: '600' },
      { tag: '{مبلغ_العربون}', label: 'العربون المدفوع', sample: '250' },
      { tag: '{المبلغ_المتبقي}', label: 'المبلغ المتبقي', sample: '350' },
      { tag: '{مبلغ_التأمين}', label: 'مبلغ التأمين', sample: '300' },
    ],
  },
  {
    id: 'paymentCompletion',
    title: 'صيغة طلب إكمال الدفع',
    badge: 'تحصيل المتبقي',
    icon: <MessageSquare className="w-4 h-4 text-blue-500" />,
    subtitle: 'رسالة تذكير العميل بدفع المبلغ المتبقي المستحق قبل موعد الدخول',
    description:
      'تُرسل للنزيل عبر واتساب لتذكيره بسداد باقي قيمة الإقامة مع بيانات الحساب البنكي والآيبان ومبلغ التأمين المسترد.',
    availableTags: [
      { tag: '{اسم_العميل}', label: 'اسم العميل', sample: 'علي السالم' },
      { tag: '{رقم_الحجز}', label: 'رقم الحجز', sample: 'BK-2026-105' },
      { tag: '{اسم_العقار}', label: 'اسم العقار', sample: 'الترف' },
      { tag: '{تاريخ_الدخول}', label: 'تاريخ الدخول', sample: 'الأحد 4 أكتوبر 2026' },
      { tag: '{المبلغ_الإجمالي}', label: 'المبلغ الإجمالي', sample: '1200' },
      { tag: '{مبلغ_العربون}', label: 'العربون المسدد', sample: '300' },
      { tag: '{المبلغ_المتبقي}', label: 'المبلغ المتبقي للتحصيل', sample: '900' },
      { tag: '{مبلغ_التأمين}', label: 'مبلغ التأمين', sample: '500' },
      { tag: '{اسم_البنك}', label: 'اسم البنك', sample: 'مصرف الراجحي' },
      { tag: '{اسم_الحساب}', label: 'اسم الحساب المستفيد', sample: 'مؤسسة الشاليهات الفاخرة' },
      { tag: '{رقم_الآيبان}', label: 'رقم الآيبان (IBAN)', sample: 'SA0380000000608010167519' },
    ],
  },
  {
    id: 'contract',
    title: 'صيغة العقد والشروط',
    badge: 'العقد الرسمي',
    icon: <FileText className="w-4 h-4 text-purple-600" />,
    subtitle: 'عقد الإيجار وبنود الشروط والأحكام ومبلغ التأمين الإلزامي',
    description:
      'صيغة العقد النظامية المعتمدة التي تُرسل عبر رابط واتساب برقم العميل فور تأكيد الحجز، وتحتوي على مواعيد الدخول والخروج والأسعار والشروط والأحكام.',
    availableTags: [
      { tag: '{اسم_العقار}', label: 'اسم العقار', sample: 'كوخ زهرة البيلسان' },
      { tag: '{اسم_العميل}', label: 'اسم العميل', sample: 'علي' },
      { tag: '{رقم_الجوال}', label: 'رقم الجوال', sample: '0555123456' },
      { tag: '{تاريخ_الدخول}', label: 'يوم وتاريخ الدخول', sample: 'الأحد 4 اكتوبر ( 10 ) 2026 م' },
      { tag: '{وقت_الدخول}', label: 'وقت الدخول', sample: 'الساعة ٥ م' },
      { tag: '{تاريخ_الخروج}', label: 'يوم وتاريخ الخروج', sample: 'الأحد 4 اكتوبر ( 10 ) 2026 م' },
      { tag: '{وقت_الخروج}', label: 'وقت الخروج', sample: 'الساعة ٢ م' },
      { tag: '{المبلغ_الإجمالي}', label: 'المبلغ المتفق عليه', sample: '300' },
      { tag: '{مبلغ_العربون}', label: 'العربون', sample: '250' },
      { tag: '{المبلغ_المتبقي}', label: 'المتبقي', sample: '50' },
      { tag: '{مبلغ_التأمين}', label: 'التأمين', sample: '300' },
      { tag: '{شروط_العقد}', label: 'بنود الشروط والأحكام', sample: '1. يلتزم المستأجر بتسليم الاستراحة في الوقت المحدد للخروج.\n2. يُعاد مبلغ التأمين كاملاً عند التسليم سليمة خالية من أي أضرار.\n3. يتحمل المستأجر تكاليف أي أضرار تلحق بالاستراحة.\n4. العربون المدفوع غير قابل للاسترداد في حال إلغاء الحجز.' },
    ],
  },
  {
    id: 'checkoutReminder',
    title: 'صيغة تذكير الخروج',
    badge: 'إشعار المغادرة',
    icon: <Clock className="w-4 h-4 text-rose-500" />,
    subtitle: 'رسالة تذكير النزيل بموعد الخروج الساعة 2 ظهراً لتفادي الخصم من التأمين',
    description:
      'تُرسل تلقائياً عبر واتساب بالزر الأول في بطاقة دخول اليوم للشاشة الرئيسية.',
    availableTags: [
      { tag: '{اسم_العميل}', label: 'اسم العميل', sample: 'علي' },
      { tag: '{اسم_العقار}', label: 'اسم العقار', sample: 'كوخ البيلسان' },
      { tag: '{وقت_الخروج}', label: 'وقت الخروج', sample: 'الساعة 2 م' },
    ],
  },
  {
    id: 'quickResponses',
    title: 'اختصارات الردود السريعة',
    badge: 'فيديو / ردود جاهزة',
    icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
    subtitle: 'اختصارات لنصوص جاهزة تتضمن إشارة لإرسال ملفات الفيديو من جوال الموظف',
    description:
      'نصوص جاهزة للنسخ بضغطة زر، تستخدم كإشارة للعميل بأن الموظف سيقوم بإرسال ملفات الفيديو أو معلومات أخرى من جواله الشخصي مباشرة.',
    availableTags: [],
  },
];

interface TemplatesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TemplateKey;
}

export const TemplatesManagerModal: React.FC<TemplatesManagerModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'depositRequest',
}) => {
  const { messageTemplates, updateMessageTemplates, resetMessageTemplates } = useApp();

  const [activeTab, setActiveTab] = useState<TemplateKey>(initialTab);
  const [localTemplates, setLocalTemplates] = useState<MessageTemplates>(messageTemplates);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    setLocalTemplates(messageTemplates);
  }, [messageTemplates, isOpen]);

  if (!isOpen) return null;

  const currentConfig = TEMPLATE_CONFIGS.find((c) => c.id === activeTab) || TEMPLATE_CONFIGS[0];
  const currentText = (localTemplates[activeTab] || '') as string;

  const handleTextChange = (val: string) => {
    setLocalTemplates((prev) => ({
      ...prev,
      [activeTab]: val,
    }));
  };

  const handleInsertTag = (tag: string) => {
    const nextVal = currentText ? `${currentText} ${tag}` : tag;
    handleTextChange(nextVal);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const handleSave = () => {
    updateMessageTemplates(localTemplates);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetCurrent = () => {
    if (window.confirm(`هل أنت متأكد من استعادة الصيغة الافتراضية لـ "${currentConfig.title}"؟`)) {
      const defaultVal = DEFAULT_MESSAGE_TEMPLATES[activeTab];
      if (typeof defaultVal === 'string') {
        handleTextChange(defaultVal);
      }
    }
  };

  const handleResetAll = () => {
    if (window.confirm('هل تريد استعادة جميع صيغ وقوالب الرسائل والعقود إلى نصوصها الأصلية؟')) {
      resetMessageTemplates();
      setLocalTemplates(DEFAULT_MESSAGE_TEMPLATES);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  // Generate live preview by substituting variables
  const getRenderedPreview = () => {
    let result = currentText;
    if (activeTab !== 'quickResponses') {
      currentConfig.availableTags.forEach(({ tag, sample }) => {
        const reg = new RegExp(tag.replace(/[{}]/g, '\\$&'), 'g');
        result = result.replace(reg, sample);
      });
    }
    return result;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-purple-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-l from-purple-950 via-purple-900 to-indigo-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-purple-200 border border-white/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>إدارة وتعديل صيغ وقوالب الرسائل والعقود</span>
              </h3>
              <p className="text-xs text-purple-200 mt-0.5">
                تخصيص نصوص رسائل الواتساب، طلبات العربون، تأكيد الحجوزات، وبنود العقد واختصارات الردود
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Tabs Navigation */}
        <div className="bg-purple-50/70 border-b border-purple-100 px-3 sm:px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {TEMPLATE_CONFIGS.map((config) => {
            const isActive = activeTab === config.id;
            return (
              <button
                key={config.id}
                onClick={() => setActiveTab(config.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-800 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-purple-100/60 border border-purple-100'
                }`}
              >
                {config.icon}
                <span>{config.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-purple-900/60 text-purple-100' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {config.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Active Template Info Card */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50/50 p-4 rounded-2xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{currentConfig.title}</span>
                <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full font-bold">
                  {currentConfig.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {currentConfig.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleResetCurrent}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="استعادة النص الافتراضي لهذا القالب"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>استعادة الافتراضي</span>
              </button>
            </div>
          </div>

          {/* Ready-made Presets for Deposit Request (صيغ ونماذج جاهزة لطلب العربون) */}
          {activeTab === 'depositRequest' && (
            <div className="space-y-2 p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                  <span>نماذج وصيغ طلب العربون الجاهزة والمعتمدة (اضغط لتطبيق الصيغة فوراً):</span>
                </span>
                <span className="text-[10px] text-purple-700 font-bold bg-white px-2 py-0.5 rounded-full border border-purple-200">
                  3 نماذج احترافية
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                {/* Preset 1: الذهبي الشامل */}
                <button
                  type="button"
                  onClick={() =>
                    handleTextChange(`أهلاً وسهلاً بك أخي الكريم {اسم_العميل} 🌿
يسعدنا ويشرفنا اختياركم ({اسم_العقار}) لقضاء إقامتكم الكريمة لمدة {عدد_الليالي} ليلة.

⏳ *لتأكيد وتثبيت الحجز رسمياً*، نرجو التكرم بتحويل مبلغ العربون:
*{مبلغ_العربون} ريال*
خلال مهلة *{مهلة_الدفع}* من الآن لحفظ أولوية الحجز وتفادي إلغاء القفل التلقائي في النظام.

📋 *تفاصيل الحساب المالي:*
• إجمالي قيمة الحجز: {المبلغ_الإجمالي} ريال
• مبلغ العربون لتثبيت الحجز: *{مبلغ_العربون} ريال*
• المبلغ المتبقي عند الدخول: {المبلغ_المتبقي} ريال
• مبلغ التأمين المسترد: {مبلغ_التأمين} ريال

🏦 *بيانات الحساب البنكي المعتمد للتحويل:*
• اسم البنك: {اسم_البنك}
• المستفيد: {اسم_الحساب}
• رقم الآيبان (IBAN):
*{رقم_الآيبان}*

📸 فضلاً إرسال صورة إشعار التحويل البنكي هنا فور السداد لاعتماد العقد ومشاركتكم تفاصيل الدخول واللوكيشن مباشرة.
نتمنى لكم إقامة سعيدة وممتعة! ✨`)
                  }
                  className="p-3 bg-white hover:bg-purple-100/70 text-right rounded-xl border border-purple-200 transition-all text-xs space-y-1 cursor-pointer hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-purple-950 font-bold group-hover:text-purple-700">1. النموذج الذهبي الشامل</strong>
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md font-bold">الموصى به</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    صيغة راقية ومفصلة مع بنود الحساب المالي، التأمين، الآيبان، ومهلة الـ 15 دقيقة.
                  </p>
                  <span className="text-[10px] text-purple-700 font-bold block pt-1">
                    ← تطبيق هذه الصيغة
                  </span>
                </button>

                {/* Preset 2: السريع والمباشر */}
                <button
                  type="button"
                  onClick={() =>
                    handleTextChange(`أهلاً بك أخي الكريم {اسم_العميل} 🌿
يسرنا حجزك في ({اسم_العقار}) لمدة {عدد_الليالي} ليلة.
لتثبيت الحجز رسمياً، نرجو تحويل مبلغ العربون: *{مبلغ_العربون} ريال* خلال مهلة *{مهلة_الدفع}*.

🏦 بيانات الحساب البنكي:
• البنك: {اسم_البنك}
• المستفيد: {اسم_الحساب}
• الآيبان (IBAN):
*{رقم_الآيبان}*

• إجمالي الحجز: {المبلغ_الإجمالي} ريال | المتبقي عند الدخول: {المبلغ_المتبقي} ريال | التأمين: {مبلغ_التأمين} ريال.
فضلاً تزويدنا بصورة إشعار التحويل هنا فور إتمامه لاعتماد العقد وتأكيد موعدكم.`)
                  }
                  className="p-3 bg-white hover:bg-purple-100/70 text-right rounded-xl border border-purple-200 transition-all text-xs space-y-1 cursor-pointer hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-purple-950 font-bold group-hover:text-purple-700">2. النموذج السريع المباشر</strong>
                    <span className="text-[10px] bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded-md font-bold">مختصر</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    صيغة مختصرة وسريعة للواتساب تركز على الآيبان وسرعة الإرسال دون إطالة.
                  </p>
                  <span className="text-[10px] text-purple-700 font-bold block pt-1">
                    ← تطبيق هذه الصيغة
                  </span>
                </button>

                {/* Preset 3: الرسمي والمؤسسي */}
                <button
                  type="button"
                  onClick={() =>
                    handleTextChange(`إشعار حجز مؤقت ومطالبة سداد عربون 🏕️
السيد/ة: {اسم_العميل}
العقار: {اسم_العقار}
مدة الإقامة: {عدد_الليالي} ليلة

نحيطكم علماً بأنه تم حجز التواريخ مبدئياً، ولتثبيت الحجز وإصدار العقد الإلكتروني المعتمد، يُرجى سداد العربون:
*{مبلغ_العربون} ريال*
وذلك خلال مهلة *{مهلة_الدفع}* الممنوحة للنظام لتفادي إلغاء الحجز تلقائياً.

• إجمالي الحجز: {المبلغ_الإجمالي} ر.س
• العربون المستحق: {مبلغ_العربون} ر.س
• المتبقي عند الاستلام: {المبلغ_المتبقي} ر.س
• مبلغ التأمين المسترد: {مبلغ_التأمين} ر.س

💳 بيانات التحويل البنكي المعتمد:
• البنك: {اسم_البنك}
• الحساب: {اسم_الحساب}
• الآيبان: {رقم_الآيبان}

يرجى إرفاق إشعار السداد فور التحويل لاعتماد الحجز وتوثيقه.`)
                  }
                  className="p-3 bg-white hover:bg-purple-100/70 text-right rounded-xl border border-purple-200 transition-all text-xs space-y-1 cursor-pointer hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-purple-950 font-bold group-hover:text-purple-700">3. النموذج الرسمي الموثق</strong>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-md font-bold">رسمي</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    صيغة رسمية بأسلوب سند مطالبة إلكتروني مناسبة للحجوزات العائلية والمؤسسية.
                  </p>
                  <span className="text-[10px] text-purple-700 font-bold block pt-1">
                    ← تطبيق هذه الصيغة
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Variable Insertion Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-purple-700" />
                <span>المتغيرات التلقائية المتاحة (اضغط لإدراج المتغير في مكان المؤشر أو نسخه):</span>
              </label>
              {copiedTag && (
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Check className="w-3 h-3" /> تم إدراج {copiedTag}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {currentConfig.availableTags.map(({ tag, label }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-2xs hover:scale-102 cursor-pointer"
                  title={`إدراج ${label}`}
                >
                  <Copy className="w-3 h-3 text-purple-500" />
                  <span className="font-bold">{tag}</span>
                  <span className="text-[10px] text-slate-500 font-sans">({label})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Editor and Live Preview Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Editor Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">محرر نص الصيغة:</span>
                <span className="text-slate-400 font-mono">
                  {currentText.length} حرف · {currentText.split('\n').length} أسطر
                </span>
              </div>

              <textarea
                value={currentText}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={13}
                dir="rtl"
                className="w-full p-3.5 bg-white border border-purple-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 rounded-2xl text-xs text-slate-800 leading-relaxed font-sans outline-hidden shadow-2xs resize-y"
                placeholder="أدخل صيغة الرسالة هنا..."
              />
            </div>

            {/* Live WhatsApp Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>معاينة حية لشكل الرسالة على واتساب (بيانات تجريبية):</span>
                </span>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  واتساب جاهز
                </span>
              </div>

              {/* WhatsApp Mock Chat Bubble */}
              <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-slate-200 min-h-[295px] flex flex-col justify-end">
                <div className="bg-white rounded-2xl rounded-tr-xs p-3.5 shadow-xs border border-emerald-100 max-w-[95%] space-y-2 mr-auto self-start">
                  <div className="text-[11px] sm:text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans select-text">
                    {getRenderedPreview()}
                  </div>

                  <div className="text-left pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} ✓✓
                    </span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(getRenderedPreview())}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 hover:text-emerald-800 font-bold bg-white/80 hover:bg-white px-3 py-1 rounded-full border border-emerald-200 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>تجربة فتح الرسالة في تطبيق واتساب</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Guidance Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-slate-900">ملاحظات هامة حول التعديلات:</p>
              <p className="leading-relaxed">
                • يتم حفظ وتطبيق هذه التعديلات فوراً على جميع الحجوزات القادمة ولكافة المسوقين والإدارة.
                <br />
                • يمكنك دائماً تخصيص الشروط والأسعار الخاصة بكل عقار على حدة (مثل كوخ البيلسان أو الترف) من صفحة "العقار".
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-white border-t border-purple-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleResetAll}
              className="text-xs text-rose-700 hover:text-rose-900 font-bold px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط كافة القوالب</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              إغلاق
            </button>

            <button
              onClick={handleSave}
              className="btn-mauve-shiny px-6 py-2.5 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>تم حفظ التعديلات بنجاح!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ واعتماد التعديلات</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
