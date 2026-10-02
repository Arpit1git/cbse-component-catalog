import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import CatalogPage from './pages/CatalogPage';
import ComponentDetailPage from './pages/ComponentDetailPage';
import SubmitComponentPage from './pages/SubmitComponentPage';
import MyComponentsPage from './pages/MyComponentsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('catalog'); // 'catalog' | 'detail' | 'submit' | 'my-components' | 'admin' | 'login' | 'register'
  const [selectedComponentId, setSelectedComponentId] = useState(null);

  const handleSelectComponent = (id) => {
    setSelectedComponentId(id);
    setCurrentPage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (role) => {
    if (role === 'admin') {
      setCurrentPage('admin');
    } else if (role === 'contributor') {
      setCurrentPage('my-components');
    } else {
      setCurrentPage('catalog');
    }
  };

  return (
    <div className="min-h-screen bg-paper-bg text-paper-text flex flex-col font-sans selection:bg-paper-accentTint selection:text-paper-accent">
      {/* Top Navigation */}
      <Navbar
        activePage={currentPage}
        setActivePage={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSubmit={() => setCurrentPage('submit')}
      />

      {/* Main Page View */}
      <main className="flex-1">
        {currentPage === 'catalog' && (
          <CatalogPage
            onSelectComponent={handleSelectComponent}
            onOpenSubmit={() => setCurrentPage('submit')}
          />
        )}

        {currentPage === 'detail' && selectedComponentId && (
          <ComponentDetailPage
            componentId={selectedComponentId}
            onBack={() => setCurrentPage('catalog')}
            onNavigateSubmit={() => setCurrentPage('submit')}
          />
        )}

        {currentPage === 'submit' && (
          <SubmitComponentPage
            onNavigateCatalog={() => setCurrentPage('catalog')}
            onComponentCreated={(newId) => handleSelectComponent(newId)}
          />
        )}

        {currentPage === 'my-components' && (
          <MyComponentsPage
            onSelectComponent={handleSelectComponent}
            onOpenSubmit={() => setCurrentPage('submit')}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage
            onSelectComponent={handleSelectComponent}
          />
        )}

        {currentPage === 'login' && (
          <LoginPage
            onNavigateRegister={() => setCurrentPage('register')}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentPage === 'register' && (
          <RegisterPage
            onNavigateLogin={() => setCurrentPage('login')}
            onRegisterSuccess={handleLoginSuccess}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-paper-surface border-t border-paper-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-paper-muted">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-paper-text">🏛️ CBSE Component Catalog</span>
            <span>•</span>
            <span>Component-Based Software Engineering Architecture</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-2 py-0.5 rounded bg-paper-bg border border-paper-border font-mono text-[11px]">
              Palette: Paper & Ink
            </span>
            <span>SQLite Embedded Database</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
