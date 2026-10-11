import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Role,
  Marketer,
  MarketerPermissions,
  Guard,
  Property,
  PropertyId,
  PropertySection,
  Booking,
  BookingStatus,
  CommissionStatus,
  ActivityLog,
  NotificationItem,
  DayStatus,
  DateOverride,
  PricingSeason,
  MessageTemplates,
  UserAccount,
} from '../types';
import {
  isWebNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  playNotificationChime,
  sendWebNotification,
} from '../utils/webNotifications';
import {
  INITIAL_PROPERTIES,
  INITIAL_MARKETERS,
  INITIAL_GUARD,
  INITIAL_BOOKINGS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_NOTIFICATIONS,
  DEFAULT_MESSAGE_TEMPLATES,
  INITIAL_USER_ACCOUNTS,
} from '../data/mockData';

export type TabType = 'calendar' | 'bookings' | 'dashboard' | 'properties' | 'marketers' | 'more';

interface AppContextType {
  // Navigation
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Active Role / Impersonation & Auth
  userRole: Role;
  currentMarketerId: string;
  currentMarketer: Marketer | null;
  guard: Guard;
  isAdmin: boolean;
  isGuard: boolean;
  activePermissions: MarketerPermissions;
  switchUser: (role: Role, marketerId?: string) => void;
  updateGuardProfile: (data: Partial<Guard>) => void;

  // AMASA Auth & User Accounts (Gmail & Custom Passwords)
  userAccounts: UserAccount[];
  currentUserAccount: UserAccount;
  loginWithGmailAndPassword: (email: string, password: string) => { success: boolean; message: string };
  loginWithGoogleQuick: (accountId: string) => void;
  changePassword: (emailOrId: string, newPassword: string) => { success: boolean; message: string };
  updateUserAccount: (accountId: string, data: Partial<UserAccount>) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'change_password' | 'quick_select';
  setAuthModalMode: (mode: 'login' | 'change_password' | 'quick_select') => void;
  openAuthModal: (mode?: 'login' | 'change_password' | 'quick_select') => void;

  // Specific Direct Permission Checks (Contract, Deposit, Calendar, Properties, Dashboard & Marketers visibility)
  canCreateContract: boolean;
  canEditDeposit: boolean;
  canViewCalendar: boolean;
  canViewProperties: boolean;
  canViewDashboard: boolean;
  canViewMarketers: boolean;
  canManageTemplates: boolean;
  canViewRentalContract: boolean;
  canViewActivityLogs: boolean;
  grantAllMarketersContractAndDepositPermissions: () => void;
  updateWaitingDepositAmount: (propertyId: PropertyId, dates: string[], newDeposit: number) => void;

  // Properties
  properties: Property[];
  selectedPropertyId: PropertyId;
  selectedProperty: Property;
  setSelectedPropertyId: (id: PropertyId) => void;
  updateProperty: (id: PropertyId, data: Partial<Property>) => void;
  updatePropertySection: (propertyId: PropertyId, sectionId: string, data: Partial<PropertySection>) => void;
  togglePropertyPublished: (id: PropertyId) => void;

  // Marketers & Permissions
  marketers: Marketer[];
  updateMarketerPermissions: (marketerId: string, newPermissions: Partial<MarketerPermissions>) => void;
  updateMarketerProfile: (marketerId: string, data: Partial<Marketer>) => void;
  addMarketer: (data: { name: string; email: string; phone: string; bankAccount?: string; bankName?: string; nationalId?: string }) => void;
  payMarketerCommission: (bookingId: string) => void;
  payoutAllMarketerCommissions: (marketerId: string) => void;

  // Bookings
  bookings: Booking[];
  filteredBookings: Booking[];
  todayArrivals: Booking[];
  todayDepartures: Booking[];
  addBooking: (bookingData: {
    propertyId: PropertyId;
    customerName: string;
    customerPhone: string;
    customerNationalId?: string;
    sectionId?: string;
    sectionName?: string;
    checkInDate: string;
    checkOutDate: string;
    nightsCount: number;
    nightlyPrice: number;
    totalPrice: number;
    discount?: number;
    depositPaid?: number;
    remainingAmount?: number;
    insuranceAmount?: number;
    marketerId?: string;
    notes?: string;
  }) => Booking;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  cancelBooking: (bookingId: string) => void;

  // 3 Checkout & Insurance Actions (دخول وخروج اليوم)
  sendCheckoutReminder: (bookingId: string) => { whatsappUrl: string; message: string };
  markCheckedOut: (bookingId: string) => void;
  returnInsuranceDeposit: (bookingId: string) => void;

  // Calendar date overrides & Deposit holding
  dateOverrides: Record<string, DateOverride>;
  setDateOverride: (propertyId: PropertyId, date: string, data: Partial<DateOverride>) => void;
  setDateOverridesBulk: (propertyId: PropertyId, dates: string[], data: Partial<DateOverride>) => void;
  applySeasonalPricingPattern: (propertyId: PropertyId, dates: string[], season: PricingSeason) => void;

  // 15-Minute Deposit Workflow
  requestDeposit: (params: {
    propertyId: PropertyId;
    dates: string[];
    customerName: string;
    customerPhone: string;
    depositAmount: number;
    totalPrice: number;
    nightsCount: number;
    marketerId?: string;
    sectionName?: string;
  }) => { whatsappUrl: string; message: string };

  cancelDepositWait: (propertyId: PropertyId, dates: string[]) => void;

  confirmBookingWithReceipt: (params: {
    propertyId: PropertyId;
    dates: string[];
    customerName: string;
    customerPhone: string;
    depositPaid: number;
    totalPrice: number;
    remainingAmount: number;
    insuranceAmount: number;
    receiptFileName: string;
    marketerId?: string;
    notes?: string;
    sectionId?: string;
    sectionName?: string;
  }) => { booking: Booking; whatsappContractUrl: string; contractText: string };

  // Notifications & Logs
  notifications: NotificationItem[];
  filteredNotifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationsAsRead: () => void;
  activityLogs: ActivityLog[];

  // Message & Contract Templates
  messageTemplates: MessageTemplates;
  updateMessageTemplates: (templates: Partial<MessageTemplates>) => void;
  resetMessageTemplates: () => void;
  templatesModalOpen: boolean;
  setTemplatesModalOpen: (open: boolean) => void;
  activeTemplateTab: keyof MessageTemplates;
  openTemplatesModal: (tab?: keyof MessageTemplates) => void;
  sendPaymentCompletionRequest: (bookingId: string) => { whatsappUrl: string; message: string };

  // Modal helpers
  bookingModalOpen: boolean;
  setBookingModalOpen: (open: boolean) => void;
  preselectedDateForBooking: string | null;
  setPreselectedDateForBooking: (date: string | null) => void;

  // Reset
  resetAllData: () => void;

  // Current system clock tick for reactive countdowns
  nowTimestamp: number;

  // Browser Web Notifications & Audio Alert System (تنبيهات المتصفح الفورية)
  browserNotificationPermission: NotificationPermission | 'unsupported';
  requestBrowserNotificationPermission: () => Promise<NotificationPermission | 'unsupported'>;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  activeToast: { title: string; body: string; type: string; id: string } | null;
  dismissToast: () => void;
  triggerBrowserNotification: (title: string, body: string, type?: string) => void;
  sendTestNotification: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER_ROLE: 'gathern_user_role_v3',
  MARKETER_ID: 'gathern_marketer_id_v3',
  GUARD: 'gathern_guard_v3',
  PROPERTIES: 'gathern_properties_v3',
  SELECTED_PROPERTY: 'gathern_selected_property_v3',
  MARKETERS: 'gathern_marketers_v3',
  BOOKINGS: 'gathern_bookings_v3',
  OVERRIDES: 'gathern_overrides_v3',
  LOGS: 'gathern_logs_v3',
  NOTIFICATIONS: 'gathern_notifications_v3',
  TEMPLATES: 'gathern_message_templates_v3',
  USER_ACCOUNTS: 'amasa_user_accounts_v1',
};

export const formatMessageTemplate = (
  template: string,
  vars: Record<string, string | number | undefined | null>
) => {
  let result = template;
  Object.entries(vars).forEach(([key, val]) => {
    const reg = new RegExp(`{\\s*${key}\\s*}`, 'g');
    result = result.replace(reg, String(val ?? ''));
  });
  return result;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');

  // Role state
  const [userRole, setUserRole] = useState<Role>(() => {
    return (localStorage.getItem(STORAGE_KEYS.USER_ROLE) as Role) || 'admin';
  });
  const [currentMarketerId, setCurrentMarketerId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.MARKETER_ID) || 'm1';
  });

  // User Accounts state (AMASA Gmail + Password system)
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_ACCOUNTS);
    if (!saved) return INITIAL_USER_ACCOUNTS;
    try {
      const parsed: UserAccount[] = JSON.parse(saved);
      // Ensure all initial accounts exist with their emails
      const merged = [...parsed];
      INITIAL_USER_ACCOUNTS.forEach((initAcc) => {
        if (!merged.some((m) => m.id === initAcc.id)) {
          merged.push(initAcc);
        }
      });
      return merged;
    } catch {
      return INITIAL_USER_ACCOUNTS;
    }
  });

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'change_password' | 'quick_select'>('quick_select');

  // Guard profile
  const [guard, setGuard] = useState<Guard>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GUARD);
    return saved ? JSON.parse(saved) : INITIAL_GUARD;
  });

  // Properties state
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    if (!saved) return INITIAL_PROPERTIES;
    try {
      const parsed: Property[] = JSON.parse(saved);
      return parsed.map((p) => {
        const initial = INITIAL_PROPERTIES.find((init) => init.id === p.id);
        if (initial?.sections && (!p.sections || p.sections.length === 0)) {
          return { ...p, sections: initial.sections, subUnitsCount: initial.subUnitsCount };
        }
        return p;
      });
    } catch {
      return INITIAL_PROPERTIES;
    }
  });
  const [selectedPropertyId, setSelectedPropertyId] = useState<PropertyId>(() => {
    return (localStorage.getItem(STORAGE_KEYS.SELECTED_PROPERTY) as PropertyId) || 'al-baylasan';
  });

  // Marketers state (ensuring contract & deposit permissions are enabled for all employees)
  const [marketers, setMarketers] = useState<Marketer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MARKETERS);
    if (!saved) return INITIAL_MARKETERS;
    try {
      const parsed: Marketer[] = JSON.parse(saved);
      return parsed.map((m) => {
        const init = INITIAL_MARKETERS.find((im) => im.id === m.id);
        return {
          ...m,
          email: m.email?.includes('@') ? m.email : init?.email || `${m.id}@gmail.com`,
          phone: m.phone || init?.phone || '0500000000',
          nationalId: m.nationalId || init?.nationalId || '1000000000',
          contract: m.contract || init?.contract || {
            contractNumber: `MKT-CTR-2026-${m.code?.replace('MK-', '') || '100'}`,
            contractDate: m.joinDate || '2026-01-01',
            expiryDate: '2027-01-01',
            commissionRatePercent: 5,
            status: 'active',
            firstParty: 'إدارة استراحات وشاليهات ماسة (AMASA)',
            firstPartyRepresentative: 'المدير العام التنفيذي',
            secondParty: m.name,
            secondPartyPhone: m.phone || '0500000000',
            secondPartyEmail: m.email || `${m.id}@gmail.com`,
            terms: [
              'يستحق المسوق عمولة تسويق ثابتة قدرها 5% من القيمة الإجمالية لكل حجز مؤكد ومكتمل يتم إبرامه عبر رمزه التسويقي المعتمد.',
              'يتم تحويل العمولات المستحقة دورياً وفورياً إلى الحساب البنكي المعتمد للمسوق.',
              'يلتزم المسوق بالترويج بالأسعار الرسمية المعتمدة والحفاظ على سرية وخصوصية بيانات العملاء.'
            ],
            isSigned: true,
            signedDate: m.joinDate || '2026-01-01',
            notes: 'عقد وساطة وتسويق موثق إلكترونياً'
          },
          permissions: {
            ...m.permissions,
            canCreateContract: m.permissions?.canCreateContract ?? true,
            canEditDeposit: m.permissions?.canEditDeposit ?? true,
            canViewCalendar: m.permissions?.canViewCalendar ?? true,
            canViewProperties: m.permissions?.canViewProperties ?? true,
            canViewDashboard: m.permissions?.canViewDashboard ?? true,
            canViewMarketers: m.permissions?.canViewMarketers ?? true,
            canManageTemplates: m.permissions?.canManageTemplates ?? true,
            canViewRentalContract: m.permissions?.canViewRentalContract ?? true,
            canViewActivityLogs: m.permissions?.canViewActivityLogs ?? true,
          },
        };
      });
    } catch {
      return INITIAL_MARKETERS;
    }
  });

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  // Calendar date overrides (key: `${propertyId}_${date}`)
  const [dateOverrides, setDateOverrides] = useState<Record<string, DateOverride>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OVERRIDES);
    return saved ? JSON.parse(saved) : {};
  });

  // Logs and notifications
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [preselectedDateForBooking, setPreselectedDateForBooking] = useState<string | null>(null);

  // Message & Contract Templates state
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplates>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (!saved) return DEFAULT_MESSAGE_TEMPLATES;
    try {
      const parsed = JSON.parse(saved);
      // If depositRequest still has the old version, upgrade to the newly refined formula
      if (
        !parsed.depositRequest ||
        parsed.depositRequest.includes('مرحباً بك أخي الكريم {اسم_العميل}،')
      ) {
        parsed.depositRequest = DEFAULT_MESSAGE_TEMPLATES.depositRequest;
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return DEFAULT_MESSAGE_TEMPLATES;
    }
  });
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState<keyof MessageTemplates>('depositRequest');

  const updateMessageTemplates = (data: Partial<MessageTemplates>) => {
    setMessageTemplates((prev) => {
      const next = { ...prev, ...data };
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(next));
      return next;
    });
    addActivityLog(
      isAdmin ? 'الإدارة' : 'النظام',
      userRole,
      'تحديث قوالب الرسائل والعقود',
      'تم تحديث وتعديل صيغ رسائل الواتساب والعقد بنجاح'
    );
  };

  const resetMessageTemplates = () => {
    setMessageTemplates(DEFAULT_MESSAGE_TEMPLATES);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(DEFAULT_MESSAGE_TEMPLATES));
    addActivityLog(
      isAdmin ? 'الإدارة' : 'النظام',
      userRole,
      'استعادة قوالب الرسائل الافتراضية',
      'تمت استعادة كافة صيغ الرسائل والعقود إلى الوضع الافتراضي'
    );
  };

  const openTemplatesModal = (tab?: keyof MessageTemplates) => {
    if (tab) setActiveTemplateTab(tab);
    setTemplatesModalOpen(true);
  };

  // Browser Web Notifications & Audio Alert System
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => getNotificationPermission());

  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('gathern_sound_enabled_v3');
    return saved !== null ? saved === 'true' : true;
  });

  const [activeToast, setActiveToast] = useState<{
    title: string;
    body: string;
    type: string;
    id: string;
  } | null>(null);

  const toggleSound = () => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('gathern_sound_enabled_v3', String(next));
      if (next) {
        playNotificationChime(true);
      }
      return next;
    });
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const requestBrowserNotificationPermission = async () => {
    const perm = await requestNotificationPermission();
    setBrowserNotificationPermission(perm);
    if (perm === 'granted') {
      triggerBrowserNotification(
        '🔔 تم تفعيل إشعارات المتصفح بنجاح!',
        'ستصلك تنبيهات فورية عند وصول أي حجز جديد أو تأكيد دفع عربون لتنبيه الموظفين والمسوقين فوراً.',
        'deposit_confirmed'
      );
    }
    return perm;
  };

  const triggerBrowserNotification = (title: string, body: string, type = 'booking') => {
    // 1. In-app floating toast banner
    setActiveToast({
      id: `toast-${Date.now()}-${Math.random()}`,
      title,
      body,
      type,
    });

    // 2. Play audio alert chime
    if (isSoundEnabled) {
      playNotificationChime(true);
    }

    // 3. Desktop / Mobile Browser Web Notification
    sendWebNotification(title, {
      body,
      playSound: false,
      tag: `booking-notif-${Date.now()}`,
    });
  };

  const sendTestNotification = () => {
    triggerBrowserNotification(
      '🔔 تجربة نظام تنبيهات المتصفح (Web Notification)',
      'هذا تنبيه تجريبي لتأكيد وصول إشعارات الحجوزات ودفع العربون فوراً للموظفين والمسوقين مع نغمة التنبيه!',
      'deposit_confirmed'
    );
  };

  // Global ticking clock for 15-minute timers
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check expired deposit holds every tick
  useEffect(() => {
    let hasExpired = false;
    const updatedOverrides = { ...dateOverrides };

    Object.entries(dateOverrides).forEach(([key, override]) => {
      if (
        override.status === 'waiting_deposit' &&
        override.waitingDepositExpiresAt &&
        override.waitingDepositExpiresAt <= nowTimestamp
      ) {
        hasExpired = true;
        updatedOverrides[key] = {
          ...override,
          status: 'available',
          waitingDepositExpiresAt: undefined,
          waitingCustomerName: undefined,
          waitingCustomerPhone: undefined,
          waitingDepositAmount: undefined,
        };

        const [pId, dateStr] = key.split('_');
        const pName = properties.find((p) => p.id === pId)?.name || pId;

        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}-${Math.random()}`,
            title: 'انتهت مهلة تحويل العربون (15 دقيقة)',
            description: `انتهى عداد العربون لعقار ${pName} في تاريخ ${dateStr}، وعاد اليوم متاحاً للحجز تلقائياً (اللون الأخضر).`,
            timestamp: 'الآن',
            read: false,
            type: 'deposit_expired',
            targetAudience: 'all',
          },
          ...prev,
        ]);

        addActivityLog(
          'النظام التلقائي',
          'system',
          'انتهاء مهلة العربون',
          `انتهت مهلة الـ 15 دقيقة لتحويل العربون لعقار ${pName} في تاريخ ${dateStr}، وعاد التاريخ متاحاً.`
        );
      }
    });

    if (hasExpired) {
      setDateOverrides(updatedOverrides);
    }
  }, [nowTimestamp, dateOverrides, properties]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, userRole);
    localStorage.setItem(STORAGE_KEYS.MARKETER_ID, currentMarketerId);
  }, [userRole, currentMarketerId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GUARD, JSON.stringify(guard));
  }, [guard]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PROPERTY, selectedPropertyId);
  }, [selectedPropertyId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MARKETERS, JSON.stringify(marketers));
  }, [marketers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(dateOverrides));
  }, [dateOverrides]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_ACCOUNTS, JSON.stringify(userAccounts));
  }, [userAccounts]);

  // Derived role details
  const isAdmin = userRole === 'admin';
  const isGuard = userRole === 'guard';

  const currentMarketer = useMemo(() => {
    return marketers.find((m) => m.id === currentMarketerId) || marketers[0] || null;
  }, [marketers, currentMarketerId]);

  const activePermissions = useMemo<MarketerPermissions>(() => {
    if (isAdmin) {
      return {
        canCreateBooking: true,
        canEditPrices: true,
        canViewAllBookings: true,
        canBlockDates: true,
        canViewCustomerContacts: true,
        canExportReports: true,
        canViewFinancials: true,
        canCreateContract: true,
        canEditDeposit: true,
        canViewCalendar: true,
        canViewProperties: true,
        canViewDashboard: true,
        canViewMarketers: true,
        canManageTemplates: true,
        canViewRentalContract: true,
        canViewActivityLogs: true,
      };
    }
    if (isGuard) {
      // Guard can only see arrival and departure customers
      return {
        canCreateBooking: false,
        canEditPrices: false,
        canViewAllBookings: false,
        canBlockDates: false,
        canViewCustomerContacts: true,
        canExportReports: false,
        canViewFinancials: false,
        canCreateContract: false,
        canEditDeposit: false,
        canViewCalendar: false,
        canViewProperties: false,
        canViewDashboard: true,
        canViewMarketers: false,
        canManageTemplates: false,
        canViewRentalContract: false,
        canViewActivityLogs: false,
      };
    }
    return (
      currentMarketer?.permissions || {
        canCreateBooking: true,
        canEditPrices: false,
        canViewAllBookings: false,
        canBlockDates: false,
        canViewCustomerContacts: true,
        canExportReports: false,
        canViewFinancials: false,
        canCreateContract: true,
        canEditDeposit: true,
        canViewCalendar: true,
        canViewProperties: true,
        canViewDashboard: true,
        canViewMarketers: true,
        canManageTemplates: true,
        canViewRentalContract: true,
        canViewActivityLogs: true,
      }
    );
  }, [isAdmin, isGuard, currentMarketer]);

  // Convenience permission helpers for employees & admin
  const canCreateContract = isAdmin || !!activePermissions.canCreateContract;
  const canEditDeposit = isAdmin || !!activePermissions.canEditDeposit;
  const canViewCalendar = isAdmin || activePermissions.canViewCalendar !== false;
  const canViewProperties = isAdmin || activePermissions.canViewProperties !== false;
  const canViewDashboard = isAdmin || activePermissions.canViewDashboard !== false;
  const canViewMarketers = isAdmin || activePermissions.canViewMarketers !== false;
  const canManageTemplates = isAdmin || activePermissions.canManageTemplates !== false;
  const canViewRentalContract = isAdmin || activePermissions.canViewRentalContract !== false;
  const canViewActivityLogs = isAdmin || activePermissions.canViewActivityLogs !== false;

  // Currently logged-in account object
  const currentUserAccount = useMemo<UserAccount>(() => {
    if (isAdmin) {
      return (
        userAccounts.find((u) => u.role === 'admin') ||
        INITIAL_USER_ACCOUNTS[0]
      );
    }
    if (isGuard) {
      return (
        userAccounts.find((u) => u.role === 'guard') ||
        INITIAL_USER_ACCOUNTS[1]
      );
    }
    return (
      userAccounts.find((u) => u.marketerId === currentMarketerId) ||
      userAccounts.find((u) => u.id === currentMarketerId) ||
      userAccounts.find((u) => u.role === 'marketer') ||
      INITIAL_USER_ACCOUNTS[2]
    );
  }, [userAccounts, isAdmin, isGuard, currentMarketerId]);

  const selectedProperty = useMemo(() => {
    return properties.find((p) => p.id === selectedPropertyId) || properties[0];
  }, [properties, selectedPropertyId]);

  // Filter bookings based on active role permissions
  const filteredBookings = useMemo(() => {
    if (isAdmin || activePermissions.canViewAllBookings) {
      return bookings;
    }
    return bookings.filter((b) => b.marketerId === currentMarketerId);
  }, [bookings, isAdmin, activePermissions.canViewAllBookings, currentMarketerId]);

  // Today's Arrivals and Departures (دخول اليوم وخروج اليوم)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todayArrivals = useMemo(() => {
    return bookings.filter(
      (b) =>
        (b.checkInDate === todayStr || b.id === 'bk-today-in' || b.checkInDate === '2026-10-06') &&
        b.status !== 'cancelled'
    );
  }, [bookings, todayStr]);

  const todayDepartures = useMemo(() => {
    return bookings.filter(
      (b) =>
        (b.checkOutDate === todayStr || b.id === 'bk-today-out' || b.checkOutDate === '2026-10-06') &&
        b.status !== 'cancelled'
    );
  }, [bookings, todayStr]);

  // Filtered notifications based on role:
  // - Guard sees only general + admin_and_guard
  // - Admin sees everything
  // - Marketer sees general + marketer
  const filteredNotifications = useMemo(() => {
    if (isAdmin) return notifications;
    if (isGuard) {
      return notifications.filter(
        (n) => n.targetAudience === 'all' || n.targetAudience === 'admin_and_guard'
      );
    }
    return notifications.filter(
      (n) => n.targetAudience !== 'admin_only' && n.targetAudience !== 'admin_and_guard'
    );
  }, [notifications, isAdmin, isGuard]);

  const unreadNotificationsCount = useMemo(() => {
    return filteredNotifications.filter((n) => !n.read).length;
  }, [filteredNotifications]);

  // Actions
  const switchUser = (role: Role, marketerId?: string) => {
    setUserRole(role);
    if (marketerId) {
      setCurrentMarketerId(marketerId);
    }
    let actor = 'مستخدم';
    if (role === 'admin') actor = 'الإدارة (المدير العام)';
    else if (role === 'guard') actor = guard.name;
    else actor = marketers.find((m) => m.id === marketerId)?.name || 'مسوق';

    addActivityLog(actor, role, 'تبديل الحساب', `تم تسجيل الدخول بصلاحية: ${role === 'admin' ? 'الإدارة' : role === 'guard' ? 'الحارس' : 'مسوق'}`);
  };

  const updateGuardProfile = (data: Partial<Guard>) => {
    setGuard((prev) => ({ ...prev, ...data }));
    addActivityLog('الإدارة', 'admin', 'تحديث بيانات الحارس', `تم تحديث بيانات الحارس ${data.name || guard.name}`);
  };

  // AMASA Authentication Methods (Gmail + Custom Password)
  const loginWithGmailAndPassword = (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const account = userAccounts.find(
      (u) => u.email.trim().toLowerCase() === cleanEmail
    );

    if (!account) {
      return {
        success: false,
        message: 'البريد الإلكتروني غير مسجل في النظام. تأكد من إدخال بريد Gmail الصحيح أو اختر من قائمة الدخول السريع.',
      };
    }

    if (account.password && account.password !== password) {
      return {
        success: false,
        message: 'كلمة المرور غير صحيحة. يمكنك إنشاء كلمة سر جديدة أو إعادة تعيينها من تبويب "إنشاء / تغيير كلمة المرور".',
      };
    }

    // Authenticated
    setUserRole(account.role);
    if (account.marketerId) {
      setCurrentMarketerId(account.marketerId);
    }

    addActivityLog(
      account.name,
      account.role,
      'تسجيل الدخول عبر Gmail',
      `تم تسجيل الدخول بنجاح عبر بريد Gmail (${account.email}) بصلاحية: ${
        account.role === 'admin' ? 'الإدارة' : account.role === 'guard' ? 'الحارس' : 'مسوق'
      }`
    );

    triggerBrowserNotification(
      `👋 مرحباً بك في AMASA`,
      `تم تسجيل الدخول بنجاح بحساب (${account.name}) عبر Gmail`,
      'system'
    );

    return {
      success: true,
      message: `مرحباً بك ${account.name}، تم تسجيل الدخول بنجاح!`,
    };
  };

  const loginWithGoogleQuick = (accountId: string) => {
    const account = userAccounts.find((u) => u.id === accountId);
    if (!account) return;
    setUserRole(account.role);
    if (account.marketerId) {
      setCurrentMarketerId(account.marketerId);
    }
    addActivityLog(
      account.name,
      account.role,
      'دخول سريع عبر Google',
      `تم تسجيل الدخول السريع بحساب Gmail (${account.email})`
    );
    triggerBrowserNotification(
      `👋 مرحباً بك في AMASA`,
      `تم تسجيل الدخول بحساب (${account.name})`,
      'system'
    );
  };

  const changePassword = (emailOrId: string, newPassword: string) => {
    if (!newPassword || newPassword.trim().length < 2) {
      return { success: false, message: 'يرجى كتابة كلمة مرور صالحة (مكونة من خانتين على الأقل).' };
    }

    const clean = emailOrId.trim().toLowerCase();
    let accountName = '';

    setUserAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === emailOrId || acc.email.trim().toLowerCase() === clean) {
          accountName = acc.name;
          return { ...acc, password: newPassword, updatedAt: new Date().toISOString() };
        }
        return acc;
      })
    );

    // Also sync password with marketers list if matching
    setMarketers((prev) =>
      prev.map((m) => {
        if (m.id === emailOrId || m.email.trim().toLowerCase() === clean) {
          return { ...m, password: newPassword };
        }
        return m;
      })
    );

    if (guard.id === emailOrId || guard.email.trim().toLowerCase() === clean) {
      setGuard((prev) => ({ ...prev, password: newPassword }));
    }

    addActivityLog(
      accountName || 'المستخدم',
      userRole,
      'تحديث كلمة المرور',
      `تم تعيين كلمة مرور جديدة ومخصصة للحساب: ${accountName || clean}`
    );

    triggerBrowserNotification(
      `🔐 تحديث كلمة المرور`,
      `تم حفظ وتعيين كلمة المرور الجديدة للحساب (${accountName || clean}) بنجاح!`,
      'system'
    );

    return {
      success: true,
      message: `تم تحديث كلمة المرور للحساب ${accountName || clean} بنجاح! يمكنك الآن تسجيل الدخول بها فوراً.`,
    };
  };

  const updateUserAccount = (accountId: string, data: Partial<UserAccount>) => {
    setUserAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, ...data, updatedAt: new Date().toISOString() } : acc))
    );
  };

  const logout = () => {
    setUserRole('admin');
    setIsAuthModalOpen(true);
    setAuthModalMode('login');
    addActivityLog('المستخدم', 'admin', 'تسجيل الخروج', 'تم تسجيل الخروج من الحساب');
  };

  const openAuthModal = (mode: 'login' | 'change_password' | 'quick_select' = 'quick_select') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const grantAllMarketersContractAndDepositPermissions = () => {
    setMarketers((prev) =>
      prev.map((m) => ({
        ...m,
        permissions: {
          ...m.permissions,
          canCreateContract: true,
          canEditDeposit: true,
        },
      }))
    );
    addActivityLog(
      'الإدارة',
      'admin',
      'تفعيل صلاحيات العقود والعربون',
      'تم منح وتفعيل صلاحيات إنشاء العقد وتعديل العربون لجميع الموظفين والمسوقين'
    );
    triggerBrowserNotification(
      '📜 صلاحيات الموظفين المحدثة',
      'تم منح وتفعيل صلاحيات إنشاء العقود وتعديل العربون لجميع الموظفين بنجاح',
      'permission'
    );
  };

  const updateWaitingDepositAmount = (propertyId: PropertyId, dates: string[], newDeposit: number) => {
    setDateOverrides((prev) => {
      const next = { ...prev };
      dates.forEach((d) => {
        const key = `${propertyId}_${d}`;
        if (next[key]) {
          next[key] = {
            ...next[key],
            waitingDepositAmount: newDeposit,
          };
        }
      });
      return next;
    });

    addActivityLog(
      isAdmin ? 'الإدارة' : currentMarketer?.name || 'موظف',
      userRole,
      'تعديل مبلغ العربون قبل التأكيد',
      `تم تعديل مبلغ العربون المطلوب إلى ${newDeposit} ريال للتواريخ المعلقة (${dates.join(', ')})`
    );

    triggerBrowserNotification(
      `✏️ تم تعديل مبلغ العربون`,
      `تم تحديث مبلغ العربون إلى ${newDeposit} ريال قبل تأكيد الحجز`,
      'deposit_request'
    );
  };

  const addActivityLog = (actorName: string, actorRole: string, action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleString('ar-SA', { hour12: false }),
      actorName,
      actorRole,
      action,
      details,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  const updateProperty = (id: PropertyId, data: Partial<Property>) => {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    addActivityLog(
      isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
      userRole,
      'تحديث بيانات عقار',
      `تم تحديث تفاصيل العقار: ${properties.find((p) => p.id === id)?.name || id}`
    );
  };

  const updatePropertySection = (
    propertyId: PropertyId,
    sectionId: string,
    data: Partial<PropertySection>
  ) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== propertyId) return p;
        const currentSections = p.sections || [];
        const updatedSections = currentSections.map((sec) =>
          sec.id === sectionId ? { ...sec, ...data } : sec
        );
        return { ...p, sections: updatedSections };
      })
    );
    const secName = sectionId === 'section-1' ? 'القسم الأول' : 'القسم الثاني';
    addActivityLog(
      isAdmin ? 'الإدارة' : currentMarketer?.name || 'مسوق',
      userRole,
      'تحديث معلومات وسعر القسم',
      `تم تحديث مواصفات وسعر ${secName} لعقار الترف بنجاح`
    );
  };

  const togglePropertyPublished = (id: PropertyId) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.isPublished;
          addActivityLog(
            'الإدارة',
            'admin',
            nextState ? 'فتح العقار لجميع الأيام' : 'إيقاف العقار كامل لجميع الأيام',
            nextState
              ? `تم فتح العقار (${p.name}) كامل لجميع الأيام واستكمال إنشاء الحجوزات`
              : `تم إيقاف العقار (${p.name}) كامل لجميع الأيام وتعطيل إنشاء الحجوزات`
          );
          return { ...p, isPublished: nextState };
        }
        return p;
      })
    );
  };

  const updateMarketerPermissions = (marketerId: string, newPermissions: Partial<MarketerPermissions>) => {
    setMarketers((prev) =>
      prev.map((m) => {
        if (m.id === marketerId) {
          return {
            ...m,
            permissions: { ...m.permissions, ...newPermissions },
          };
        }
        return m;
      })
    );
  };

  const updateMarketerProfile = (marketerId: string, data: Partial<Marketer>) => {
    setMarketers((prev) =>
      prev.map((m) => {
        if (m.id === marketerId) {
          const updated = {
            ...m,
            ...data,
            contract: data.contract ? { ...m.contract, ...data.contract } : m.contract,
          };
          return updated;
        }
        return m;
      })
    );

    // Also keep userAccounts in sync
    setUserAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === marketerId || acc.marketerId === marketerId) {
          return {
            ...acc,
            name: data.name ?? acc.name,
            email: data.email ?? acc.email,
            phone: data.phone ?? acc.phone,
          };
        }
        return acc;
      })
    );

    addActivityLog(
      'الإدارة',
      'admin',
      'تحديث بيانات المسوق',
      `تم تحديث الملف الشخصي وبيانات العقد للمسوق: ${data.name || marketerId}`
    );
  };

  const addMarketer = (data: {
    name: string;
    email: string;
    phone: string;
    bankAccount?: string;
    bankName?: string;
    nationalId?: string;
  }) => {
    const nextCode = `MK-${100 + marketers.length + 1}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const expiryStr = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newMarketer: Marketer = {
      id: `m${Date.now()}`,
      name: data.name,
      email: data.email,
      password: '123',
      phone: data.phone,
      bankAccount: data.bankAccount || '',
      bankName: data.bankName || 'مصرف الراجحي',
      nationalId: data.nationalId || '1000000000',
      avatar: `https://images.unsplash.com/photo-${1530000000000 + marketers.length}?auto=format&fit=crop&w=200&q=80`,
      code: nextCode,
      commissionRate: 0.05,
      joinDate: todayStr,
      contract: {
        contractNumber: `MKT-CTR-2026-${100 + marketers.length + 1}`,
        contractDate: todayStr,
        expiryDate: expiryStr,
        commissionRatePercent: 5,
        status: 'active',
        firstParty: 'إدارة استراحات وشاليهات ماسة (AMASA)',
        firstPartyRepresentative: 'المدير العام التنفيذي',
        secondParty: data.name,
        secondPartyPhone: data.phone,
        secondPartyEmail: data.email,
        secondPartyNationalId: data.nationalId || '1000000000',
        terms: [
          'يستحق المسوق عمولة تسويق ثابتة قدرها 5% من القيمة الإجمالية لكل حجز مؤكد ومكتمل يتم إبرامه عبر رمزه التسويقي المعتمد.',
          'يتم تحويل العمولات المستحقة دورياً وفورياً إلى الحساب البنكي المعتمد للمسوق.',
          'يلتزم المسوق بالترويج وفق سياسات وأسعار شاليهات ماسة الرسمية، والحفاظ التام على سرية وخصوصية بيانات النزلاء.',
          'يمنح المسوق صلاحية إصدار عقود الإيجار المعتمدة وتعديل مبالغ العربون المبدئي لتسهيل الحجوزات.'
        ],
        isSigned: true,
        signedDate: todayStr,
        notes: 'عقد وساطة وتسويق موثق إلكترونياً'
      },
      permissions: {
        canCreateBooking: true,
        canEditPrices: false,
        canViewAllBookings: false,
        canBlockDates: false,
        canViewCustomerContacts: true,
        canExportReports: true,
        canViewFinancials: false,
        canCreateContract: true,
        canEditDeposit: true,
        canViewCalendar: true,
        canViewProperties: true,
        canViewDashboard: true,
        canViewMarketers: true,
        canManageTemplates: true,
        canViewRentalContract: true,
        canViewActivityLogs: true,
      },
    };
    setMarketers((prev) => [...prev, newMarketer]);
    setUserAccounts((prev) => [
      ...prev,
      {
        id: newMarketer.id,
        role: 'marketer',
        marketerId: newMarketer.id,
        name: data.name,
        email: data.email,
        password: '123',
        phone: data.phone,
        avatar: newMarketer.avatar,
        createdAt: new Date().toISOString(),
      },
    ]);
    addActivityLog('الإدارة', 'admin', 'إضافة مسوق جديد', `تم تسجيل المسوق الجديد: ${data.name} بنسبة عمولة 5% وإصدار العقد الرسمي`);
  };

  const setDateOverride = (propertyId: PropertyId, date: string, data: Partial<DateOverride>) => {
    const key = `${propertyId}_${date}`;
    setDateOverrides((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...data,
      },
    }));
  };

  const setDateOverridesBulk = (propertyId: PropertyId, dates: string[], data: Partial<DateOverride>) => {
    setDateOverrides((prev) => {
      const next = { ...prev };
      dates.forEach((d) => {
        const key = `${propertyId}_${d}`;
        next[key] = {
          ...next[key],
          ...data,
        };
      });
      return next;
    });
  };

  const applySeasonalPricingPattern = (propertyId: PropertyId, dates: string[], season: PricingSeason) => {
    const prop = properties.find((p) => p.id === propertyId) || selectedProperty;
    const seasonPrice = prop.seasonalPricing[season] || prop.basePriceWeekday;

    setDateOverridesBulk(propertyId, dates, {
      price: seasonPrice,
      season,
    });
  };

  // 15-Minute Deposit Workflow
  const requestDeposit = ({
    propertyId,
    dates,
    customerName,
    customerPhone,
    depositAmount,
    totalPrice,
    nightsCount,
    marketerId,
    sectionName,
  }: {
    propertyId: PropertyId;
    dates: string[];
    customerName: string;
    customerPhone: string;
    depositAmount: number;
    totalPrice: number;
    nightsCount: number;
    marketerId?: string;
    sectionName?: string;
  }) => {
    const prop = properties.find((p) => p.id === propertyId) || selectedProperty;
    const effectivePropName = sectionName ? `${prop.name} (${sectionName})` : prop.name;
    const effectiveMarketer = marketers.find((m) => m.id === (marketerId || currentMarketerId));

    const expiresAt = Date.now() + 15 * 60 * 1000;

    setDateOverrides((prev) => {
      const next = { ...prev };
      dates.forEach((d) => {
        const key = `${propertyId}_${d}`;
        next[key] = {
          ...next[key],
          status: 'waiting_deposit',
          waitingDepositExpiresAt: expiresAt,
          waitingCustomerName: customerName,
          waitingCustomerPhone: customerPhone,
          waitingDepositAmount: depositAmount,
          waitingMarketerName: effectiveMarketer?.name,
          waitingMarketerId: effectiveMarketer?.id,
        };
      });
      return next;
    });

    const notifMsg = `⚠️ طلب عربون جديد لعقار (${effectivePropName}) للعميل ${customerName} بمبلغ ${depositAmount} ريال. التواريخ معلقة باللون الأصفر لمدة 15 دقيقة للتحويل!`;
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `طلب عربون جديد (مهلة 15 دقيقة) - ${effectivePropName}`,
        description: notifMsg,
        timestamp: 'الآن',
        read: false,
        type: 'deposit_request',
        targetAudience: 'all',
      },
      ...prev,
    ]);

    // Web Notifications & Sound Chime & Toast
    triggerBrowserNotification(
      `⏳ طلب عربون جديد (مهلة 15 دقيقة) - ${effectivePropName}`,
      `تم طلب عربون بقيمة ${depositAmount} ريال للعميل ${customerName} لعقار ${effectivePropName} لحفظ الحجز فوراً`,
      'deposit_request'
    );

    const text = formatMessageTemplate(messageTemplates.depositRequest, {
      اسم_العميل: customerName,
      رقم_الجوال: customerPhone,
      اسم_العقار: effectivePropName,
      عدد_الليالي: nightsCount,
      مبلغ_العربون: depositAmount,
      المبلغ_الإجمالي: totalPrice,
      المبلغ_المتبقي: totalPrice - depositAmount,
      مبلغ_التأمين: prop.insuranceAmount,
      اسم_البنك: prop.bankName,
      اسم_الحساب: prop.accountHolder,
      رقم_الآيبان: prop.iban,
      مهلة_الدفع: '15 دقيقة',
    });

    const cleanPhone = customerPhone.replace(/\D/g, '').replace(/^0/, '966');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;

    return { whatsappUrl, message: text };
  };

  const cancelDepositWait = (propertyId: PropertyId, dates: string[]) => {
    setDateOverrides((prev) => {
      const next = { ...prev };
      dates.forEach((d) => {
        const key = `${propertyId}_${d}`;
        next[key] = {
          ...next[key],
          status: 'available',
          waitingDepositExpiresAt: undefined,
          waitingCustomerName: undefined,
          waitingCustomerPhone: undefined,
          waitingDepositAmount: undefined,
        };
      });
      return next;
    });
  };

  // 3 Checkout & Insurance Actions (دخول وخروج اليوم)
  // 1. الزر الأول: تذكير خروج (رسالة واتساب مطابقة للنص المطلوب تماماً)
  const sendCheckoutReminder = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    const prop = properties.find((p) => p.id === booking?.propertyId) || selectedProperty;
    const templateToUse =
      messageTemplates.checkoutReminder ||
      'عذرا عن الازعاج ومنعا للاحراج تذكير خروج الساعة 2 م وذلك تفاديا عن خصم مبلغ من التامين كما هو موضح بالعقد';
    const message = formatMessageTemplate(templateToUse, {
      اسم_العميل: booking?.customerName || '',
      رقم_الجوال: booking?.customerPhone || '',
      اسم_العقار: booking?.propertyName || prop.name,
      وقت_الخروج: prop.checkOutTimeText || 'الساعة 2 م',
    });

    const cleanPhone = (booking?.customerPhone || '0550000000').replace(/\D/g, '').replace(/^0/, '966');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    addActivityLog(
      isAdmin ? 'الإدارة' : isGuard ? guard.name : currentMarketer?.name || 'موظف',
      userRole,
      'إرسال تذكير خروج',
      `تم إرسال تذكير الخروج عبر واتساب للعميل ${booking?.customerName} لعقار ${booking?.propertyName}`
    );

    window.open(whatsappUrl, '_blank');
    return { whatsappUrl, message };
  };

  // رسالة طلب إكمال الدفع / سداد المتبقي عبر واتساب
  const sendPaymentCompletionRequest = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { whatsappUrl: '', message: '' };
    const prop = properties.find((p) => p.id === booking.propertyId) || selectedProperty;

    const message = formatMessageTemplate(messageTemplates.paymentCompletion, {
      اسم_العميل: booking.customerName,
      رقم_الجوال: booking.customerPhone,
      اسم_العقار: booking.propertyName,
      رقم_الحجز: booking.bookingNumber,
      تاريخ_الدخول: booking.checkInDate,
      وقت_الدخول: prop.checkInTimeText,
      تاريخ_الخروج: booking.checkOutDate,
      وقت_الخروج: prop.checkOutTimeText,
      عدد_الليالي: booking.nightsCount,
      المبلغ_الإجمالي: booking.totalPrice,
      مبلغ_العربون: booking.depositPaid,
      المبلغ_المتبقي: booking.remainingAmount,
      مبلغ_التأمين: booking.insuranceAmount,
      اسم_البنك: prop.bankName,
      اسم_الحساب: prop.accountHolder,
      رقم_الآيبان: prop.iban,
    });

    const cleanPhone = (booking.customerPhone || '0550000000').replace(/\D/g, '').replace(/^0/, '966');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    addActivityLog(
      isAdmin ? 'الإدارة' : isGuard ? guard.name : currentMarketer?.name || 'موظف',
      userRole,
      'إرسال طلب إكمال الدفع',
      `تم إرسال طلب سداد المتبقي (${booking.remainingAmount} ريال) عبر واتساب للعميل ${booking.customerName} لحجز ${booking.bookingNumber}`
    );

    window.open(whatsappUrl, '_blank');
    return { whatsappUrl, message };
  };

  // 2. الزر الثاني: تم الخروج (إشعار للحارس وللإدارة فقط)
  const markCheckedOut = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              checkedOut: true,
              checkedOutAt: timeStr,
              status: 'completed',
            }
          : b
      )
    );

    // Notification target: admin_and_guard ONLY!
    setNotifications((prev) => [
      {
        id: `notif-checkout-${Date.now()}`,
        title: `🚪 تم خروج النزيل - ${booking.propertyName}`,
        description: `أكد النزيل (${booking.customerName}) خروجه من عقار ${booking.propertyName} في تمام الساعة ${timeStr} وجاري معاينة المكان من قبل الحارس.`,
        timestamp: 'الآن',
        read: false,
        type: 'checkout',
        targetAudience: 'admin_and_guard',
        linkToBookingId: booking.id,
      },
      ...prev,
    ]);

    addActivityLog(
      isAdmin ? 'الإدارة' : isGuard ? guard.name : 'موظف',
      userRole,
      'تسجيل خروج النزيل',
      `تم تسجيل خروج العميل ${booking.customerName} من عقار ${booking.propertyName} وإشعار الحارس والإدارة فقط.`
    );
  };

  // 3. الزر الثالث: تسليم التأمين (إشعار للإدارة فقط)
  const returnInsuranceDeposit = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              insuranceReturned: true,
              insuranceReturnedAt: timeStr,
            }
          : b
      )
    );

    // Notification target: admin_only ONLY!
    setNotifications((prev) => [
      {
        id: `notif-insurance-${Date.now()}`,
        title: `💵 تم تسليم وإرجاع التأمين - ${booking.propertyName}`,
        description: `تم استرجاع وتسليم مبلغ التأمين (${booking.insuranceAmount} ريال) للعميل ${booking.customerName} بعد فحص عقار ${booking.propertyName} والتأكد من خلوه من أي تلفيات.`,
        timestamp: 'الآن',
        read: false,
        type: 'insurance',
        targetAudience: 'admin_only',
        linkToBookingId: booking.id,
      },
      ...prev,
    ]);

    addActivityLog(
      isAdmin ? 'الإدارة' : isGuard ? guard.name : 'موظف',
      userRole,
      'تسليم التأمين للعميل',
      `تم تسليم مبلغ التأمين (${booking.insuranceAmount} ريال) للعميل ${booking.customerName} وإشعار الإدارة فقط.`
    );
  };

  const confirmBookingWithReceipt = ({
    propertyId,
    dates,
    customerName,
    customerPhone,
    depositPaid,
    totalPrice,
    remainingAmount,
    insuranceAmount,
    receiptFileName,
    marketerId,
    notes,
    sectionId,
    sectionName,
  }: {
    propertyId: PropertyId;
    dates: string[];
    customerName: string;
    customerPhone: string;
    depositPaid: number;
    totalPrice: number;
    remainingAmount: number;
    insuranceAmount: number;
    receiptFileName: string;
    marketerId?: string;
    notes?: string;
    sectionId?: string;
    sectionName?: string;
  }) => {
    const prop = properties.find((p) => p.id === propertyId) || selectedProperty;
    const effectivePropName = sectionName ? `${prop.name} (${sectionName})` : prop.name;
    const effectiveMarketer = marketers.find((m) => m.id === (marketerId || currentMarketerId));

    const sortedDates = [...dates].sort();
    const checkInDate = sortedDates[0];
    const lastNight = sortedDates[sortedDates.length - 1];

    const lastDateObj = new Date(lastNight);
    lastDateObj.setDate(lastDateObj.getDate() + 1);
    const checkOutDate = lastDateObj.toISOString().split('T')[0];

    const nightsCount = sortedDates.length;
    const nightlyPrice = Math.round(totalPrice / Math.max(1, nightsCount));
    const commissionValue = effectiveMarketer ? Math.round(totalPrice * 0.05) : 0;

    const checkInDateObj = new Date(checkInDate);
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    const checkInDayName = dayNames[checkInDateObj.getDay()];
    const checkInDayNum = checkInDateObj.getDate();
    const checkInMonthNum = checkInDateObj.getMonth() + 1;
    const checkInMonthName = monthNames[checkInDateObj.getMonth()];
    const checkInYear = checkInDateObj.getFullYear();

    const checkOutDateObj = new Date(checkOutDate);
    const checkOutDayName = dayNames[checkOutDateObj.getDay()];
    const checkOutDayNum = checkOutDateObj.getDate();
    const checkOutMonthNum = checkOutDateObj.getMonth() + 1;
    const checkOutMonthName = monthNames[checkOutDateObj.getMonth()];
    const checkOutYear = checkOutDateObj.getFullYear();

    const formattedContractTerms = prop.contractTerms.map((t, idx) => `${idx + 1}. ${t}`).join('\n');
    let contractText = formatMessageTemplate(messageTemplates.contract, {
      اسم_العقار: prop.name === 'كوخ البيلسان' ? 'كوخ زهرة البيلسان 🏕️' : `${effectivePropName} 🏕️`,
      اسم_العميل: customerName,
      رقم_الجوال: customerPhone,
      تاريخ_الدخول: `${checkInDayName} ${checkInDayNum} ${checkInMonthName} ( ${checkInMonthNum} ) ${checkInYear} م`,
      وقت_الدخول: prop.checkInTimeText,
      تاريخ_الخروج: `${checkOutDayName} ${checkOutDayNum} ${checkOutMonthName} ( ${checkOutMonthNum} ) ${checkOutYear} م`,
      وقت_الخروج: prop.checkOutTimeText,
      المبلغ_الإجمالي: totalPrice,
      مبلغ_العربون: depositPaid,
      المبلغ_المتبقي: remainingAmount,
      مبلغ_التأمين: insuranceAmount,
      شروط_العقد: formattedContractTerms,
    });

    // If template did not include terms tag and no terms are present, ensure terms are present
    if (!contractText.includes('الشروط والأحكام') && !contractText.includes(formattedContractTerms)) {
      contractText += `\n📌 الشروط والأحكام:\n${formattedContractTerms}`;
    }

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      bookingNumber: `BK-2026-${100 + bookings.length + 1}`,
      propertyId,
      propertyName: effectivePropName,
      sectionId,
      sectionName,
      customerName,
      customerPhone,
      checkInDate,
      checkOutDate,
      nightsCount,
      nightlyPrice,
      totalPrice,
      taxAmount: 0,
      discount: 0,
      depositPaid,
      remainingAmount,
      insuranceAmount,
      depositReceiptUrl: receiptFileName,
      marketerId: effectiveMarketer?.id,
      marketerName: effectiveMarketer?.name,
      marketerCommission: commissionValue,
      commissionStatus: 'pending',
      status: 'confirmed',
      createdAt: new Date().toISOString().split('T')[0],
      notes: notes || `تم تأكيد الحجز بإرفاق الإيصال: ${receiptFileName}`,
      contractSigned: true,
      contractMessage: contractText,
      checkedOut: false,
      insuranceReturned: false,
    };

    setBookings((prev) => [newBooking, ...prev]);

    setDateOverrides((prev) => {
      const next = { ...prev };
      sortedDates.forEach((d) => {
        const key = `${propertyId}_${d}`;
        next[key] = {
          ...next[key],
          status: 'booked',
          waitingDepositExpiresAt: undefined,
          waitingCustomerName: undefined,
          waitingCustomerPhone: undefined,
          waitingDepositAmount: undefined,
        };
      });
      return next;
    });

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `🎉 تأكيد حجز جديد - ${prop.name}`,
        description: `تم تأكيد الحجز ${newBooking.bookingNumber} للعميل ${customerName} واستلام الإيصال (${receiptFileName}) وإرسال العقد عبر واتساب`,
        timestamp: 'الآن',
        read: false,
        type: 'deposit_confirmed',
        targetAudience: 'all',
        linkToBookingId: newBooking.id,
      },
      ...prev,
    ]);

    // Web Notification & Audio Chime & In-App Toast
    triggerBrowserNotification(
      `💰 تأكيد دفع عربون - ${prop.name}`,
      `تم استلام وتأكيد سداد العربون (${depositPaid} ريال) للعميل ${customerName} (${newBooking.bookingNumber}) واعتماد العقد!`,
      'deposit_confirmed'
    );

    const cleanPhone = customerPhone.replace(/\D/g, '').replace(/^0/, '966');
    const whatsappContractUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(contractText)}`;

    return { booking: newBooking, whatsappContractUrl, contractText };
  };

  const addBooking = (bookingData: {
    propertyId: PropertyId;
    customerName: string;
    customerPhone: string;
    customerNationalId?: string;
    sectionId?: string;
    sectionName?: string;
    checkInDate: string;
    checkOutDate: string;
    nightsCount: number;
    nightlyPrice: number;
    totalPrice: number;
    discount?: number;
    depositPaid?: number;
    remainingAmount?: number;
    insuranceAmount?: number;
    marketerId?: string;
    notes?: string;
  }): Booking => {
    const prop = properties.find((p) => p.id === bookingData.propertyId) || selectedProperty;
    const effectiveMarketerId = bookingData.marketerId || (isAdmin ? undefined : currentMarketerId);
    const effectiveMarketer = marketers.find((m) => m.id === effectiveMarketerId);

    const netTotal = bookingData.totalPrice - (bookingData.discount || 0);
    const commissionValue = effectiveMarketer ? Math.round(netTotal * 0.05) : 0;
    const dep = bookingData.depositPaid || prop.defaultDeposit;
    const rem = bookingData.remainingAmount !== undefined ? bookingData.remainingAmount : netTotal - dep;
    const ins = bookingData.insuranceAmount || prop.insuranceAmount;

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      bookingNumber: `BK-2026-${100 + bookings.length + 1}`,
      propertyId: bookingData.propertyId,
      propertyName: prop.name,
      sectionId: bookingData.sectionId,
      sectionName: bookingData.sectionName,
      customerName: bookingData.customerName,
      customerPhone: bookingData.customerPhone,
      customerNationalId: bookingData.customerNationalId || '10' + Math.floor(10000000 + Math.random() * 90000000),
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      nightsCount: bookingData.nightsCount,
      nightlyPrice: bookingData.nightlyPrice,
      totalPrice: netTotal,
      taxAmount: 0,
      discount: bookingData.discount || 0,
      depositPaid: dep,
      remainingAmount: rem,
      insuranceAmount: ins,
      marketerId: effectiveMarketer?.id,
      marketerName: effectiveMarketer?.name,
      marketerCommission: commissionValue,
      commissionStatus: 'pending',
      status: 'confirmed',
      createdAt: new Date().toISOString().split('T')[0],
      notes: bookingData.notes || '',
      contractSigned: true,
      checkedOut: false,
      insuranceReturned: false,
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Push notification to system notifications
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `🎉 حجز جديد - ${prop.name}`,
        description: `تم استلام حجز جديد برقم ${newBooking.bookingNumber} للعميل ${bookingData.customerName} بقيمة ${netTotal} ر.س`,
        timestamp: 'الآن',
        read: false,
        type: 'booking',
        targetAudience: 'all',
        linkToBookingId: newBooking.id,
      },
      ...prev,
    ]);

    // Web Notification & Audio Alert & In-App Toast
    triggerBrowserNotification(
      `🎉 استلام حجز جديد - ${prop.name}`,
      `تم استلام حجز جديد (${newBooking.bookingNumber}) للعميل ${bookingData.customerName} بقيمة ${netTotal} ر.س ومسوق: ${effectiveMarketer?.name || 'مباشر'}`,
      'booking'
    );

    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const nextCommissionStatus: CommissionStatus =
            status === 'completed' && b.marketerId ? 'ready_for_payout' : b.commissionStatus;
          return {
            ...b,
            status,
            commissionStatus: nextCommissionStatus,
          };
        }
        return b;
      })
    );
  };

  const cancelBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'cancelled');
  };

  const payMarketerCommission = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, commissionStatus: 'paid' } : b))
    );
  };

  const payoutAllMarketerCommissions = (marketerId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.marketerId === marketerId && (b.commissionStatus === 'ready_for_payout' || b.commissionStatus === 'pending')) {
          return { ...b, commissionStatus: 'paid' };
        }
        return b;
      })
    );
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetAllData = () => {
    localStorage.clear();
    setProperties(INITIAL_PROPERTIES);
    setMarketers(INITIAL_MARKETERS);
    setGuard(INITIAL_GUARD);
    setBookings(INITIAL_BOOKINGS);
    setDateOverrides({});
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setMessageTemplates(DEFAULT_MESSAGE_TEMPLATES);
    setUserRole('admin');
    setCurrentMarketerId('m1');
    setSelectedPropertyId('al-baylasan');
    setActiveTab('calendar');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        userRole,
        currentMarketerId,
        currentMarketer,
        guard,
        isAdmin,
        isGuard,
        activePermissions,
        switchUser,
        updateGuardProfile,
        userAccounts,
        currentUserAccount,
        loginWithGmailAndPassword,
        loginWithGoogleQuick,
        changePassword,
        updateUserAccount,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        canCreateContract,
        canEditDeposit,
        canViewCalendar,
        canViewProperties,
        canViewDashboard,
        canViewMarketers,
        canManageTemplates,
        canViewRentalContract,
        canViewActivityLogs,
        grantAllMarketersContractAndDepositPermissions,
        updateWaitingDepositAmount,
        properties,
        selectedPropertyId,
        selectedProperty,
        setSelectedPropertyId,
        updateProperty,
        updatePropertySection,
        togglePropertyPublished,
        marketers,
        updateMarketerPermissions,
        updateMarketerProfile,
        addMarketer,
        payMarketerCommission,
        payoutAllMarketerCommissions,
        bookings,
        filteredBookings,
        todayArrivals,
        todayDepartures,
        addBooking,
        updateBookingStatus,
        cancelBooking,
        sendCheckoutReminder,
        sendPaymentCompletionRequest,
        markCheckedOut,
        returnInsuranceDeposit,
        dateOverrides,
        setDateOverride,
        setDateOverridesBulk,
        applySeasonalPricingPattern,
        requestDeposit,
        cancelDepositWait,
        confirmBookingWithReceipt,
        notifications,
        filteredNotifications,
        unreadNotificationsCount,
        markNotificationsAsRead,
        activityLogs,
        bookingModalOpen,
        setBookingModalOpen,
        preselectedDateForBooking,
        setPreselectedDateForBooking,
        messageTemplates,
        updateMessageTemplates,
        resetMessageTemplates,
        templatesModalOpen,
        setTemplatesModalOpen,
        activeTemplateTab,
        openTemplatesModal,
        resetAllData,
        nowTimestamp,
        browserNotificationPermission,
        requestBrowserNotificationPermission,
        isSoundEnabled,
        toggleSound,
        activeToast,
        dismissToast,
        triggerBrowserNotification,
        sendTestNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
