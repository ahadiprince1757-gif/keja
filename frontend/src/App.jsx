import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage           from './pages/HomePage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import OwnerDashboard     from './pages/OwnerDashboard';
import StudentAccountPage from './pages/StudentAccountPage';
import AdminDashboard     from './pages/AdminDashboard';
import AuthGuard          from './components/AuthGuard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route
          path="/account"
          element={
            <AuthGuard>
              <StudentAccountPage />
            </AuthGuard>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <AuthGuard allowedRoles={['owner', 'super_admin']}>
              <OwnerDashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/admin/*"
          element={
            <AuthGuard allowedRoles={['super_admin']}>
              <AdminDashboard />
            </AuthGuard>
          }
        />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
