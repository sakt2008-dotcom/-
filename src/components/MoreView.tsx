import React, { useState } from 'react';
import {
  MoreHorizontal,
  Shield,
  Users,
  FileText,
  Clock,
  RotateCcw,
  HelpCircle,
  Phone,
  CheckCircle,
  FileSpreadsheet,
  Download,
  Info,
  Building,
  MessageSquare,
  Sparkles,
  User,
  UserCheck,
  Mail,
  Copy,
  Printer,
  Edit,
  DollarSign,
  Award,
  ChevronLeft,
  ExternalLink,
  Coins,
  BadgeCheck,
  X,
  CreditCard,
  Building2,
  Calendar,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Marketer } from '../types';

interface MoreViewProps {
  onOpenRoleSwitcher: () => void;
  onOpenContract: () => void;
  onOpenInstallModal?: () => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  onOpenRoleSwitcher,
  onOpenContract,
  onOpenInstallModal,
}) => {
  const {
    isAdmin,
    isGuard,
    userRole,
    currentMarketer,
    guard,
    activityLogs,
    resetAllData,
    marketers,
    bookings,
    setActiveTab,
    openTemplatesModal,
    canViewMarketers,
    canManageTemplates,
    canViewRentalContract,
    canViewActivityLogs,
    updateMarketerProfile,
  } = useApp();

  // Selected employee for profile view/modal (defaults to currentMarketer or first marketer)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    currentMarketer?.id || (marketers[0]?.id ?? 'm1')
  );

  const activeEmployee: Marketer =
    marketers.find((m) => m.id === selectedEmployeeId) ||
    currentMarketer ||
    marketers[0];

  // Modals state
  const [showEmployeeProfileModal, setShowEmployeeProfileModal] = useState(false);
  const [showContractPreviewModal, setShowContractPreviewModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showFinancialReport, setShowFinancialReport] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNationalId, setEditNationalId] = useState('');
  const [editBankName, setEditBankName] = useState('مصرف الراجحي');
  const [editBankAccount, setEditBankAccount] = useState('');
  const [editContractNumber, setEditContractNumber] = useState('');
  const [editContractDate, setEditContractDate] = useState('');
  const [editContractExpiry, setEditContractExpiry] = useState('');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const openEditModal = (emp: Marketer) => {
    setEditName(emp.name);
    setEditPhone(emp.phone);
    setEditEmail(emp.email);
    setEditNationalId(emp.nationalId || '1088923412');
    setEditBankName(emp.bankName || 'مصرف الراجحي');
    setEditBankAccount(emp.bankAccount || 'SA1280000201608010111122');
    setEditContractNumber(emp.contract?.contractNumber || `MKT-CTR-2026-${emp.code?.replace(/\D/g, '') || '101'}`);
    setEditContractDate(emp.contract?.contractDate || '2026-01-15');
    setEditContractExpiry(emp.contract?.expiryDate || '2027-01-15');
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEmployee) return;

    updateMarketerProfile(activeEmployee.id, {
      name: editName,
      phone: editPhone,
      email: editEmail,
      nationalId: editNationalId,
      bankName: editBankName,
      bankAccount: editBankAccount,
      contract: {
        contractNumber: editContractNumber,
        contractDate: editContractDate,
        expiryDate: editContractExpiry,
        commissionRatePercent: activeEmployee.contract?.commissionRatePercent || 5,
        status: activeEmployee.contract?.status || 'active',
        firstParty: activeEmployee.contract?.firstParty || 'إدارة استراحات وشاليهات أماسا (AMASA)',
        firstPartyRepresentative: activeEmployee.contract?.firstPartyRepresentative || 'الإدارة العامة والتشغيل',
        secondParty: editName,
        secondPartyPhone: editPhone,
        secondPartyEmail: editEmail,
        secondPartyNationalId: editNationalId,
        isSigned: true,
        signedDate: activeEmployee.contract?.signedDate || editContractDate,
        terms: activeEmployee.contract?.terms || [
          'الالتزام بالأسعار المعتمدة للشاليهات والاستراحات من قبل إدارة AMASA.',
          'يحق للموظف إنشاء وتعديل عقود الإيجار المعتمدة والتنسيق مع النزلاء.',
          'يحق للموظف تعديل مبلغ العربون قبل تأكيد الحجز.',
          'تصرف العمولة (5%) من كل حجز مؤكد لحساب الموظف البنكي المعتمد.',
        ],
      },
    });

    setShowEditProfileModal(false);
  };

  // Financial summary for active employee
  const employeeBookings = bookings.filter((b) => b.marketerId === activeEmployee?.id);
  const employeeTotalSales = employeeBookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((s, b) => s + b.totalPrice, 0);
  const employeeCommissions = employeeBookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((s, b) => s + b.marketerCommission, 0);
  const employeePaidCommissions = employeeBookings
    .filter((b) => b.commissionStatus === 'paid')
    .reduce((s, b) => s + b.marketerCommission, 0);
  const employeePendingCommissions = employeeCommissions - employeePaidCommissions;

  // Global Financial summary
  const totalBookingsValue = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((s, b) => s + b.totalPrice, 0);

  const totalCommissionsEarned = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((s, b) => s + b.marketerCommission, 0);

  const handleExportCSV = () => {
    const headers = ['رقم الحجز', 'العقار', 'العميل', 'رقم الجوال', 'تاريخ الدخول', 'المبلغ', 'الموظف/المسوق', 'العمولة 5%', 'حالة العمولة'];
    const rows = bookings.map((b) => [
      b.bookingNumber,
      b.propertyName,
      b.customerName,
      b.customerPhone,
      b.checkInDate,
      b.totalPrice,
      b.marketerName || 'مباشر',
      b.marketerCommission,
      b.commissionStatus,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bookings_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pb-24 max-w-3xl mx-auto px-3 sm:px-4 pt-3 space-y-4">
      {/* ============================================================== */}
      {/* 1. Current Account Card                                        */}
      {/* ============================================================== */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-800 to-indigo-900 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            {isAdmin ? (
              <Shield className="w-6 h-6 text-amber-300" />
            ) : isGuard ? (
              <Shield className="w-6 h-6 text-amber-300" />
            ) : (
              <UserCheck className="w-6 h-6 text-amber-300" />
            )}
          </div>
          <div>
            <span className="text-xs text-purple-700 font-bold block">
              الحساب والصلاحية الحالية:
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {isAdmin
                ? 'الإدارة العامة (كامل الصلاحيات)'
                : isGuard
                ? `الحارس (${guard.name})`
                : `${currentMarketer?.name} (شاشة الموظف)`}
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {isAdmin
                ? 'إشراف وتحكم شامل'
                : isGuard
                ? `جوال: ${guard.phone} · متابعة دخول وخروج اليوم فقط`
                : `كود الموظف: ${currentMarketer?.code} · عمولة 5% · عقد ساري`}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenRoleSwitcher}
          className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          تبديل الحساب
        </button>
      </div>

      {/* ============================================================== */}
      {/* 2. Employee Profile Dedicated Section (خاص بالموظف)           */}
      {/*    Always displayed prominently in employee view / More section */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-br from-white via-purple-50/40 to-indigo-50/30 rounded-3xl p-5 shadow-xs border border-purple-200/90 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-300/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header tag */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-black text-purple-950 flex items-center gap-1.5">
              <User className="w-4 h-4 text-purple-700" />
              <span>الملف الشخصي للموظف</span>
            </h3>
            <span className="text-[10px] bg-purple-700 text-white font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
              خاص بالموظف
            </span>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 text-[11px]">الموظف:</span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="bg-white border border-purple-200 text-purple-900 font-bold rounded-lg px-2 py-1 text-xs outline-hidden"
              >
                {marketers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Employee Summary Card */}
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-800 to-indigo-700 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
              {activeEmployee?.name?.charAt(0) || 'م'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-slate-900">{activeEmployee?.name}</h4>
                <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md font-mono font-bold">
                  {activeEmployee?.code}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" />
                  <span>موظف ومسوق معتمد</span>
                </span>
              </div>

              {/* Contact info quick links */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-purple-600" />
                  <a
                    href={`tel:${activeEmployee?.phone}`}
                    className="font-mono text-slate-700 hover:text-purple-800 dir-ltr"
                  >
                    {activeEmployee?.phone}
                  </a>
                  <button
                    onClick={() => handleCopy(activeEmployee?.phone || '', 'phone_quick')}
                    className="text-slate-400 hover:text-purple-700 cursor-pointer p-0.5"
                    title="نسخ رقم الجوال"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {copiedKey === 'phone_quick' && (
                    <span className="text-[9px] text-emerald-600 font-bold">تم النسخ!</span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  <span className="font-mono text-slate-700">{activeEmployee?.email}</span>
                  <button
                    onClick={() => handleCopy(activeEmployee?.email || '', 'email_quick')}
                    className="text-slate-400 hover:text-purple-700 cursor-pointer p-0.5"
                    title="نسخ إيميل الدخول"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {copiedKey === 'email_quick' && (
                    <span className="text-[9px] text-emerald-600 font-bold">تم النسخ!</span>
                  )}
                </div>
              </div>

              {/* Contract Status Banner */}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1 text-purple-900 font-semibold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  <FileText className="w-3 h-3 text-purple-700" />
                  عقد الإدارة رقم: <strong className="font-mono">{activeEmployee?.contract?.contractNumber || 'MKT-CTR-2026-101'}</strong>
                </span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  ساري وموثق إلكترونياً
                </span>
                <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  عمولة 5%
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-row md:flex-col gap-2 pt-2 md:pt-0 border-t md:border-t-0 md:border-r border-slate-100 pr-0 md:pr-4">
            <button
              onClick={() => setShowEmployeeProfileModal(true)}
              className="btn-mauve-shiny flex-1 md:flex-initial px-4 py-2 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>عرض الملف والعقد</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(activeEmployee)}
                className="flex-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
              <button
                onClick={() => setShowContractPreviewModal(true)}
                className="flex-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                title="استعراض وطباعة العقد"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>العقد</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. Quick Menu Navigation Cards                                  */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-purple-100 divide-y divide-slate-100">
        {/* Menu Item: Employee Profile (عنصر الملف الشخصي للموظف في قسم المزيد) */}
        <div
          onClick={() => setShowEmployeeProfileModal(true)}
          className="py-3.5 px-3 flex items-center justify-between hover:bg-purple-100/60 rounded-2xl cursor-pointer transition-all bg-gradient-to-r from-purple-50 via-indigo-50/40 to-amber-50/20 border border-purple-200 shadow-2xs my-1"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-800 to-indigo-900 text-white flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-purple-950 block">
                  الملف الشخصي للموظف
                </span>
                <span className="text-[10px] bg-purple-700 text-white font-bold px-2 py-0.5 rounded-full shadow-2xs">
                  خاص بالموظف
                </span>
              </div>
              <span className="text-xs text-purple-900 font-medium">
                اسم الموظف · رقم الجوال · إيميل الدخول · والعقد المبرم بين الموظف والإدارة
              </span>
            </div>
          </div>
          <span className="text-purple-800 font-bold text-xs bg-white border border-purple-200 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1">
            <span>فتح الملف</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Menu Item: Install Mobile App (تحميل التطبيق على الجوال) */}
        {onOpenInstallModal && (
          <div
            onClick={onOpenInstallModal}
            className="py-3.5 px-3 flex items-center justify-between hover:bg-amber-100/50 rounded-2xl cursor-pointer transition-all bg-gradient-to-r from-amber-50/80 via-purple-50/40 to-amber-50/60 border border-amber-200/90 shadow-2xs my-1"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-800 text-white flex items-center justify-center shadow-xs">
                <Smartphone className="w-5 h-5 text-amber-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 block">
                    تحميل وتثبيت التطبيق على الجوال
                  </span>
                  <span className="text-[10px] bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    تطبيق PWA
                  </span>
                </div>
                <span className="text-xs text-slate-600 font-medium">
                  تثبيت كـ تطبيق مستقل كامل الشاشة للأجهزة الذكية (Android & iPhone)
                </span>
              </div>
            </div>
            <span className="btn-amber-shiny text-amber-950 font-bold text-xs px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer">
              <span>تحميل</span>
              <Download className="w-3.5 h-3.5" />
            </span>
          </div>
        )}

        {/* Financial Statement & Commission Ledger (Admin & Marketers only) */}
        {!isGuard && (
          <div
            onClick={() => setShowFinancialReport(true)}
            className="py-3.5 px-2 flex items-center justify-between hover:bg-purple-50/50 rounded-xl cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block">
                  كشف حساب العمولات (5%) والتقارير المالية
                </span>
                <span className="text-xs text-slate-500">
                  جدول تدقيق مستحقات المسوقين وصرف المبالغ
                </span>
              </div>
            </div>
            <span className="text-purple-700 font-bold text-xs">عرض</span>
          </div>
        )}

        {/* Manage Message & Contract Templates (صلاحية إظهار أو إخفاء) */}
        {canManageTemplates && (
          <div
            onClick={() => openTemplatesModal('depositRequest')}
            className="py-3.5 px-3 flex items-center justify-between hover:bg-purple-100/50 rounded-2xl cursor-pointer transition-all bg-gradient-to-r from-purple-50 to-indigo-50/50 border border-purple-200/80 shadow-2xs my-1"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-xs">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 block">
                    إدارة صيغ وقوالب الرسائل والعقود
                  </span>
                </div>
                <span className="text-xs text-purple-900 font-medium">
                  تعديل صيغ: طلب العربون · تأكيد الحجز · طلب إكمال الدفع · العقد والتأمين
                </span>
              </div>
            </div>
            <span className="text-purple-800 font-bold text-xs bg-white border border-purple-200 px-3 py-1.5 rounded-xl shadow-2xs">
              تعديل القوالب
            </span>
          </div>
        )}

        {/* Contract & Rental Agreement (صلاحية إظهار أو إخفاء) */}
        {canViewRentalContract && (
          <div
            onClick={onOpenContract}
            className="py-3.5 px-2 flex items-center justify-between hover:bg-purple-50/50 rounded-xl cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block">
                  عقد إيجار الشاليه والبنود الموحدة للنزلاء
                </span>
                <span className="text-xs text-slate-500">
                  الشروط والتعليمات المعتمدة للنزلاء والتأمين
                </span>
              </div>
            </div>
            <span className="text-purple-700 font-bold text-xs">استعراض</span>
          </div>
        )}

        {/* Activity Logs (Audit Trail) (صلاحية إظهار أو إخفاء) */}
        {!isGuard && canViewActivityLogs && (
          <div
            onClick={() => setShowLogsModal(true)}
            className="py-3.5 px-2 flex items-center justify-between hover:bg-purple-50/50 rounded-xl cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block">
                  سجل العمليات والصلاحيات (Audit Log)
                </span>
                <span className="text-xs text-slate-500">
                  متابعة الحجوزات المسجلة وتعديل الصلاحيات بالوقت والتاريخ
                </span>
              </div>
            </div>
            <span className="text-purple-700 font-bold text-xs">عرض ({activityLogs.length})</span>
          </div>
        )}

        {/* Marketers Direct Jump (Admin & permitted marketers only) */}
        {!isGuard && canViewMarketers && (
          <div
            onClick={() => setActiveTab('marketers')}
            className="py-3.5 px-2 flex items-center justify-between hover:bg-purple-50/50 rounded-xl cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block">
                  لوحة بيانات أداء المسوقين والعمولات (5%)
                </span>
                <span className="text-xs text-slate-500">
                  إحصائيات الأداء، عدد الحجوزات المكتملة لكل مسوق، وتدقيق العمولات المستحقة
                </span>
              </div>
            </div>
            <span className="text-purple-700 font-bold text-xs bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
              فتح Dashboard
            </span>
          </div>
        )}
      </div>

      {/* Admin Permissions Quick Strip */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50 rounded-2xl p-3 border border-purple-200/80 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-700 shrink-0" />
            <div>
              <span className="font-bold text-purple-950 block">صلاحيات قسم المزيد للموظفين:</span>
              <span className="text-[11px] text-slate-500">
                يمكنك إظهار أو إخفاء إدارة القوالب، عقد الإيجار، أو سجل العمليات لأي موظف عبر مصفوفة الصلاحيات
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('marketers')}
            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
          >
            مصفوفة الصلاحيات
          </button>
        </div>
      )}

      {/* Property Names Footnote */}
      <div className="text-center text-xs text-slate-400 py-2">
        <span>العقارات المعتمدة: الترف · كوخ البيلسان · رانس · الما · نايا</span>
        <br />
        <span className="text-[11px]">تصميم بأسلوب تطبيق جاذر إن لحجوزات الاستراحات والشاليهات</span>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: EMPLOYEE PROFILE MODAL (الملف الشخصي للموظف)         */}
      {/* ============================================================== */}
      {showEmployeeProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-purple-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-l from-[#1f0b38] via-[#35105c] to-[#1a0833] p-5 text-white flex items-center justify-between border-b border-purple-900/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-800 to-indigo-900 border border-purple-400/30 flex items-center justify-center text-white shadow-md">
                  <UserCheck className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-white">الملف الشخصي للموظف</h3>
                    <span className="text-[10px] bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2 py-0.5 rounded-full font-bold">
                      خاص بالموظف
                    </span>
                  </div>
                  <p className="text-xs text-purple-200">
                    بيانات الموظف، رقم الجوال، إيميل الدخول، والعقد المبرم مع الإدارة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmployeeProfileModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
              {/* Admin Selector if multiple employees */}
              {isAdmin && (
                <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 flex items-center justify-between">
                  <span className="font-bold text-purple-900">اختر الموظف لعرض ملفه الشخصي:</span>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="bg-white border border-purple-300 rounded-xl px-3 py-1.5 text-xs font-bold text-purple-900 outline-hidden"
                  >
                    {marketers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Employee Top Profile Header */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50/50 rounded-2xl p-4 border border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-purple-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
                    {activeEmployee?.name?.charAt(0) || 'م'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-900">{activeEmployee?.name}</h4>
                      <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">
                        {activeEmployee?.code}
                      </span>
                    </div>
                    <span className="text-[11px] text-purple-700 font-semibold block">
                      المسمى: موظف ومسوق معتمد (AMASA) · صلاحية العقود والعربون
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      تاريخ الانضمام: {activeEmployee?.joinDate || '2026-01-10'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openEditModal(activeEmployee)}
                  className="px-3.5 py-2 bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>تعديل البيانات</span>
                </button>
              </div>

              {/* 1. Main Employee Info Grid (البيانات الشخصية وبيانات الدخول) */}
              <div>
                <h5 className="font-bold text-slate-900 text-sm mb-2.5 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-700" />
                  <span>البيانات الشخصية وبيانات الدخول للتطبيق:</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[11px] text-slate-500 block">اسم الموظف الكامل:</span>
                    <span className="text-sm font-bold text-slate-900 block">{activeEmployee?.name}</span>
                  </div>

                  {/* Phone */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">رقم جوال الموظف:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(activeEmployee?.phone || '', 'phone_modal')}
                          className="text-purple-700 hover:text-purple-900 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedKey === 'phone_modal' ? 'تم النسخ!' : 'نسخ'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 font-mono dir-ltr">
                        {activeEmployee?.phone}
                      </span>
                      <a
                        href={`tel:${activeEmployee?.phone}`}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>اتصال</span>
                      </a>
                    </div>
                  </div>

                  {/* Login Email */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">إيميل الدخول للتطبيق (Gmail):</span>
                      <button
                        onClick={() => handleCopy(activeEmployee?.email || '', 'email_modal')}
                        className="text-purple-700 hover:text-purple-900 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedKey === 'email_modal' ? 'تم النسخ!' : 'نسخ'}</span>
                      </button>
                    </div>
                    <span className="text-sm font-bold text-slate-900 font-mono block">
                      {activeEmployee?.email}
                    </span>
                  </div>

                  {/* National ID */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">رقم الهوية الوطنية:</span>
                      <button
                        onClick={() => handleCopy(activeEmployee?.nationalId || '1088923412', 'nat_modal')}
                        className="text-purple-700 hover:text-purple-900 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedKey === 'nat_modal' ? 'تم النسخ!' : 'نسخ'}</span>
                      </button>
                    </div>
                    <span className="text-sm font-bold text-slate-900 font-mono block">
                      {activeEmployee?.nationalId || '1088923412'}
                    </span>
                  </div>

                  {/* Bank Name */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[11px] text-slate-500 block">البنك المعتمد لتحويل العمولات:</span>
                    <span className="text-sm font-bold text-purple-950 block">
                      {activeEmployee?.bankName || 'مصرف الراجحي'}
                    </span>
                  </div>

                  {/* Bank Account / IBAN */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">الآيبان البنكي (IBAN):</span>
                      <button
                        onClick={() => handleCopy(activeEmployee?.bankAccount || '', 'iban_modal')}
                        className="text-purple-700 hover:text-purple-900 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedKey === 'iban_modal' ? 'تم النسخ!' : 'نسخ'}</span>
                      </button>
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-mono block break-all">
                      {activeEmployee?.bankAccount || 'SA1280000201608010111122'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Official Contract Section (العقد المبرم بين الموظف والإدارة) */}
              <div className="bg-gradient-to-br from-amber-50/70 via-purple-50/40 to-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">
                        العقد المبرم بين الموظف والإدارة
                      </h5>
                      <span className="text-[10px] text-slate-500">
                        عقد تسويق وإدارة حجوزات موثق ومعتمد رسمياً
                      </span>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>ساري وموثق إلكترونياً</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-slate-500 block">رقم العقد:</span>
                    <span className="text-xs font-bold text-purple-950 font-mono">
                      {activeEmployee?.contract?.contractNumber || 'MKT-CTR-2026-101'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-slate-500 block">تاريخ التوقيع:</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {activeEmployee?.contract?.contractDate || '2026-01-15'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-slate-500 block">تاريخ التجديد:</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {activeEmployee?.contract?.expiryDate || '2027-01-15'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-slate-500 block">نسبة العمولة:</span>
                    <span className="text-xs font-bold text-emerald-700 font-mono">5% من الحجز</span>
                  </div>
                </div>

                {/* Contract Terms List */}
                <div className="bg-white/80 p-3 rounded-xl border border-purple-100 space-y-1.5">
                  <span className="font-bold text-purple-950 block text-[11px]">
                    أبرز بنود وشروط العقد المعتمدة:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                    <li>الالتزام بأسعار الشاليهات المعتمدة وسياسة الخصومات المحددة من الإدارة.</li>
                    <li>تمكين الموظف من إنشاء وإصدار عقود الإيجار المعتمدة وتعديل مبلغ العربون قبل تأكيد الحجز.</li>
                    <li>تصرف عمولة الموظف المقررة (5%) دورياً ومباشرة لحسابه البنكي فور تأكيد الحجوزات.</li>
                    <li>الالتزام التام بسرية بيانات ومعلومات النزلاء وعدم إفشائها لأي طرف ثالث.</li>
                  </ul>
                </div>

                {/* Contract Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowContractPreviewModal(true)}
                    className="btn-mauve-shiny flex-1 py-2 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>استعراض وطباعة العقد المبرم</span>
                  </button>
                  <button
                    onClick={() => openEditModal(activeEmployee)}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-purple-900 border border-purple-200 font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>تعديل بنود العقد</span>
                  </button>
                </div>
              </div>

              {/* 3. Performance & Commissions Summary (خاص بالموظف) */}
              <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Coins className="w-4 h-4 text-purple-700" />
                    <span>كشف حساب عمولات الموظف (5%):</span>
                  </h5>
                  <span className="text-[11px] text-purple-700 font-semibold font-mono">
                    {employeeBookings.length} حجوزات منجزة
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block">إجمالي المبيعات:</span>
                    <span className="text-sm font-bold text-purple-950 font-mono">
                      {employeeTotalSales.toLocaleString()} ر.س
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                    <span className="text-[10px] text-emerald-700 block">إجمالي العمولات (5%):</span>
                    <span className="text-sm font-bold text-emerald-800 font-mono">
                      {employeeCommissions.toLocaleString()} ر.س
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                    <span className="text-[10px] text-amber-700 block">معلق للصرف:</span>
                    <span className="text-sm font-bold text-amber-800 font-mono">
                      {employeePendingCommissions.toLocaleString()} ر.س
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setShowEmployeeProfileModal(false);
                      setShowFinancialReport(true);
                    }}
                    className="text-purple-700 hover:text-purple-900 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>عرض التفاصيل الكاملة للحجوزات والعمولات</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => openEditModal(activeEmployee)}
                className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl border border-purple-200 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>تعديل بيانات الملف الشخصي</span>
              </button>

              <button
                onClick={() => setShowEmployeeProfileModal(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: OFFICIAL CONTRACT PREVIEW (استعراض العقد المبرم)      */}
      {/* ============================================================== */}
      {showContractPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-purple-100 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-l from-[#1f0b38] via-[#35105c] to-[#1a0833] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-300" />
                <div>
                  <h4 className="font-bold text-sm text-white">العقد المبرم بين الموظف والإدارة</h4>
                  <span className="text-[10px] text-purple-200 font-mono">
                    عقد رقم: {activeEmployee?.contract?.contractNumber || 'MKT-CTR-2026-101'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowContractPreviewModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs font-['Tajawal',sans-serif] bg-slate-50/50">
              {/* Printable Contract Sheet */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-800">
                {/* Header */}
                <div className="text-center border-b pb-4 border-slate-200 space-y-1">
                  <div className="inline-block px-3 py-1 bg-purple-50 text-purple-900 border border-purple-200 rounded-full font-serif font-black text-xs">
                    AMASA RESORTS & CHALETS
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    عقد اتفاقية تسويق وإدارة حجوزات الشاليهات
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    رقم العقد: {activeEmployee?.contract?.contractNumber || 'MKT-CTR-2026-101'} · تاريخ الإبرام: {activeEmployee?.contract?.contractDate || '2026-01-15'}
                  </p>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-3 bg-purple-50/60 p-3.5 rounded-xl border border-purple-100">
                  <div>
                    <span className="font-bold text-purple-950 block mb-1">الطرف الأول (الإدارة):</span>
                    <span className="text-slate-700 block">إدارة استراحات وشاليهات أماسا (AMASA)</span>
                    <span className="text-[10px] text-slate-500 block">المملكة العربية السعودية · الرياض</span>
                  </div>
                  <div>
                    <span className="font-bold text-purple-950 block mb-1">الطرف الثاني (الموظف / المسوق):</span>
                    <span className="font-bold text-slate-900 block">{activeEmployee?.name}</span>
                    <span className="text-[10px] text-slate-600 block">هوية: {activeEmployee?.nationalId || '1088923412'}</span>
                    <span className="text-[10px] text-slate-600 block dir-ltr text-right">جوال: {activeEmployee?.phone}</span>
                    <span className="text-[10px] text-slate-600 block">إيميل: {activeEmployee?.email}</span>
                  </div>
                </div>

                {/* Terms and Clauses */}
                <div className="space-y-2 text-slate-700 leading-relaxed">
                  <span className="font-bold text-purple-950 block">البنود والشروط المعتمدة:</span>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px]">
                    <li>
                      <strong>طبيعة العمل:</strong> يقوم الطرف الثاني بالتسويق لحجوزات شاليهات واستراحات أماسا، والتواصل مع النزلاء، وإصدار الحجوزات المعتمدة.
                    </li>
                    <li>
                      <strong>نسبة العمولة:</strong> يستحق الطرف الثاني عمولة ثابتة قدرها <strong>(5%)</strong> من إجمالي قيمة كل حجز مؤكد ومسجل برقم تسلسلي عبر التطبيق.
                    </li>
                    <li>
                      <strong>الصلاحيات الممنوحة:</strong> يحق للموظف إنشاء وإصدار عقود الإيجار المعتمدة وتعديل مبلغ العربون قبل الاعتماد النهائي.
                    </li>
                    <li>
                      <strong>التحويل المالي:</strong> يتم تحويل مستحقات العمولات إلى حساب الطرف الثاني البنكي في <strong>({activeEmployee?.bankName || 'مصرف الراجحي'})</strong> على الآيبان المسجل.
                    </li>
                    <li>
                      <strong>الالتزام بالأسعار والسرية:</strong> يلتزم الموظف بالأسعار المعتمدة من الإدارة وبالمحافظة على سرية بيانات النزلاء والحسابات.
                    </li>
                  </ol>
                </div>

                {/* Signatures & Stamps */}
                <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 block text-xs">توقيع وختم الإدارة:</span>
                    <div className="w-24 h-16 mx-auto border-2 border-dashed border-purple-300 rounded-xl flex flex-col items-center justify-center text-purple-800 text-[10px] bg-purple-50/50">
                      <span className="font-serif font-black text-xs text-amber-700">AMASA</span>
                      <span className="text-[9px] font-bold">معتمد إلكترونياً</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 block text-xs">توقيع الموظف / المسوق:</span>
                    <div className="w-24 h-16 mx-auto border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-700 text-[10px] bg-slate-50">
                      <span className="font-bold">{activeEmployee?.name}</span>
                      <span className="text-[9px] text-emerald-700 font-bold">✓ توقيع رقمي</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => window.print()}
                className="btn-mauve-shiny flex-1 py-2 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة أو حفظ كـ PDF</span>
              </button>
              <button
                onClick={() => setShowContractPreviewModal(false)}
                className="px-4 py-2 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: EDIT PROFILE & CONTRACT MODAL                         */}
      {/* ============================================================== */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl border border-purple-100 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 border-purple-100">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-purple-700" />
                <span>تعديل الملف الشخصي للموظف والعقد</span>
              </h4>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs overflow-y-auto flex-1 pr-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم الموظف الكامل:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم جوال الموظف:</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">إيميل الدخول (Gmail):</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الهوية الوطنية:</label>
                  <input
                    type="text"
                    value={editNationalId}
                    onChange={(e) => setEditNationalId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">البنك المعتمد:</label>
                  <select
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden"
                  >
                    <option value="مصرف الراجحي">مصرف الراجحي</option>
                    <option value="البنك الأهلي السعودي">البنك الأهلي السعودي</option>
                    <option value="بنك الإنماء">بنك الإنماء</option>
                    <option value="بنك الرياض">بنك الرياض</option>
                    <option value="بنك البلاد">بنك البلاد</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الآيبان البنكي (IBAN):</label>
                <input
                  type="text"
                  value={editBankAccount}
                  onChange={(e) => setEditBankAccount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-mono"
                />
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2">
                <span className="font-bold text-purple-900 block">بيانات العقد المبرم مع الإدارة:</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">رقم العقد:</label>
                    <input
                      type="text"
                      value={editContractNumber}
                      onChange={(e) => setEditContractNumber(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">تاريخ الإبرام:</label>
                    <input
                      type="date"
                      value={editContractDate}
                      onChange={(e) => setEditContractDate(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">تاريخ التجديد:</label>
                    <input
                      type="date"
                      value={editContractExpiry}
                      onChange={(e) => setEditContractExpiry(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="btn-mauve-shiny flex-1 py-2.5 text-white rounded-xl font-bold cursor-pointer"
                >
                  حفظ وتحديث الملف والعقد
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Activity Logs Modal                                            */}
      {/* ============================================================== */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-5 shadow-2xl border border-purple-100 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 border-purple-100">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-700" />
                <span>سجل النشاطات والعمليات</span>
              </h4>
              <button
                onClick={() => setShowLogsModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {activityLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{log.details}</p>
                  <span className="text-[10px] text-purple-700 font-semibold block">
                    بواسطة: {log.actorName} ({log.actorRole === 'admin' ? 'الإدارة' : 'موظف/مسوق'})
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowLogsModal(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Financial Statement Modal                                      */}
      {/* ============================================================== */}
      {showFinancialReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-purple-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 border-purple-100">
              <h4 className="font-bold text-base text-purple-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                <span>تقرير العمولات والمبيعات (5%)</span>
              </h4>
              <button
                onClick={() => setShowFinancialReport(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-purple-50 p-3.5 rounded-2xl">
                <div>
                  <span className="text-[10px] text-purple-700 block">إجمالي مبيعات الحجوزات:</span>
                  <span className="text-base font-bold text-purple-950 font-mono">
                    {totalBookingsValue.toLocaleString()} ر.س
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 block">إجمالي عمولات الموظفين (5%):</span>
                  <span className="text-base font-bold text-emerald-800 font-mono">
                    {totalCommissionsEarned.toLocaleString()} ر.س
                  </span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-2">تفصيل العمولات لكل موظف / مسوق:</h5>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {marketers.map((m) => {
                    const mBookings = bookings.filter((b) => b.marketerId === m.id);
                    const totalComm = mBookings.reduce((s, b) => s + b.marketerCommission, 0);
                    const paidComm = mBookings
                      .filter((b) => b.commissionStatus === 'paid')
                      .reduce((s, b) => s + b.marketerCommission, 0);
                    const pendingComm = totalComm - paidComm;

                    return (
                      <div key={m.id} className="p-3 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">{m.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {mBookings.length} حجوزات · {m.bankName}
                          </span>
                        </div>
                        <div className="text-left font-mono">
                          <span className="font-bold text-emerald-700 block">
                            {totalComm} ر.س (5%)
                          </span>
                          <span className="text-[10px] text-slate-500">
                            مدفوع: {paidComm} | معلق: {pendingComm}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={handleExportCSV}
                className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>تحميل كشف الحساب</span>
              </button>
              <button
                onClick={() => setShowFinancialReport(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs"
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
