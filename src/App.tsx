import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CalendarView } from './components/CalendarView';
import { BookingsView } from './components/BookingsView';
import { DashboardView } from './components/DashboardView';
import { MarketersView } from './components/MarketersView';
import { PropertiesView } from './components/PropertiesView';
import { MoreView } from './components/MoreView';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { NewBookingModal } from './components/NewBookingModal';
import { PropertyDetailsModal, ModalType } from './components/PropertyDetailsModal';
import { NotificationsModal } from './components/NotificationsModal';
import { TemplatesManagerModal } from './components/TemplatesManagerModal';
import { WebNotificationToast } from './components/WebNotificationToast';
import { PWAInstallModal } from './components/PWAInstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    templatesModalOpen,
    setTemplatesModalOpen,
    activeTemplateTab,
    canViewCalendar,
    canViewProperties,
    canViewDashboard,
    canViewMarketers,
  } = useApp();

  const {
    isInstallable,
    isInstalled,
    isIOS,
    isInstallModalOpen,
    setIsInstallModalOpen,
    install,
  } = usePWAInstall();

  // Redirect if current tab is hidden due to permissions
  useEffect(() => {
    if (activeTab === 'calendar' && !canViewCalendar) {
      setActiveTab('bookings');
    } else if (activeTab === 'properties' && !canViewProperties) {
      setActiveTab('bookings');
    } else if (activeTab === 'dashboard' && !canViewDashboard) {
      setActiveTab('bookings');
    } else if (activeTab === 'marketers' && !canViewMarketers) {
      setActiveTab('bookings');
    }
  }, [activeTab, canViewCalendar, canViewProperties, canViewDashboard, canViewMarketers, setActiveTab]);

  // Modals state
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [propertyModalType, setPropertyModalType] = useState<ModalType | null>(null);

  return (
    <div className="min-h-screen bg-[#F8F5FC] text-slate-900 flex flex-col font-['Tajawal',sans-serif] selection:bg-purple-200 selection:text-purple-900">
      {/* Top Header */}
      <Header
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Content Area - Mobile-Optimized Container */}
      <main className="flex-1 w-full max-w-3xl lg:max-w-4xl mx-auto animate-in fade-in duration-200">
        {activeTab === 'calendar' && (
          <CalendarView
            onOpenPropertyDetails={() => setPropertyModalType('details')}
            onOpenPhotos={() => setPropertyModalType('photos')}
            onOpenLocation={() => setPropertyModalType('location')}
            onOpenContract={() => setPropertyModalType('contract')}
          />
        )}

        {activeTab === 'bookings' && <BookingsView />}

        {activeTab === 'dashboard' && <DashboardView />}

        {activeTab === 'marketers' && <MarketersView />}

        {activeTab === 'properties' && <PropertiesView />}

        {activeTab === 'more' && (
          <MoreView
            onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
            onOpenContract={() => setPropertyModalType('contract')}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
          />
        )}
      </main>

      {/* Gathern Bottom Navigation */}
      <BottomNav />

      {/* Global Modals */}
      <WebNotificationToast />

      {/* PWA Mobile Download & Installation Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstall={install}
        isIOS={isIOS}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
      />

      <RoleSwitcherModal
        isOpen={roleSwitcherOpen}
        onClose={() => setRoleSwitcherOpen(false)}
      />

      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <NewBookingModal />

      <PropertyDetailsModal
        type={propertyModalType}
        onClose={() => setPropertyModalType(null)}
      />

      <TemplatesManagerModal
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        initialTab={activeTemplateTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
