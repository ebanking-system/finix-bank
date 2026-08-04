import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const getDashboardByRole = (role) => {
  switch (role) {
    case 'CUSTOMER':
      return '/customer/dashboard';
    case 'EMPLOYEE':
      return '/employee/dashboard';
    case 'MANAGER':
      return '/manager/dashboard';
    default:
      return '/login';
  }
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-slate-50">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-coral-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={getDashboardByRole(userRole)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
