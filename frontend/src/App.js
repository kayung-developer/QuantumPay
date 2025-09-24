// FILE: frontend/src/App.js

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- Context Providers ---
import { AuthProvider } from './context/AuthContext';
import { AppearanceProvider } from './context/AppearanceContext';
import { CustomToaster } from './components/common/Toast';

// --- Common Components ---
import Spinner from './components/common/Spinner';
import ProtectedRoute from './components/utility/ProtectedRoute';
import PageWrapper from './components/layout/PageWrapper';
import AdminRoute from './components/utility/AdminRoute';

// --- Lazy-loaded Page Components ---
// Marketing & Auth
const HomePage = lazy(() => import('./pages/marketing/HomePage'));
const AboutPage = lazy(() => import('./pages/marketing/AboutPage'));
const SecurityPage = lazy(() => import('./pages/marketing/SecurityPage'));
const CareersPage = lazy(() => import('./pages/marketing/CareersPage'));
const ApiDocumentationPage = lazy(() => import('./pages/marketing/ApiDocumentationPage'));
const BlogPage = lazy(() => import('./pages/marketing/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/marketing/BlogPostPage'));
const PricingPage = lazy(() => import('./pages/marketing/PricingPage'));
const SupportPage = lazy(() => import('./pages/marketing/SupportPage'));
const SystemStatusPage = lazy(() => import('./pages/marketing/SystemStatusPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));

// Personal Dashboard
const DashboardHomePage = lazy(() => import('./pages/dashboard/DashboardHomePage'));
const WalletsPage = lazy(() => import('./pages/dashboard/WalletsPage'));
const TransactionsPage = lazy(() => import('./pages/dashboard/TransactionsPage'));
const DeveloperPage = lazy(() => import('./pages/dashboard/DeveloperPage'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'));
const CardDepositPage = lazy(() => import('./pages/dashboard/CardDepositPage'));
const ExchangePage = lazy(() => import('./pages/dashboard/ExchangePage'));
const GlobalTransferPage = lazy(() => import('./pages/dashboard/GlobalTransferPage'));
const WithdrawPage = lazy(() => import('./pages/dashboard/WithdrawPage'));
const MyExpensesPage = lazy(() => import('./pages/dashboard/MyExpensesPage'));
const BillerHubPage = lazy(() => import('./pages/dashboard/BillerHubPage'));
const SharedVaultsPage = lazy(() => import('./pages/dashboard/personal/SharedVaultsPage'));
const SmartUSSDPage = lazy(() => import('./pages/dashboard/SmartUSSDPage'));
const KYCCenterPage = lazy(() => import('./pages/dashboard/KYCCenterPage'));

// Business Dashboard
const BusinessDashboardPage = lazy(() => import('./pages/business/BusinessDashboardPage'));
const ExpenseApprovalPage = lazy(() => import('./pages/business/ExpenseApprovalPage'));
const InvoicingPage = lazy(() => import('./pages/business/InvoicingPage'));
const CreateInvoicePage = lazy(() => import('./pages/business/CreateInvoicePage'));
const PayrollPage = lazy(() => import('./pages/business/PayrollPage'));
const CorporateCardsPage = lazy(() => import('./pages/business/CorporateCardsPage'));
const BusinessSettingsPage = lazy(() => import('./pages/business/BusinessSettingsPage'));
const CashflowPage = lazy(() => import('./pages/business/CashflowPage'));

// Admin Panel
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageUsersPage = lazy(() => import('./pages/admin/ManageUsersPage'));
const KYCApprovalsPage = lazy(() => import('./pages/admin/KYCApprovalsPage'));
const LiveSupportPage = lazy(() => import('./pages/admin/LiveSupportPage'));
const ManageJobsPage = lazy(() => import('./pages/admin/ManageJobsPage'));
const ManageBlogPage = lazy(() => import('./pages/admin/ManageBlogPage'));

function App() {
  return (
    <AppearanceProvider>
      <AuthProvider>
        <Router>
          {/* [THE FIX] Wrap the adjacent components in a React Fragment */}
          <>
            <CustomToaster />
            {/* The Suspense component shows a fallback UI while lazy-loaded components are fetched. */}
            <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Spinner size="lg" /></div>}>
              <Routes>
                {/* --- Public Marketing & Auth Routes --- */}
                <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
                <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
                <Route path="/security" element={<PageWrapper><SecurityPage /></PageWrapper>} />
                <Route path="/careers" element={<PageWrapper><CareersPage /></PageWrapper>} />
                <Route path="/developers" element={<PageWrapper><ApiDocumentationPage /></PageWrapper>} />
                <Route path="/blog" element={<PageWrapper><BlogPage /></PageWrapper>} />
                <Route path="/blog/:postId" element={<PageWrapper><BlogPostPage /></PageWrapper>} />
                <Route path="/pricing" element={<PageWrapper><PricingPage /></PageWrapper>} />
                <Route path="/support" element={<PageWrapper><SupportPage /></PageWrapper>} />
                <Route path="/status" element={<PageWrapper><SystemStatusPage /></PageWrapper>} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* --- Personal Dashboard Routes --- */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardHomePage /></ProtectedRoute>} />
                <Route path="/dashboard/wallets" element={<ProtectedRoute><WalletsPage /></ProtectedRoute>} />
                <Route path="/dashboard/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
                <Route path="/dashboard/developer" element={<ProtectedRoute><DeveloperPage /></ProtectedRoute>} />
                <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/dashboard/deposit" element={<ProtectedRoute><CardDepositPage /></ProtectedRoute>} />
                <Route path="/dashboard/exchange" element={<ProtectedRoute><ExchangePage /></ProtectedRoute>} />
                <Route path="/dashboard/global-transfer" element={<ProtectedRoute><GlobalTransferPage /></ProtectedRoute>} />
                <Route path="/dashboard/withdraw" element={<ProtectedRoute><WithdrawPage /></ProtectedRoute>} />
                <Route path="/dashboard/my-expenses" element={<ProtectedRoute><MyExpensesPage /></ProtectedRoute>} />
                <Route path="/dashboard/pay-bills" element={<ProtectedRoute><BillerHubPage /></ProtectedRoute>} />
                <Route path="/dashboard/vaults" element={<ProtectedRoute><SharedVaultsPage /></ProtectedRoute>} />
                <Route path="/dashboard/ussd" element={<ProtectedRoute><SmartUSSDPage /></ProtectedRoute>} />
                <Route path="/dashboard/kyc" element={<ProtectedRoute><KYCCenterPage /></ProtectedRoute>} />

                {/* --- Business Dashboard Routes --- */}
                <Route path="/business/dashboard" element={<ProtectedRoute><BusinessDashboardPage /></ProtectedRoute>} />
                <Route path="/business/expenses" element={<ProtectedRoute><ExpenseApprovalPage /></ProtectedRoute>} />
                <Route path="/business/invoicing" element={<ProtectedRoute><InvoicingPage /></ProtectedRoute>} />
                <Route path="/business/invoicing/new" element={<ProtectedRoute><CreateInvoicePage /></ProtectedRoute>} />
                <Route path="/business/payroll" element={<ProtectedRoute><PayrollPage /></ProtectedRoute>} />
                <Route path="/business/cards" element={<ProtectedRoute><CorporateCardsPage /></ProtectedRoute>} />
                <Route path="/business/settings" element={<ProtectedRoute><BusinessSettingsPage /></ProtectedRoute>} />
                <Route path="/business/cashflow" element={<ProtectedRoute><CashflowPage /></ProtectedRoute>} />

                {/* --- Admin Panel Routes --- */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><ManageUsersPage /></AdminRoute>} />
                <Route path="/admin/kyc-approvals" element={<AdminRoute><KYCApprovalsPage /></AdminRoute>} />
                <Route path="/admin/support" element={<AdminRoute><LiveSupportPage /></AdminRoute>} />
                <Route path="/admin/jobs" element={<AdminRoute><ManageJobsPage /></AdminRoute>} />
                <Route path="/admin/blog" element={<AdminRoute><ManageBlogPage /></AdminRoute>} />

              </Routes>
            </Suspense>
          </>
          {/* [THE FIX] Close the React Fragment */}
        </Router>
      </AuthProvider>
    </AppearanceProvider>
  );
}

export default App;
