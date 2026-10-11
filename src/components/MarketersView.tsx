import React, { useState, useMemo } from 'react';
import {
  Users,
  Shield,
  Plus,
  Percent,
  Check,
  X,
  CreditCard,
  Building2,
  Calendar,
  Lock,
  Eye,
  Edit,
  DollarSign,
  FileSpreadsheet,
  Award,
  Phone,
  Mail,
  CheckCircle2,
  TrendingUp,
  Download,
  Search,
  Filter,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Clock,
  Wallet,
  BarChart3,
  FileText,
  Coins,
  LayoutGrid,
  Printer,
  Copy,
  FileCheck,
  AlertCircle,
  Briefcase,
  IdCard,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Marketer, MarketerPermissions, Booking, MarketerContract } from '../types';

export const MarketersView: React.FC = () => {
  const {
    marketers,
    bookings,
    isAdmin,
    userRole,
    currentMarketerId,
    currentMarketer,
    updateMarketerPermissions,
    updateMarketerProfile,
    addMarketer,
    payoutAllMarketerCommissions,
    payMarketerCommission,
    switchUser,
    grantAllMarketersContractAndDepositPermissions,
  } = useApp();

  // Sub-tabs:
  // 1. 'commissions': كشف العمولات والمبالغ (خاص بالمسوق)
  // 2. 'profile': الملف الشخصي والعقد المبرم
  // 3. 'permissions': مصفوفة الصلاحيات
  const [activeSubTab, setActiveSubTab] = useState<'commissions' | 'profile' | 'permissions'>('commissions');

  // Selected marketer: defaults to logged in marketer if applicable, otherwise first marketer
  const [selectedMarketerId, setSelectedMarketerId] = useState<string>(
    userRole === 'marketer' && currentMarketerId ? currentMarketerId : marketers[0]?.id || 'm1'
  );

  // Modals state
  const [showAddMarketerModal, setShowAddMarketerModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [drilldownMarketer, setDrilldownMarketer] = useState<Marketer | null>(null);
  const [payoutModalMarketer, setPayoutModalMarketer] = useState<Marketer | null>(null);
  const [payoutSuccessMessage, setPayoutSuccessMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Search & Filter state in commissions ledger
  const [searchQuery, setSearchQuery] = useState('');
  const [commissionStatusFilter, setCommissionStatusFilter] = useState<'all' | 'ready_for_payout' | 'paid' | 'pending'>('all');
  const [showAllMarketersComparison, setShowAllMarketersComparison] = useState(false);

  // New marketer form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNationalId, setNewNationalId] = useState('');
  const [newBankAccount, setNewBankAccount] = useState('');
  const [newBankName, setNewBankName] = useState('مصرف الراجحي');

  // Edit marketer form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNationalId, setEditNationalId] = useState('');
  const [editBankAccount, setEditBankAccount] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editContractNumber, setEditContractNumber] = useState('');
  const [editContractDate, setEditContractDate] = useState('');
  const [editContractExpiry, setEditContractExpiry] = useState('');

  // Currently focused marketer
  const selectedMarketer = marketers.find((m) => m.id === selectedMarketerId) || marketers[0];

  // Open Edit Profile Modal with selected marketer data
  const handleOpenEditProfile = (m: Marketer) => {
    setEditName(m.name || '');
    setEditPhone(m.phone || '');
    setEditEmail(m.email || '');
    setEditNationalId(m.nationalId || '');
    setEditBankAccount(m.bankAccount || '');
    setEditBankName(m.bankName || 'مصرف الراجحي');
    setEditContractNumber(m.contract?.contractNumber || `MKT-CTR-2026-${m.code.replace('MK-', '')}`);
    setEditContractDate(m.contract?.contractDate || m.joinDate || '2026-01-01');
    setEditContractExpiry(m.contract?.expiryDate || '2027-01-01');
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMarketer) return;

    const updatedContract: MarketerContract = {
      contractNumber: editContractNumber,
      contractDate: editContractDate,
      expiryDate: editContractExpiry,
      commissionRatePercent: 5,
      status: selectedMarketer.contract?.status || 'active',
      firstParty: 'إدارة استراحات وشاليهات ماسة (AMASA)',
      firstPartyRepresentative: 'المدير العام التنفيذي',
      secondParty: editName,
      secondPartyPhone: editPhone,
      secondPartyEmail: editEmail,
      secondPartyNationalId: editNationalId,
      terms: selectedMarketer.contract?.terms || [
        'يستحق المسوق عمولة تسويق ثابتة قدرها 5% من القيمة الإجمالية لكل حجز مؤكد ومكتمل يتم إبرامه عبر رمزه التسويقي المعتمد.',
        'يتم تحويل العمولات المستحقة دورياً وفورياً إلى الحساب البنكي المعتمد والمثبت في هذا العقد.',
        'يلتزم المسوق بالترويج وفق سياسات وأسعار شاليهات ماسة الرسمية، والحفاظ التام على سرية وخصوصية بيانات النزلاء.',
        'يمنح المسوق صلاحية إصدار عقود الإيجار المعتمدة وتعديل مبالغ العربون المبدئي بما يخدم مصلحة التشغيل وتسهيل الحجوزات.',
      ],
      isSigned: true,
      signedDate: editContractDate,
      notes: selectedMarketer.contract?.notes || 'عقد وساطة وتسويق موثق إلكترونياً',
    };

    updateMarketerProfile(selectedMarketer.id, {
      name: editName,
      phone: editPhone,
      email: editEmail,
      nationalId: editNationalId,
      bankAccount: editBankAccount,
      bankName: editBankName,
      contract: updatedContract,
    });

    setShowEditProfileModal(false);
    setPayoutSuccessMessage(`تم تحديث الملف الشخصي والعقد للمسوق ${editName} بنجاح`);
    setTimeout(() => setPayoutSuccessMessage(null), 4000);
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // -------------------------------------------------------------
  // Comprehensive Performance & 5% Commission Statistics
  // -------------------------------------------------------------
  const marketerStatsList = useMemo(() => {
    return marketers.map((m) => {
      const allMBookings = bookings.filter((b) => b.marketerId === m.id);
      const completedBookings = allMBookings.filter((b) => b.status === 'completed');
      const activeBookings = allMBookings.filter(
        (b) => b.status === 'confirmed' || b.status === 'pending_payment' || b.status === 'waiting_deposit'
      );
      const totalSales = allMBookings
        .filter((b) => b.status !== 'cancelled')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      const completedSales = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      // Commissions (5% fixed rate)
      const totalCommission = allMBookings
        .filter((b) => b.status !== 'cancelled')
        .reduce((sum, b) => sum + (b.marketerCommission || Math.round((b.totalPrice || 0) * 0.05)), 0);

      const paidCommission = allMBookings
        .filter((b) => b.commissionStatus === 'paid')
        .reduce((sum, b) => sum + (b.marketerCommission || Math.round((b.totalPrice || 0) * 0.05)), 0);

      const readyCommission = allMBookings
        .filter((b) => b.commissionStatus === 'ready_for_payout')
        .reduce((sum, b) => sum + (b.marketerCommission || Math.round((b.totalPrice || 0) * 0.05)), 0);

      const pendingCommission = allMBookings
        .filter((b) => b.commissionStatus === 'pending')
        .reduce((sum, b) => sum + (b.marketerCommission || Math.round((b.totalPrice || 0) * 0.05)), 0);

      const totalDueCommission = readyCommission + pendingCommission;

      const completionRate =
        allMBookings.length > 0 ? Math.round((completedBookings.length / allMBookings.length) * 100) : 0;

      return {
        marketer: m,
        allBookings: allMBookings,
        completedBookings,
        activeBookings,
        totalBookingsCount: allMBookings.length,
        completedBookingsCount: completedBookings.length,
        activeBookingsCount: activeBookings.length,
        totalSales,
        completedSales,
        completionRate,
        commissionRate: m.commissionRate || 0.05,
        totalCommission,
        paidCommission,
        readyCommission,
        pendingCommission,
        totalDueCommission,
      };
    });
  }, [marketers, bookings]);

  // Selected marketer stats
  const selectedStats = useMemo(() => {
    return marketerStatsList.find((s) => s.marketer.id === selectedMarketer?.id) || marketerStatsList[0];
  }, [marketerStatsList, selectedMarketer]);

  // Bookings list for the selected marketer with filtering
  const selectedMarketerFilteredBookings = useMemo(() => {
    if (!selectedMarketer) return [];
    let list = bookings.filter((b) => b.marketerId === selectedMarketer.id);

    // Filter by commission status
    if (commissionStatusFilter !== 'all') {
      list = list.filter((b) => b.commissionStatus === commissionStatusFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.bookingNumber?.toLowerCase().includes(q) ||
          b.customerName?.toLowerCase().includes(q) ||
          b.customerPhone?.includes(q) ||
          b.propertyName?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [bookings, selectedMarketer, commissionStatusFilter, searchQuery]);

  // Export Marketer Commissions CSV
  const handleExportCommissionsCSV = () => {
    if (!selectedMarketer) return;
    const headers = [
      'رقم الحجز',
      'تاريخ الحجز',
      'اسم العميل',
      'رقم الجوال',
      'العقار',
      'تاريخ الدخول',
      'تاريخ الخروج',
      'الليالي',
      'إجمالي الحجز (ر.س)',
      'نسبة العمولة',
      'مبلغ العمولة (ر.س)',
      'حالة الحجز',
      'حالة العمولة',
    ];

    const rows = selectedMarketerFilteredBookings.map((b) => [
      b.bookingNumber,
      b.createdAt ? b.createdAt.split('T')[0] : b.checkInDate,
      b.customerName,
      b.customerPhone,
      b.propertyName,
      b.checkInDate,
      b.checkOutDate,
      b.nightsCount,
      b.totalPrice,
      '5%',
      b.marketerCommission || Math.round((b.totalPrice || 0) * 0.05),
      b.status === 'completed' ? 'مكتمل' : 'مؤكد',
      b.commissionStatus === 'paid' ? 'مسددة ومحولة' : b.commissionStatus === 'ready_for_payout' ? 'جاهزة للصرف' : 'قيد الانتظار',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `كشف_عمولات_${selectedMarketer.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintCommissions = () => {
    window.print();
  };

  const handleTogglePermission = (key: keyof MarketerPermissions) => {
    if (!isAdmin || !selectedMarketer) return;
    updateMarketerPermissions(selectedMarketer.id, {
      [key]: !selectedMarketer.permissions[key],
    });
  };

  const handleConfirmPayout = (marketerId: string) => {
    payoutAllMarketerCommissions(marketerId);
    const m = marketers.find((x) => x.id === marketerId);
    setPayoutModalMarketer(null);
    setPayoutSuccessMessage(`تم تسوية وصرف كافة العمولات المستحقة بنجاح للمسوق: ${m?.name}`);
    setTimeout(() => {
      setPayoutSuccessMessage(null);
    }, 4500);
  };

  const handleCreateMarketer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    addMarketer({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || `marketer.${Date.now().toString().slice(-4)}@gmail.com`,
      nationalId: newNationalId.trim() || '1000000000',
      bankAccount: newBankAccount.trim(),
      bankName: newBankName,
    });

    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewNationalId('');
    setNewBankAccount('');
    setShowAddMarketerModal(false);
    setPayoutSuccessMessage('تمت إضافة المسوق الجديد وتوليد عقده المعتمد بنجاح بنسبة عمولة 5%');
    setTimeout(() => setPayoutSuccessMessage(null), 4000);
  };

  const permissionDefinitions: Array<{
    key: keyof MarketerPermissions;
    title: string;
    description: string;
    icon: React.ElementType;
  }> = [
    {
      key: 'canCreateBooking',
      title: 'إضافة حجوزات جديدة',
      description: 'السماح للمسوق بتسجيل وتأكيد حجوزات النزلاء الخاصة به في النظام',
      icon: Plus,
    },
    {
      key: 'canEditPrices',
      title: 'تعديل الأسعار والخصومات',
      description: 'إمكانية إعطاء خصومات محددة أو تغيير سعر الليلة المعتمد',
      icon: DollarSign,
    },
    {
      key: 'canViewAllBookings',
      title: 'الاطلاع على كافة الحجوزات',
      description: 'رؤية حجوزات جميع المسوقين والإدارة بدلاً من حصرها بحجوزاته فقط',
      icon: Eye,
    },
    {
      key: 'canBlockDates',
      title: 'إغلاق وتجميد التواريخ',
      description: 'إمكانية قفل أيام محددة وجعلها غير متاحة للحجز',
      icon: Lock,
    },
    {
      key: 'canViewCustomerContacts',
      title: 'رؤية أرقام هواتف العملاء',
      description: 'إظهار وسيلة الاتصال المباشرة بالعميل وتفاصيل الهوية',
      icon: Phone,
    },
    {
      key: 'canExportReports',
      title: 'تصدير التقارير والفواتير',
      description: 'تحميل كشوف الحساب وسندات الحجز بصيغة PDF وإكسل',
      icon: FileSpreadsheet,
    },
    {
      key: 'canCreateContract',
      title: 'إنشاء وإصدار العقود الرسمية وتعديل صيغتها',
      description: 'توليد عقد إيجار موثق للعميل برقم تسلسلي معتمد وتعديل بنود وشروط العقد قبل إرساله',
      icon: FileText,
    },
    {
      key: 'canEditDeposit',
      title: 'تعديل مبلغ العربون قبل تأكيد الحجز',
      description: 'السماح بتعديل وتخصيص قيمة العربون للعميل بحرية قبل اعتماد الحجز النهائي',
      icon: Coins,
    },
    {
      key: 'canViewFinancials',
      title: 'الاطلاع على الأرباح والتقارير المالية',
      description: 'رؤية إجمالي إيرادات الاستراحات والتقارير المحاسبية العامة',
      icon: CreditCard,
    },
    {
      key: 'canViewCalendar',
      title: 'إظهار صفحة التقويم والأسعار',
      description: 'السماح للمسوق بالوصول لصفحة التقويم وجداول الأسعار، أو إخفائها عنه في الشريط السفلي والقائمة',
      icon: Calendar,
    },
    {
      key: 'canViewProperties',
      title: 'إظهار صفحة العقار والوحدات',
      description: 'السماح للمسوق بالوصول لصفحة تفاصيل وأقسام العقار، أو إخفائها عنه في الشريط السفلي والقائمة',
      icon: Building2,
    },
    {
      key: 'canViewDashboard',
      title: 'إظهار صفحة لوحة التحكم المركزية',
      description: 'السماح للمسوق بالوصول للوحة التحكم ومتابعة حركة الدخول والخروج وفلاتر الحجوزات، أو إخفائها',
      icon: LayoutGrid,
    },
    {
      key: 'canViewMarketers',
      title: 'إظهار صفحة وزر المسوقين والعمولات',
      description: 'السماح للمسوق بالوصول لبيانات المسوقين والعمولات والزر العلوي في الهيدر، أو إخفائها عنه تماماً',
      icon: Users,
    },
    {
      key: 'canManageTemplates',
      title: 'إظهار إدارة صيغ وقوالب الرسائل والعقود',
      description: 'السماح للموظف بالوصول لتعديل صيغ وقوالب رسائل الواتساب والعقد في قسم المزيد، أو إخفائها عنه',
      icon: MessageSquare,
    },
    {
      key: 'canViewRentalContract',
      title: 'إظهار عقد إيجار الشاليه والبنود الموحدة للنزلاء',
      description: 'السماح للموظف باستعراض صيغة عقد إيجار الشاليه وشروط التأمين المعتمدة في قسم المزيد، أو إخفائها',
      icon: FileText,
    },
    {
      key: 'canViewActivityLogs',
      title: 'إظهار سجل العمليات والصلاحيات (Audit Log)',
      description: 'السماح للموظف بالاطلاع على سجل النشاطات والعمليات المسجلة في قسم المزيد، أو إخفائه عنه',
      icon: Clock,
    },
  ];

  return (
    <div className="pb-28 max-w-5xl mx-auto px-3 sm:px-4 pt-3 space-y-4 font-['Tajawal',sans-serif]">
      {/* ============================================================== */}
      {/* Header Banner                                                  */}
      {/* ============================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-xs border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-700" />
              <span>إدارة المسوقين والعمولات والملفات الشخصية</span>
            </h2>
            <span className="text-xs bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full font-bold border border-purple-200 flex items-center gap-1">
              <Percent className="w-3 h-3 text-purple-700" />
              5% عمولة ثابتة وموثقة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            كشف مالي تفصيلي بالعمولات والمبالغ لكل مسوق، ملفات المسوقين الشخصية، والعقود الرسمية المبرمة مع الإدارة
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeSubTab === 'commissions' && (
            <>
              <button
                onClick={handleExportCommissionsCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="تصدير كشف إكسل بالعمولات والمبالغ"
              >
                <Download className="w-3.5 h-3.5 text-purple-700" />
                <span>تصدير كشف (CSV)</span>
              </button>

              <button
                onClick={handlePrintCommissions}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="طباعة كشف العمولات"
              >
                <Printer className="w-3.5 h-3.5 text-purple-700" />
                <span>طباعة</span>
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => setShowAddMarketerModal(true)}
              className="btn-mauve-shiny flex items-center justify-center gap-1.5 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مسوق</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {payoutSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-bold animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{payoutSuccessMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* Sub-Tabs Switcher                                              */}
      {/* 1. كشف العمولات والمبالغ (خاص بالمسوق)                         */}
      {/* 2. الملف الشخصي والعقد المبرم                                  */}
      {/* 3. مصفوفة الصلاحيات                                            */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1.5 bg-purple-100/70 rounded-2xl border border-purple-200/80">
        <button
          onClick={() => setActiveSubTab('commissions')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'commissions'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'text-purple-900 hover:text-purple-950 hover:bg-purple-200/40'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>كشف العمولات والمبالغ (خاص بالمسوق)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('profile')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'text-purple-900 hover:text-purple-950 hover:bg-purple-200/40'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>الملف الشخصي والعقد المبرم</span>
        </button>

        <button
          onClick={() => setActiveSubTab('permissions')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'permissions'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'text-purple-900 hover:text-purple-950 hover:bg-purple-200/40'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>مصفوفة الصلاحيات</span>
        </button>
      </div>

      {/* Marketer Selector Carousel (Visible for all tabs to easily inspect any marketer) */}
      <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-700" />
            <span>اختر المسوق لاستعراض بياناته وعمولاته:</span>
          </span>
          <span className="text-[11px] text-purple-900 font-bold bg-purple-50 px-2 py-0.5 rounded-md">
            {marketers.length} مسوقين معتمدين
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {marketers.map((m) => {
            const isSelected = m.id === selectedMarketer?.id;
            const mStats = marketerStatsList.find((s) => s.marketer.id === m.id);

            return (
              <button
                key={m.id}
                onClick={() => setSelectedMarketerId(m.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-purple-300 hover:bg-white'
                }`}
              >
                <img
                  src={m.avatar}
                  alt={m.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-purple-300 shrink-0"
                />
                <div className="text-right">
                  <span className="text-xs font-bold block whitespace-nowrap">{m.name}</span>
                  <span
                    className={`text-[10px] font-mono block ${
                      isSelected ? 'text-purple-200' : 'text-slate-500'
                    }`}
                  >
                    {m.code} · عمولة مستحقة: {mStats?.totalDueCommission || 0} ر.س
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. COMMISSIONS TAB (كشف العمولات والمبالغ الخاص بالمسوق)         */}
      {/* ============================================================== */}
      {activeSubTab === 'commissions' && selectedMarketer && (
        <div className="space-y-4">
          {/* Marketer Financial Summary Banner */}
          <div className="bg-gradient-to-r from-[#200738] via-[#2d0c4d] to-[#391263] text-white p-5 rounded-3xl shadow-sm border border-purple-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={selectedMarketer.avatar}
                alt={selectedMarketer.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    كشف عمولات المسوق: {selectedMarketer.name}
                  </h3>
                  <span className="text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-mono font-bold">
                    {selectedMarketer.code}
                  </span>
                  <span className="text-xs bg-purple-700/60 text-purple-200 px-2 py-0.5 rounded-md font-bold">
                    نسبة العمولة: 5%
                  </span>
                </div>
                <p className="text-xs text-purple-200 mt-1 flex items-center gap-3 flex-wrap font-mono">
                  <span>جوال: {selectedMarketer.phone}</span>
                  <span>·</span>
                  <span>البنك: {selectedMarketer.bankName || 'مصرف الراجحي'}</span>
                  <span>·</span>
                  <span>الآيبان: {selectedMarketer.bankAccount || 'غير مسجل'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {isAdmin && (selectedStats?.readyCommission || 0) > 0 && (
                <button
                  onClick={() => setPayoutModalMarketer(selectedMarketer)}
                  className="btn-mauve-shiny px-4 py-2.5 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4 text-emerald-300" />
                  <span>تسوية وصرف العمولات الجاهزة ({selectedStats?.readyCommission} ر.س)</span>
                </button>
              )}
            </div>
          </div>

          {/* Dedicated Financial KPI Cards for this Marketer */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Total Due (5%) */}
            <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs">
              <span className="text-xs text-purple-700 font-bold block flex items-center justify-between">
                <span>إجمالي العمولات المستحقة (5%)</span>
                <Coins className="w-4 h-4 text-purple-600" />
              </span>
              <span className="text-2xl font-black text-purple-950 font-mono mt-1 block">
                {selectedStats?.totalDueCommission || 0} <span className="text-xs font-bold">ر.س</span>
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {selectedStats?.readyCommission || 0} ر.س جاهز للصرف
              </span>
            </div>

            {/* Ready for Payout */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
              <span className="text-xs text-emerald-700 font-bold block flex items-center justify-between">
                <span>عمولات جاهزة للصرف الفوري</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </span>
              <span className="text-2xl font-black text-emerald-800 font-mono mt-1 block">
                {selectedStats?.readyCommission || 0} <span className="text-xs font-bold">ر.س</span>
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                حجوزات مكتملة ومؤكدة بالكامل
              </span>
            </div>

            {/* Paid / Transferred */}
            <div className="bg-white p-4 rounded-2xl border border-teal-100 shadow-xs">
              <span className="text-xs text-teal-700 font-bold block flex items-center justify-between">
                <span>عمولات مسددة ومحولة للبنك</span>
                <Wallet className="w-4 h-4 text-teal-600" />
              </span>
              <span className="text-2xl font-black text-teal-900 font-mono mt-1 block">
                {selectedStats?.paidCommission || 0} <span className="text-xs font-bold">ر.س</span>
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                تم تحويلها إلى حساب المسوق
              </span>
            </div>

            {/* Total Sales Volume by Marketer */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-700 font-bold block flex items-center justify-between">
                <span>إجمالي مبيعات حجوزات المسوق</span>
                <TrendingUp className="w-4 h-4 text-slate-600" />
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                {selectedStats?.totalSales || 0} <span className="text-xs font-bold">ر.س</span>
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                من {selectedStats?.completedBookingsCount || 0} حجز مكتمل
              </span>
            </div>
          </div>

          {/* Filters & Search Bar for Bookings Ledger */}
          <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="بحث برقم الحجز أو اسم العميل أو العقار..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none">
              <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap hidden sm:inline">
                حالة العمولة:
              </span>
              <button
                onClick={() => setCommissionStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  commissionStatusFilter === 'all'
                    ? 'bg-purple-900 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                الكل ({selectedStats?.totalBookingsCount || 0})
              </button>
              <button
                onClick={() => setCommissionStatusFilter('ready_for_payout')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  commissionStatusFilter === 'ready_for_payout'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                جاهزة للصرف
              </button>
              <button
                onClick={() => setCommissionStatusFilter('paid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  commissionStatusFilter === 'paid'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                }`}
              >
                تم الصرف
              </button>
              <button
                onClick={() => setCommissionStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  commissionStatusFilter === 'pending'
                    ? 'bg-amber-700 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                قيد الإتمام
              </button>
            </div>
          </div>

          {/* Detailed Commissions & Bookings Ledger Table */}
          <div className="bg-white rounded-3xl border border-purple-100 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-purple-700" />
                  <span>جدول كشف العمولات والمبالغ التفصيلي للحجوزات</span>
                  <span className="text-xs bg-purple-50 text-purple-900 px-2 py-0.5 rounded-md font-mono font-bold">
                    {selectedMarketerFilteredBookings.length} عملية حجز
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  حساب دقيق لنسبة 5% من كل حجز، تاريخ الإقامة، وحالة استحقاق وصرف العمولة للمسوق
                </p>
              </div>
            </div>

            {selectedMarketerFilteredBookings.length === 0 ? (
              <div className="text-center py-12 bg-slate-50/50">
                <Coins className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">لا توجد حجوزات مطابقة للفلاتر المحددة</p>
                <p className="text-[11px] text-slate-400 mt-1">جرّب تغيير حالة العمولة أو مسح كلمة البحث</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-purple-50/70 text-slate-700 border-b border-purple-100 font-bold">
                      <th className="py-3.5 px-4">رقم الحجز والتاريخ</th>
                      <th className="py-3.5 px-3">العميل</th>
                      <th className="py-3.5 px-3">العقار والمدة</th>
                      <th className="py-3.5 px-3">إجمالي الحجز</th>
                      <th className="py-3.5 px-3">النسبة</th>
                      <th className="py-3.5 px-3 font-mono">مبلغ العمولة (5%)</th>
                      <th className="py-3.5 px-3 text-center">حالة العمولة</th>
                      <th className="py-3.5 px-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedMarketerFilteredBookings.map((b) => {
                      const commVal = b.marketerCommission || Math.round((b.totalPrice || 0) * 0.05);
                      const isPaid = b.commissionStatus === 'paid';
                      const isReady = b.commissionStatus === 'ready_for_payout';
                      const isCompleted = b.status === 'completed';

                      return (
                        <tr key={b.id} className="hover:bg-purple-50/20 transition-colors">
                          {/* Booking No & Date */}
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-xs bg-purple-50 text-purple-900 px-2 py-0.5 rounded-md border border-purple-200 block w-fit">
                              {b.bookingNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                              {b.createdAt ? b.createdAt.split('T')[0] : b.checkInDate}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">{b.customerName}</span>
                            <span className="text-[11px] text-slate-500 font-mono block">{b.customerPhone}</span>
                          </td>

                          {/* Property & Stay */}
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-800 block">{b.propertyName}</span>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              {b.checkInDate} ({b.nightsCount} ليالٍ)
                            </span>
                          </td>

                          {/* Total Booking Amount */}
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {b.totalPrice} ر.س
                            </span>
                          </td>

                          {/* Commission Rate */}
                          <td className="py-3 px-3">
                            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md text-[11px]">
                              5%
                            </span>
                          </td>

                          {/* Commission Amount */}
                          <td className="py-3 px-3">
                            <span className="font-mono font-black text-purple-950 bg-purple-100/70 border border-purple-200 px-2.5 py-1 rounded-lg text-xs inline-block">
                              {commVal} ر.س
                            </span>
                          </td>

                          {/* Commission Status */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                isPaid
                                  ? 'bg-teal-100 text-teal-900 border border-teal-200'
                                  : isReady
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {isPaid ? (
                                <>
                                  <Check className="w-3 h-3 text-teal-700" />
                                  <span>تم الصرف</span>
                                </>
                              ) : isReady ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                  <span>جاهزة للصرف</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span>قيد الإتمام</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {isAdmin && !isPaid && (
                                <button
                                  onClick={() => payMarketerCommission(b.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-2xs cursor-pointer"
                                  title="اعتماد صرف وتحويل عمولة هذا الحجز فقط"
                                >
                                  صرف الآن
                                </button>
                              )}

                              {isPaid && (
                                <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md">
                                  مسددة
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Totals Summary Footer */}
                  <tfoot>
                    <tr className="bg-purple-100/60 font-bold text-slate-900 border-t-2 border-purple-200">
                      <td colSpan={3} className="py-3 px-4 text-left">
                        المجموع الإجمالي للحجوزات المعروضة:
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {selectedMarketerFilteredBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)} ر.س
                      </td>
                      <td className="py-3 px-3 font-mono">5%</td>
                      <td className="py-3 px-3 font-mono text-purple-950 font-black text-xs">
                        {selectedMarketerFilteredBookings.reduce(
                          (sum, b) => sum + (b.marketerCommission || Math.round((b.totalPrice || 0) * 0.05)),
                          0
                        )}{' '}
                        ر.س
                      </td>
                      <td colSpan={2} className="py-3 px-4 text-center text-slate-500 text-[11px]">
                        كشف معتمد وموثق
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MARKETER PROFILE & CONCLUDED CONTRACT TAB                    */}
      {/* (الملف الشخصي والعقد المبرم بين المسوق والإدارة)                */}
      {/* ============================================================== */}
      {activeSubTab === 'profile' && selectedMarketer && (
        <div className="space-y-5">
          {/* Top Bar for Profile */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-700" />
                <span>الملف الشخصي للمسوق والعقد المبرم مع الإدارة</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                بيانات تسجيل الدخول للتطبيق، وسائل الاتصال، الحساب البنكي، والعقد الرسمي الموثق
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEditProfile(selectedMarketer)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-purple-700" />
                <span>تعديل بيانات الملف والعقد</span>
              </button>

              <button
                onClick={() => setShowContractModal(true)}
                className="btn-mauve-shiny flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>معاينة العقد الرسمي كاملاً</span>
              </button>
            </div>
          </div>

          {/* 1. Marketer Profile Card (الملف الشخصي للمسوق) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-purple-100 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <img
                  src={selectedMarketer.avatar}
                  alt={selectedMarketer.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-300 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-bold text-slate-900">{selectedMarketer.name}</h4>
                    <span className="text-xs font-mono bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-md font-bold">
                      {selectedMarketer.code}
                    </span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      حساب نشط وموثق
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    مسوق ووسيط عقاري معتمد لدى إدارة شاليهات واستراحات ماسة (AMASA)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => switchUser('marketer', selectedMarketer.id)}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200 transition-colors cursor-pointer"
                  title="الدخول بحساب هذا المسوق لتجربة النظام والصلاحيات"
                >
                  <Users className="w-4 h-4 text-purple-700" />
                  <span>دخول بحساب {selectedMarketer.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Full Name */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">اسم المسوق:</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {selectedMarketer.name}
                  </span>
                </div>
                <Users className="w-5 h-5 text-purple-700" />
              </div>

              {/* Phone / Mobile */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">رقم جوال المسوق:</span>
                  <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">
                    {selectedMarketer.phone}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={`tel:${selectedMarketer.phone}`}
                    className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg"
                    title="اتصال"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleCopy(selectedMarketer.phone, 'phone')}
                    className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer"
                    title="نسخ الرقم"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Login Email */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div className="min-w-0 pr-1">
                  <span className="text-[11px] text-slate-500 font-bold block">إيميل الدخول للتطبيق:</span>
                  <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block truncate">
                    {selectedMarketer.email}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(selectedMarketer.email, 'email')}
                    className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg cursor-pointer"
                    title="نسخ الإيميل"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* National ID */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">رقم الهوية الوطنية:</span>
                  <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">
                    {selectedMarketer.nationalId || '1088923412'}
                  </span>
                </div>
                <IdCard className="w-5 h-5 text-slate-500" />
              </div>

              {/* Bank Name */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">البنك المعتمد:</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {selectedMarketer.bankName || 'مصرف الراجحي'}
                  </span>
                </div>
                <Building2 className="w-5 h-5 text-slate-500" />
              </div>

              {/* IBAN */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div className="min-w-0 pr-1">
                  <span className="text-[11px] text-slate-500 font-bold block">رقم الآيبان (IBAN):</span>
                  <span className="text-xs font-bold text-purple-900 font-mono mt-0.5 block truncate">
                    {selectedMarketer.bankAccount || 'لم يتم تسجيل آيبان'}
                  </span>
                </div>
                <CreditCard className="w-5 h-5 text-purple-700 shrink-0" />
              </div>
            </div>

            {copiedText && (
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                تم نسخ {copiedText === 'phone' ? 'رقم الجوال' : 'البريد الإلكتروني'} إلى الحافظة بنجاح
              </div>
            )}
          </div>

          {/* 2. Concluded Contract Card (العقد المبرم بين المسوق والإدارة) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-purple-200 space-y-5">
            {/* Contract Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-800 to-purple-600 flex items-center justify-center text-white shadow-xs shrink-0">
                  <FileCheck className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">
                      العقد المبرم بين المسوق والإدارة
                    </h4>
                    <span className="text-xs bg-emerald-100 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                      ساري وموثق إلكترونياً
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    عقد وساطة وتسويق عقاري رسمي موثق لدى إدارة شاليهات واستراحات ماسة
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowContractModal(true)}
                  className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-700" />
                  <span>معاينة العقد كاملاً</span>
                </button>

                <button
                  onClick={() => setShowContractModal(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-700" />
                  <span>طباعة العقد</span>
                </button>
              </div>
            </div>

            {/* Contract Key Summary Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-purple-50/50 rounded-2xl border border-purple-100 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">رقم العقد المعتمد:</span>
                <span className="font-mono font-bold text-purple-950 mt-0.5 block">
                  {selectedMarketer.contract?.contractNumber || `MKT-CTR-2026-${selectedMarketer.code.replace('MK-', '')}`}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">تاريخ الإبرام:</span>
                <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                  {selectedMarketer.contract?.contractDate || selectedMarketer.joinDate}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">تاريخ التجديد / الانتهاء:</span>
                <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                  {selectedMarketer.contract?.expiryDate || '2027-01-15'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">نسبة العمولة الثابتة:</span>
                <span className="font-black text-emerald-800 text-sm font-mono mt-0.5 block">
                  5% من إجمالي الحجز
                </span>
              </div>
            </div>

            {/* Contract Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-purple-800 block mb-1">
                  الطرف الأول (الإدارة):
                </span>
                <p className="font-bold text-slate-900">إدارة استراحات وشاليهات ماسة (AMASA)</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  الممثل النظامي: المدير العام التنفيذي · المملكة العربية السعودية
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-purple-800 block mb-1">
                  الطرف الثاني (المسوق المعتمد):
                </span>
                <p className="font-bold text-slate-900">{selectedMarketer.name}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  هوية: {selectedMarketer.nationalId || '1088923412'} · جوال: {selectedMarketer.phone} · إيميل: {selectedMarketer.email}
                </p>
              </div>
            </div>

            {/* Core Contract Terms */}
            <div className="space-y-2 pt-1">
              <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>أهم البنود والشروط المعتمدة في هذا العقد:</span>
              </h5>

              <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                {(selectedMarketer.contract?.terms || [
                  'يستحق المسوق عمولة تسويق ثابتة قدرها 5% من القيمة الإجمالية لكل حجز مؤكد ومكتمل يتم إبرامه عبر رمزه التسويقي المعتمد.',
                  'يتم تحويل العمولات المستحقة دورياً وفورياً إلى الحساب البنكي المعتمد والمثبت في هذا العقد.',
                  'يلتزم المسوق بالترويج وفق سياسات وأسعار شاليهات ماسة الرسمية، والحفاظ التام على سرية وخصوصية بيانات النزلاء.',
                  'يمنح المسوق صلاحية إصدار عقود الإيجار المعتمدة وتعديل مبالغ العربون المبدئي بما يخدم مصلحة التشغيل وتسهيل الحجوزات.',
                  'يعد هذا العقد سارياً لمدة سنة كاملة وتجدد تلقائياً برضا الطرفين.',
                ]).map((term, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-purple-800 shrink-0 font-mono text-[11px]">
                      {idx + 1}.
                    </span>
                    <span className="leading-relaxed">{term}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Stamp & Signatures Footer Preview */}
            <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl border-2 border-dashed border-purple-400 bg-white flex items-center justify-center text-purple-900 font-bold text-[10px] text-center p-1">
                  ختم الإدارة المعتمد
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">توثيق إلكتروني معتمد</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    رمز التوثيق: {selectedMarketer.contract?.contractNumber || 'MKT-2026-CTR'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowContractModal(true)}
                  className="btn-mauve-shiny px-4 py-2 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة العقد وطباعته</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. PERMISSIONS TAB (مصفوفة الصلاحيات)                           */}
      {/* ============================================================== */}
      {activeSubTab === 'permissions' && selectedMarketer && (
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-purple-100 space-y-5">
          {/* Permissions Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-700" />
                <span>مصفوفة صلاحيات المسوق: {selectedMarketer.name}</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAdmin
                  ? 'التحكم المباشر في الصلاحيات الممنوحة للمسوق، بما في ذلك إظهار أو إخفاء الصفحات والأدوات'
                  : 'استعراض الصلاحيات الممنوحة لك من قبل الإدارة'}
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={grantAllMarketersContractAndDepositPermissions}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0 transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>تأكيد صلاحية العقود والعربون للجميع</span>
              </button>
            )}
          </div>

          {/* Quick Staff Notice */}
          <div className="bg-gradient-to-r from-[#200738] to-[#391263] text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border border-purple-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>صلاحيات الموظفين: إنشاء العقود وتعديل العربون</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                    مفعلة
                  </span>
                </h5>
                <p className="text-[11px] text-purple-200 mt-0.5">
                  يملك جميع المسوقين صلاحيات إنشاء وتوليد عقد الإيجار وتعديل مبلغ العربون قبل تأكيد الحجز
                </p>
              </div>
            </div>
          </div>

          {/* Permissions Matrix List */}
          <div className="divide-y divide-slate-100 border border-purple-100 rounded-2xl overflow-hidden bg-slate-50/40">
            {permissionDefinitions.map((item) => {
              const isGranted = !!selectedMarketer.permissions[item.key];
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  onClick={() => handleTogglePermission(item.key)}
                  className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                    isAdmin ? 'hover:bg-purple-50/50 cursor-pointer' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isGranted
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight">
                        {item.description}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div
                    className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                      isGranted ? 'bg-purple-700 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white shadow-xs block" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: CONTRACT FULL PREVIEW & PRINT                          */}
      {/* ============================================================== */}
      {showContractModal && selectedMarketer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl border border-purple-100 flex flex-col">
            {/* Modal Actions Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-purple-50/50">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-700" />
                <h3 className="font-bold text-base text-slate-900">
                  معاينة العقد الرسمي المبرم بين المسوق والإدارة
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-purple-700" />
                  <span>طباعة العقد</span>
                </button>
                <button
                  onClick={() => setShowContractModal(false)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Formal Agreement Document */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-800 leading-relaxed text-xs">
              {/* Document Header */}
              <div className="text-center pb-6 border-b-2 border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-purple-800 tracking-wider">
                  المملكة العربية السعودية · وثيقة رسمية معتمدة
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  عقد وساطة وتسويق عقاري رسمي موثق
                </h2>
                <p className="text-xs text-slate-500">
                  إدارة استراحات وشاليهات ماسة (AMASA) · ترخيص وساطة عقارية معتمد
                </p>
                <div className="flex items-center justify-center gap-3 pt-2 text-[11px] font-mono text-slate-600">
                  <span>رقم العقد: {selectedMarketer.contract?.contractNumber || `MKT-CTR-2026-${selectedMarketer.code.replace('MK-', '')}`}</span>
                  <span>·</span>
                  <span>تاريخ العقد: {selectedMarketer.contract?.contractDate || selectedMarketer.joinDate}</span>
                  <span>·</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    حالة العقد: ساري وموثق
                  </span>
                </div>
              </div>

              {/* Introductory Clause */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                بعون الله تعالى وتوفيقه، تم في يوم {selectedMarketer.contract?.contractDate || selectedMarketer.joinDate}،
                الاتفاق والتراضي بين كلٍ من:
              </div>

              {/* Parties Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Party */}
                <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-1">
                  <span className="text-[11px] font-bold text-purple-800 block">
                    الطرف الأول (المنشأة المالكة والمشغلة):
                  </span>
                  <p className="font-bold text-slate-900 text-xs">إدارة استراحات وشاليهات ماسة (AMASA)</p>
                  <p className="text-[11px] text-slate-600">
                    ويمثلها: {selectedMarketer.contract?.firstPartyRepresentative || 'المدير العام التنفيذي'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    المقر الرئيسي: المملكة العربية السعودية · سجل تجاري معتمد
                  </p>
                </div>

                {/* Second Party */}
                <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-1">
                  <span className="text-[11px] font-bold text-purple-800 block">
                    الطرف الثاني (المسوق والوسيط العقاري):
                  </span>
                  <p className="font-bold text-slate-900 text-xs">{selectedMarketer.name}</p>
                  <p className="text-[11px] text-slate-600 font-mono">
                    الهوية: {selectedMarketer.nationalId || '1088923412'} · الجوال: {selectedMarketer.phone}
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono">
                    إيميل الدخول: {selectedMarketer.email}
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono">
                    الحساب البنكي: {selectedMarketer.bankName || 'مصرف الراجحي'} - {selectedMarketer.bankAccount || 'غير مسجل'}
                  </p>
                </div>
              </div>

              {/* Main Agreement Terms */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 border-r-4 border-purple-700 pr-2">
                  بنود وشروط الاتفاقية:
                </h4>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <strong className="text-purple-900 block">البند الأول: موضوع العقد ونطاق العمل</strong>
                    <p>
                      يوكل الطرف الأول الطرف الثاني بمهام التسويق والترويج لوحدات وشاليهات واستراحات ماسة وجلب
                      حجوزات النزلاء عبر وسائل التواصل والقنوات التسويقية المعتمدة.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <strong className="text-purple-900 block">البند الثاني: نسبة العمولة والاستحقاق المالي (5%)</strong>
                    <p>
                      يستحق الطرف الثاني عمولة تسويق ثابتة قدرها <strong>5% (خمسة بالمائة)</strong> من إجمالي قيمة أي
                      حجز مؤكد ومكتمل يتم إبرامه عبر رمزه التسويقي المعتمد ({selectedMarketer.code})، وتُصرف العمولات
                      المستحقة دورياً وبشكل فوري بعد تدقيق اكتمال الحجز وتحويلها لحسابه البنكي المسجل.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <strong className="text-purple-900 block">البند الثالث: الصلاحيات وتوليد العقود</strong>
                    <p>
                      يمنح الطرف الأول الطرف الثاني صلاحية إصدار عقود الإيجار المعتمدة إلكترونياً للنزلاء، وتخصيص
                      مبلغ العربون المبدئي بما يخدم مصلحة العمل وتسريع إتمام الحجوزات.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <strong className="text-purple-900 block">البند الرابع: التزامات المسوق وسرية البيانات</strong>
                    <p>
                      يلتزم الطرف الثاني بالترويج بالأسعار والسياسات الرسمية الصادرة من الإدارة، والمحافظة التامة
                      على سرية بيانات النزلاء والعملاء وعدم إفشائها لأي طرف ثالث تحت طائلة المساءلة القانونية.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <strong className="text-purple-900 block">البند الخامس: مدة العقد وسريانه</strong>
                    <p>
                      يسري هذا العقد اعتباراً من تاريخ توقيعه ولمدة عام كامل، ويتجدد تلقائياً ما لم يُخطر أحد الطرفين
                      الآخر بعدم رغبته في التجديد قبل ثلاثين يوماً.
                    </p>
                  </div>
                </div>
              </div>

              {/* Signatures & Seal Section */}
              <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-6 text-center">
                <div className="space-y-3">
                  <span className="font-bold text-xs text-slate-900 block">توقيع وختم الطرف الأول (الإدارة):</span>
                  <div className="h-16 flex items-center justify-center">
                    <div className="w-24 h-16 border-2 border-dashed border-purple-400 rounded-xl bg-purple-50/50 flex flex-col items-center justify-center text-[10px] text-purple-900 font-bold">
                      <span>ختم معتمد</span>
                      <span className="text-[9px] text-slate-500">AMASA</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-600 block">إدارة استراحات وشاليهات ماسة</span>
                </div>

                <div className="space-y-3">
                  <span className="font-bold text-xs text-slate-900 block">توقيع الطرف الثاني (المسوق):</span>
                  <div className="h-16 flex items-center justify-center">
                    <span className="font-serif italic text-purple-950 font-bold text-base">
                      {selectedMarketer.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-mono block">
                    كود: {selectedMarketer.code} · موثق إلكترونياً
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                تم إنشاء وتوثيق هذا العقد عبر منصة شاليهات ماسة المركزية
              </span>
              <button
                onClick={() => setShowContractModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT MARKETER PROFILE & CONTRACT                      */}
      {/* ============================================================== */}
      {showEditProfileModal && selectedMarketer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-purple-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-purple-100">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-purple-700" />
                <span>تعديل الملف الشخصي والعقد للمسوق</span>
              </h4>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم المسوق الكامل:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الجوال:</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">إيميل الدخول للتطبيق:</label>
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
                <label className="font-bold text-slate-700 block mb-1">رقم الآيبان البنكي (IBAN):</label>
                <input
                  type="text"
                  value={editBankAccount}
                  onChange={(e) => setEditBankAccount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-mono"
                />
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2">
                <span className="font-bold text-purple-900 block">بيانات العقد المبرم:</span>
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
      {/* MODAL 3: PAYOUT CONFIRMATION (تسوية وصرف العمولات)              */}
      {/* ============================================================== */}
      {payoutModalMarketer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-purple-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-purple-100">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <span>تسوية وصرف عمولة المسوق</span>
              </h4>
              <button
                onClick={() => setPayoutModalMarketer(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {(() => {
              const mStats = marketerStatsList.find((s) => s.marketer.id === payoutModalMarketer.id);
              const amountToPay = mStats ? mStats.totalDueCommission : 0;

              return (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-3 p-3 bg-purple-50/70 rounded-2xl border border-purple-100">
                    <img
                      src={payoutModalMarketer.avatar}
                      alt={payoutModalMarketer.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-purple-200"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {payoutModalMarketer.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        كود: {payoutModalMarketer.code} · جوال: {payoutModalMarketer.phone}
                      </span>
                    </div>
                  </div>

                  {/* Bank Account Details */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-bold block">
                      بيانات التحويل البنكي المعتمدة في العقد:
                    </span>
                    <div className="flex justify-between items-center text-slate-800">
                      <span>البنك:</span>
                      <strong>{payoutModalMarketer.bankName || 'مصرف الراجحي'}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-800">
                      <span>رقم الآيبان (IBAN):</span>
                      <strong className="font-mono text-purple-900">
                        {payoutModalMarketer.bankAccount || 'SA1280000201608010111122'}
                      </strong>
                    </div>
                  </div>

                  {/* Amount Breakdown */}
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-950 block">
                        إجمالي العمولة المستحقة للصرف (5%):
                      </span>
                      <span className="text-[10px] text-emerald-700">
                        تشمل الحجوزات المكتملة والمؤكدة
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-800 font-mono">
                        {amountToPay}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 mr-1">ر.س</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    بالضغط على "تأكيد التحويل والصرف"، سيتم وسم كافة الحجوزات المستحقة كـ "تم الصرف"
                    وتحديث كشف العمولات والسجلات المحاسبية.
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleConfirmPayout(payoutModalMarketer.id)}
                      className="btn-mauve-shiny flex-1 py-2.5 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>تأكيد التحويل والصرف ({amountToPay} ر.س)</span>
                    </button>
                    <button
                      onClick={() => setPayoutModalMarketer(null)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: ADD NEW MARKETER                                      */}
      {/* ============================================================== */}
      {showAddMarketerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-purple-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-purple-100">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-700" />
                <span>إضافة مسوق جديد وتوليد عقده</span>
              </h4>
              <button
                onClick={() => setShowAddMarketerModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMarketer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم المسوق الكامل:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تركي بن فهد"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الجوال:</label>
                  <input
                    type="tel"
                    required
                    placeholder="05xxxxxxxx"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">إيميل الدخول للتطبيق:</label>
                  <input
                    type="email"
                    placeholder="marketer@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الهوية الوطنية:</label>
                  <input
                    type="text"
                    placeholder="10xxxxxxxx"
                    value={newNationalId}
                    onChange={(e) => setNewNationalId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">البنك:</label>
                  <select
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
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
                <label className="font-bold text-slate-700 block mb-1">رقم الآيبان (IBAN):</label>
                <input
                  type="text"
                  placeholder="SA..."
                  value={newBankAccount}
                  onChange={(e) => setNewBankAccount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden font-mono"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-purple-900">
                <span className="font-bold block">ملاحظة النظام:</span>
                <span>
                  يتم ربط المسوق تلقائياً بنسبة عمولة 5% من كل حجز، وتوليد عقد الوساطة المعتمد بينه وبين الإدارة، ومنحه صلاحيات العقود والعربون افتراضياً.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="btn-mauve-shiny flex-1 py-2.5 text-white rounded-xl font-bold cursor-pointer"
                >
                  تسجيل المسوق وإصدار العقد
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMarketerModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
