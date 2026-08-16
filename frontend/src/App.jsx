import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustAccounts from './pages/customer/CustAccounts';
import Beneficiaries from './pages/customer/Beneficiaries';
import Cards from './pages/customer/Cards';
import Kyc from './pages/customer/Kyc';
import Loans from './pages/customer/Loans';
import CustTransactions from './pages/customer/CustTransactions';
import CustProfile from './pages/customer/CustProfile';
import FixedDeposits from './pages/customer/FixedDeposits';
import { Notifications } from './pages/customer/Placeholders';

// Employee & Manager Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import ManagerDashboard from './pages/manager/ManagerDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Customer Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/accounts" element={<CustAccounts />} />
            <Route path="/customer/beneficiaries" element={<Beneficiaries />} />
            <Route path="/customer/cards" element={<Cards />} />
            <Route path="/customer/kyc" element={<Kyc />} />
            <Route path="/customer/loans" element={<Loans />} />
            <Route path="/customer/transactions" element={<CustTransactions />} />
            <Route path="/customer/profile" element={<CustProfile />} />
            <Route path="/customer/fixed-deposits" element={<FixedDeposits />} />
            <Route path="/customer/notifications" element={<Notifications />} />
          </Route>

          {/* Employee Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/profile" element={<EmployeeProfile />} />
          </Route>

          {/* Manager Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/profile" element={<EmployeeProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

export default App;
