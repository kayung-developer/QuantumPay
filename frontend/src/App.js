import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Import layout components
import PageWrapper from './components/layout/PageWrapper';
import Spinner from './components/common/Spinner';
import { Toaster, toast, resolveValue } from 'react-hot-toast';

// Import custom route protection components (we will create these)
import ProtectedRoute from './components/utility/ProtectedRoute';
import AdminRoute from './components/utility/AdminRoute';



// =================================================================================
// LAZY LOADING PAGES
// This splits our code into smaller chunks, improving initial load time.
// Each page is only downloaded when the user navigates to it.
// =================================================================================

// Marketing Pages
const HomePage = lazy(() => import('./pages/marketing/HomePage'));
const AboutPage = lazy(() => import('./pages/marketing/AboutPage'));
const PricingPage = lazy(() => import('./pages/marketing/PricingPage'));
const SecurityPage = lazy(() => import('./pages/marketing/SecurityPage'));
const IntegrationsPage = lazy(() => import('./pages/marketing/IntegrationsPage'));
const CareersPage = lazy(() => import('./pages/marketing/CareersPage')); // NEW
const ManageJobsPage = lazy(() => import('./pages/admin/ManageJobsPage'));
const ManageBlogPage = lazy(() => import('./pages/admin/ManageBlogPage'));
const BlogPage = lazy(() => import('./pages/marketing/BlogPage')); // NEW
const BlogPostPage = lazy(() => import('./pages/marketing/BlogPostPage'));
const PressPage = lazy(() => import('./pages/marketing/PressPage')); // NEW
const SupportPage = lazy(() => import('./pages/marketing/SupportPage')); // NEW
const SystemStatusPage = lazy(() => import('./pages/marketing/SystemStatusPage')); // NEW
const ApiDocumentationPage = lazy(() => import('./pages/marketing/ApiDocumentationPage')); // NEW
const CookiePolicyPage = lazy(() => import('./pages/utility/CookiePolicyPage'));


// Authentication Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const PayInvoicePage = lazy(() => import('./pages/public/PayInvoicePage'));

// Dashboard Pages (Protected)
const DashboardHomePage = lazy(() => import('./pages/dashboard/DashboardHomePage'));
const WalletsPage = lazy(() => import('./pages/dashboard/WalletsPage'));
const TransactionsPage = lazy(() => import('./pages/dashboard/TransactionsPage'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'));
const DeveloperPage = lazy(() => import('./pages/dashboard/DeveloperPage'));

// --- [NEW] Business Pages ---
const BusinessDashboardPage = lazy(() => import('./pages/business/BusinessDashboardPage'));
//const TeamManagementPage = lazy(() => import('./pages/business/TeamManagementPage'));
const ExpenseApprovalPage = lazy(() => import('./pages/business/ExpenseApprovalPage'));
const InvoicingPage = lazy(() => import('./pages/business/InvoicingPage'));
const CreateInvoicePage = lazy(() => import('./pages/business/CreateInvoicePage'));
const PayrollPage = lazy(() => import('./pages/business/PayrollPage'));
const CorporateCardsPage = lazy(() => import('./pages/business/CorporateCardsPage'));
const BusinessSettingsPage = lazy(() => import('./pages/business/BusinessSettingsPage'));
const CashflowPage = lazy(() => import('./pages/business/CashflowPage'));


// User Pages
const SharedVaultsPage = lazy(() => import('./pages/dashboard/personal/SharedVaultsPage'));
const KYCCenterPage = lazy(() => import('./pages/dashboard/KYCCenterPage'));
const SmartUSSDPage = lazy(() => import('./pages/dashboard/SmartUSSDPage')); // NEW
const BillerHubPage = lazy(() => import('./pages/dashboard/BillerHubPage'));
const CardDepositPage = lazy(() => import('./pages/dashboard/CardDepositPage'));
const ExchangePage = lazy(() => import('./pages/dashboard/ExchangePage'));
const GlobalTransferPage = lazy(() => import('./pages/dashboard/GlobalTransferPage'));
const WithdrawPage = lazy(() => import('./pages/dashboard/WithdrawPage'));
const MyExpensesPage = lazy(() => import('./pages/dashboard/MyExpensesPage'));
// Admin Pages (Admin Protected)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageUsersPage = lazy(() => import('./pages/admin/ManageUsersPage'));
const KYCApprovalsPage = lazy(() => import('./pages/admin/KYCApprovalsPage'));
const LiveSupportPage = lazy(() => import('./pages/admin/LiveSupportPage'));

// Utility Pages
const NotFoundPage = lazy(() => import('./pages/utility/NotFoundPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/utility/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/utility/TermsOfServicePage'));



// [THE UPGRADE] A small, powerful sub-component to render the correct icon based on toast type.
const ToastIcon = ({ toast }) => {
  switch (toast.type) {
    case 'success':
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    case 'error':
      return <XCircleIcon className="h-6 w-6 text-red-500" />;
    case 'loading':
      // A simple spinner for loading state
      return (
        <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    default:
      return <InformationCircleIcon className="h-6 w-6 text-neutral-500" />;
  }
};

// [THE UPGRADE] A component to wrap the Toaster logic and access the theme context.
const ThemedToaster = () => {
    const { theme } = useAppearance(); // Hook to get the current theme (light/dark/system)

    return (
        <Toaster position="bottom-center" gutter={12}>
            {(t) => (
                <Transition
                    show={t.visible}
                    as={React.Fragment}
                    enter="transform ease-out duration-300 transition"
                    enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                    enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        // [THEME-AWARE] Dynamically sets light/dark mode classes
                        className={`max-w-sm w-full shadow-lg rounded-xl pointer-events-auto flex ring-1
                            ${theme === 'dark'
                                ? 'bg-neutral-800 ring-black ring-opacity-20 border border-neutral-700'
                                : 'bg-white ring-black ring-opacity-5 border border-neutral-200'
                            }`}
                    >
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <ToastIcon toast={t} />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
                                        {/* A simple title based on type */}
                                        {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                                    </p>
                                    <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'}`}>
                                        {/* This renders the message from your toast.success("...") call */}
                                        {resolveValue(t.message, t)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className={`flex border-l ${theme === 'dark' ? 'border-neutral-700' : 'border-neutral-200'}`}>
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Transition>
            )}
        </Toaster>
    );
};

function App() {
  return (
  <>
  <ThemedToaster />
    // The Suspense component shows a fallback UI (our Spinner) while lazy-loaded components are being fetched.
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Spinner size="lg" /></div>}>
      <Routes>
        {/* --- Public Marketing & Auth Routes --- */}
        <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
        <Route path="/pricing" element={<PageWrapper><PricingPage /></PageWrapper>} />
        <Route path="/security" element={<PageWrapper><SecurityPage /></PageWrapper>} />
        <Route path="/integrations" element={<PageWrapper><IntegrationsPage /></PageWrapper>} />
        <Route path="/careers" element={<PageWrapper><CareersPage /></PageWrapper>} /> {/* NEW */}
        <Route path="/blog" element={<PageWrapper><BlogPage /></PageWrapper>} /> {/* NEW */}
        <Route path="/blog/:postId" element={<PageWrapper><BlogPostPage /></PageWrapper>} />
        <Route path="/press" element={<PageWrapper><PressPage /></PageWrapper>} /> {/* NEW */}
        <Route path="/support" element={<PageWrapper><SupportPage /></PageWrapper>} /> {/* NEW */}
        <Route path="/status" element={<PageWrapper><SystemStatusPage /></PageWrapper>} /> {/* NEW */}
        <Route path="/developers" element={<PageWrapper><ApiDocumentationPage /></PageWrapper>} /> {/* NEW */}
        <Route path="/privacy-policy" element={<PageWrapper><PrivacyPolicyPage /></PageWrapper>} />
        <Route path="/terms-of-service" element={<PageWrapper><TermsOfServicePage /></PageWrapper>} />
        <Route path="/cookie-policy" element={<PageWrapper><CookiePolicyPage /></PageWrapper>} />



        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/invoice/pay/:invoiceId" element={<PayInvoicePage />} />

        {/* --- Protected User Dashboard Routes --- */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardHomePage /></ProtectedRoute>} />
        <Route path="/dashboard/wallets" element={<ProtectedRoute><WalletsPage /></ProtectedRoute>} />
        <Route path="/dashboard/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
        <Route path="/dashboard/developer" element={<ProtectedRoute><DeveloperPage /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

       <Route path="/business/dashboard" element={<ProtectedRoute><BusinessDashboardPage /></ProtectedRoute>} />
    <Route path="/business/expenses" element={<ProtectedRoute><ExpenseApprovalPage /></ProtectedRoute>} />
    <Route path="/business/invoicing" element={<ProtectedRoute><InvoicingPage /></ProtectedRoute>} />
    <Route path="/business/invoicing/new" element={<ProtectedRoute><CreateInvoicePage /></ProtectedRoute>} />
    <Route path="/business/payroll" element={<ProtectedRoute><PayrollPage /></ProtectedRoute>} />
    <Route path="/business/cards" element={<ProtectedRoute><CorporateCardsPage /></ProtectedRoute>} />
    <Route path="/business/settings" element={<ProtectedRoute><BusinessSettingsPage /></ProtectedRoute>} />
    <Route path="/business/cashflow" element={<ProtectedRoute><CashflowPage /></ProtectedRoute>} />

        <Route path="/dashboard/my-expenses" element={<ProtectedRoute><MyExpensesPage /></ProtectedRoute>} />
        <Route path="/dashboard/pay-bills" element={<ProtectedRoute><BillerHubPage /></ProtectedRoute>} />
        <Route path="/dashboard/fund-with-card" element={<ProtectedRoute><CardDepositPage /></ProtectedRoute>} />
        <Route path="/dashboard/exchange" element={<ProtectedRoute><ExchangePage /></ProtectedRoute>} />
        <Route path="/dashboard/global-transfer" element={<ProtectedRoute><GlobalTransferPage /></ProtectedRoute>} />
        <Route path="/dashboard/withdraw" element={<ProtectedRoute><WithdrawPage /></ProtectedRoute>} />
        <Route path="/dashboard/business/cards" element={<ProtectedRoute><CorporateCardsPage /></ProtectedRoute>} /> {/* NEW */}
        <Route path="/dashboard/business/cashflow" element={<ProtectedRoute><CashflowPage /></ProtectedRoute>} /> {/* NEW */}


        <Route path="/dashboard/vaults" element={<ProtectedRoute><SharedVaultsPage /></ProtectedRoute>} />
        <Route path="/dashboard/smart-ussd" element={<ProtectedRoute><SmartUSSDPage /></ProtectedRoute>} />
        <Route path="/dashboard/kyc" element={<ProtectedRoute><KYCCenterPage /></ProtectedRoute>} />
        {/* --- Protected Admin Routes --- */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><ManageUsersPage /></AdminRoute>} />
        <Route path="/admin/kyc-approvals" element={<AdminRoute><KYCApprovalsPage /></AdminRoute>} />
        <Route path="/admin/support" element={<AdminRoute><LiveSupportPage /></AdminRoute>} />
        <Route path="/admin/jobs" element={<AdminRoute><ManageJobsPage /></AdminRoute>} />
        <Route path="/admin/blog" element={<AdminRoute><ManageBlogPage /></AdminRoute>} />

        {/* --- Catch-all 404 Not Found Route --- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
    </>
  );
}


export default App;
