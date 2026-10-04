import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { CyberBackground } from "./components/CyberBackground";
import { ToastContainer } from "./components/ToastContainer";
import { SearchModal } from "./components/SearchModal";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// Admin pages
import { AdminLayout } from "./pages/admin/AdminLayout";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { LinksPage } from "./pages/admin/LinksPage";
import { CategoriesPage } from "./pages/admin/CategoriesPage";
import { AnalyticsPage } from "./pages/admin/AnalyticsPage";
import { SecurityLogsPage } from "./pages/admin/SecurityLogsPage";
import { SecurityCenterPage } from "./pages/admin/SecurityCenterPage";
import { BackupPage } from "./pages/admin/BackupPage";
import { SettingsPage } from "./pages/admin/SettingsPage";

import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { SettingsProvider } from "./context/SettingsContext";

const AppContent: React.FC = () => {
  const location = useLocation();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const isAdminRoute = location.pathname.startsWith("/admin") && location.pathname !== "/admin/login";

  return (
    <div className="flex flex-col min-h-screen text-[#E5E5E5] relative selection:bg-[#FF003C] selection:text-white">
      <CyberBackground />
      <ToastContainer />

      {!isAdminRoute && (
        <Navbar onOpenSearch={() => setSearchModalOpen(true)} />
      )}

      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="links" element={<LinksPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="logs" element={<SecurityLogsPage />} />
            <Route path="security" element={<SecurityCenterPage />} />
            <Route path="backups" element={<BackupPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}

      {/* Global Search hotkey modal trigger */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        links={[]}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <SettingsProvider>
            <AppContent />
          </SettingsProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
