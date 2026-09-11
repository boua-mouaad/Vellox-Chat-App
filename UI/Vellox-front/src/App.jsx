import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0B0F19] text-cyan-400">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0B0F19] text-cyan-400">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* OAuth2 Callback Route */}
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* Public Authentication Route */}
        <Route 
          path="/auth" 
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } 
        />
        
        {/* Protected Chat Route */}
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback to /chat if logged in, /auth if not */}
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
}