export type Role = 'admin' | 'marketer' | 'guard';

export interface MarketerPermissions {
  canCreateBooking: boolean; // إضافة حجز جديد
  canEditPrices: boolean; // تعديل الأسعار وتقديم خصومات
  canViewAllBookings: boolean; // الاطلاع على حجوزات الجميع (أو فقط حجوزاته)
  canBlockDates: boolean; // إغلاق وتجميد التواريخ
  canViewCustomerContacts: boolean; // رؤية أرقام هواتف العملاء
  canExportReports: boolean; // تصدير الفواتير والعقود
  canViewFinancials: boolean; // الاطلاع على الأرباح الإجمالية
  canCreateContract: boolean; // إنشاء وإصدار العقود الرسمية وتعديل صيغتها
  canEditDeposit: boolean; // تعديل مبلغ العربون وتخصيصه قبل تأكيد الحجز
  canViewCalendar: boolean; // إظهار أو إخفاء صفحة التقويم والأسعار
  canViewProperties: boolean; // إظهار أو إخفاء صفحة العقار
  canViewDashboard: boolean; // إظهار أو إخفاء صفحة لوحة التحكم
  canViewMarketers: boolean; // إظهار أو إخفاء صفحة وزر المسوقين والعمولات
  canManageTemplates: boolean; // إظهار أو إخفاء إدارة صيغ وقوالب الرسائل والعقود
  canViewRentalContract: boolean; // إظهار أو إخفاء عقد إيجار الشاليه والبنود الموحدة للنزلاء
  canViewActivityLogs: boolean; // إظهار أو إخفاء سجل العمليات والصلاحيات (Audit Log)
}

export interface UserAccount {
  id: string; // 'admin' | 'guard' | marketer.id
  role: Role;
  name: string;
  email: string; // Gmail address: e.g. admin.amasa@gmail.com
  password: string; // Custom password set by user
  avatar?: string;
  marketerId?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketerContract {
  contractNumber: string; // رقم العقد المعتمد مثل MKT-CTR-2026-101
  contractDate: string; // تاريخ توقيع العقد
  expiryDate: string; // تاريخ التجديد أو الانتهاء
  commissionRatePercent: number; // 5%
  status: 'active' | 'pending' | 'expired';
  firstParty: string; // الطرف الأول: إدارة استراحات وشاليهات ماسة
  firstPartyRepresentative: string; // ممثل الطرف الأول
  secondParty: string; // الطرف الثاني: المسوق المعتمد
  secondPartyPhone: string;
  secondPartyEmail: string;
  secondPartyNationalId?: string;
  terms: string[];
  isSigned: boolean;
  signedDate: string;
  notes?: string;
}

export interface Marketer {
  id: string;
  name: string;
  email: string; // إيميل الدخول للتطبيق
  password?: string; // كلمة المرور
  phone: string; // رقم جوال المسوق
  avatar: string;
  code: string; // كود المسوق مثل MK-101
  commissionRate: number; // 0.05 (5%)
  permissions: MarketerPermissions;
  joinDate: string;
  bankAccount?: string;
  bankName?: string;
  nationalId?: string;
  contract?: MarketerContract; // العقد المبرم بين المسوق والادارة
}

export interface Guard {
  id: string;
  name: string;
  phone: string;
  email: string; // Gmail address
  password?: string; // Custom password
  avatar?: string;
}

export type PropertyId = 'al-taraf' | 'al-baylasan' | 'rans' | 'alma' | 'naya' | 'hamran';

export type PricingSeason = 'weekday' | 'weekend' | 'summer' | 'eid' | 'vacation';

export interface PropertySection {
  id: string; // مثل: 'section-1' أو 'section-2'
  name: string; // مثل: 'القسم الأول' أو 'القسم الثاني'
  title?: string; // عنوان مميز مثل 'قسم الضيافة والمسبح الكبير'
  subtitle: string; // معلومات وتفاصيل القسم
  priceWeekday: number; // السعر وسط الأسبوع
  priceWeekend: number; // السعر نهاية الأسبوع (الويكند)
  capacity: number; // السعة بالأفراد
  bedrooms: number; // عدد غرف النوم
  bathrooms: number; // عدد دورات المياه
  areaM2: number; // المساحة بالمتر المربع
  poolType?: string; // مواصفات المسبح / الجاكوزي
  features: string[]; // المرافق والتجهيزات
  images: string[]; // صور خاصة بالقسم
  coverImage?: string;
  isAvailable?: boolean;
}

export interface PropertySeasonalPricing {
  weekday: number; // وسط الأسبوع
  weekend: number; // الويكند
  summer: number; // الصيف
  eid: number; // الأعياد
  vacation: number; // الإجازات
}

export interface Property {
  id: PropertyId;
  name: string;
  subtitle: string;
  location: string;
  coordinates: { lat: number; lng: number };
  code?: string; // كود العقار مثل #83821
  subUnitsCount?: number; // عدد الوحدات الفرعية مثل 2
  sections?: PropertySection[]; // أقسام العقار (مثل الترف: القسم الأول والقسم الثاني)
  isPublished: boolean; // متاح / مغلق (إيقاف العقار كامل لجميع الأيام أو فتحه)
  basePriceWeekday: number;
  basePriceWeekend: number;
  seasonalPricing: PropertySeasonalPricing;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
  poolType: string;
  coverImage: string;
  images: string[];
  features: string[];
  contractTerms: string[];
  // تفاصيل العقد والتحويل
  iban: string;
  bankName: string;
  accountHolder: string;
  defaultDeposit: number;
  insuranceAmount: number;
  checkInTimeText: string; // مثل: الساعة ٥ م
  checkOutTimeText: string; // مثل: الساعة ٢ م
  customContractTemplate?: string;
}

export type BookingStatus = 'pending_payment' | 'waiting_deposit' | 'confirmed' | 'completed' | 'cancelled';
export type CommissionStatus = 'pending' | 'ready_for_payout' | 'paid';

export interface Booking {
  id: string;
  bookingNumber: string; // e.g. BK-2026-101
  propertyId: PropertyId;
  propertyName: string;
  sectionId?: string; // e.g. 'section-1' | 'section-2' | 'all'
  sectionName?: string; // e.g. 'القسم الأول' | 'القسم الثاني' | 'كامل الاستراحة'
  customerName: string;
  customerPhone: string;
  customerNationalId?: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nightsCount: number;
  nightlyPrice: number;
  totalPrice: number; // إجمالي قيمة الحجز
  taxAmount: number;
  discount: number;
  depositPaid: number; // العربون
  remainingAmount: number; // المتبقي
  insuranceAmount: number; // التأمين
  depositReceiptUrl?: string | null; // صورة أو اسم إيصال السداد المرفق
  marketerId?: string; // إذا كان الحجز تم عبر مسوق
  marketerName?: string;
  marketerCommission: number; // 5% من القيمة الإجمالية
  commissionStatus: CommissionStatus;
  status: BookingStatus;
  createdAt: string;
  notes?: string;
  contractSigned: boolean;
  contractMessage?: string;
  // متابعة خروج وتأمين النزيل
  checkedOut?: boolean;
  checkedOutAt?: string;
  insuranceReturned?: boolean;
  insuranceReturnedAt?: string;
}

export type DayStatus = 'available' | 'booked' | 'waiting_deposit' | 'blocked';

export interface DateOverride {
  price?: number;
  status?: DayStatus;
  reason?: string;
  season?: PricingSeason;
  waitingDepositExpiresAt?: number; // timestamp ms
  waitingCustomerName?: string;
  waitingCustomerPhone?: string;
  waitingDepositAmount?: number;
  waitingMarketerName?: string;
  waitingMarketerId?: string;
  waitingBookingId?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'booking' | 'commission' | 'permission' | 'deposit_request' | 'deposit_confirmed' | 'deposit_expired' | 'checkout' | 'insurance' | 'system';
  targetAudience?: 'all' | 'admin_and_guard' | 'admin_only' | 'marketers';
  linkToBookingId?: string;
}

export interface MessageTemplates {
  depositRequest: string; // صيغة طلب العربون
  bookingConfirmation: string; // صيغة تأكيد الحجز
  paymentCompletion: string; // صيغة طلب إكمال الدفع
  contract: string; // صيغة العقد
  checkoutReminder?: string; // صيغة تذكير الخروج
  quickResponses: Record<string, string>; // اختصارات الردود السريعة
}
