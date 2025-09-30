
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { ToastContainer } from './components/Toast';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>セッションを確認中...</p></div>;
  }
  
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();
    
    // Don't render Header on the login page if user is not logged in.
    const showHeader = !loading && user;

    return (
        <div className="flex flex-col min-h-screen">
            {showHeader && <Header />}
            <main className="flex-grow">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <ToastContainer />
        </div>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
